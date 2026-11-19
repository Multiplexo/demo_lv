// Tabellen im Browser lesen, ohne Fremdbibliothek: Excel (.xlsx/.xlsm), CSV und ZIP-Archive.
// ZIP-Einträge werden mit der eingebauten DecompressionStream('deflate-raw') entpackt.
const SHEET = (() => {
  const u16 = (b, o) => b[o] | b[o + 1] << 8;
  const u32 = (b, o) => (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0;

  // Liefert Map: Dateiname -> async () => Uint8Array
  function unzip(bytes) {
    let e = bytes.length - 22;
    while (e >= 0 && u32(bytes, e) !== 0x06054b50) e--;
    if (e < 0) throw new Error('keine gültige ZIP-Datei');
    const n = u16(bytes, e + 10);
    let p = u32(bytes, e + 16);
    const out = new Map();
    for (let i = 0; i < n; i++) {
      if (u32(bytes, p) !== 0x02014b50) throw new Error('ZIP-Verzeichnis beschädigt');
      const method = u16(bytes, p + 10), csize = u32(bytes, p + 20);
      const nlen = u16(bytes, p + 28), xlen = u16(bytes, p + 30), clen = u16(bytes, p + 32), off = u32(bytes, p + 42);
      const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + xlen + clen;
      out.set(name, async () => {
        const start = off + 30 + u16(bytes, off + 26) + u16(bytes, off + 28);
        const data = bytes.subarray(start, start + csize);
        if (method === 0) return data;
        if (method !== 8) throw new Error('ZIP-Kompression ' + method + ' wird nicht unterstützt');
        const ds = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(ds).arrayBuffer());
      });
    }
    return out;
  }

  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const kids = (el, n) => [...el.getElementsByTagNameNS('*', n)];
  const colIndex = ref => { let c = 0; for (const ch of ref.replace(/\d+/g, '')) c = c * 26 + ch.charCodeAt(0) - 64; return c - 1; };

  async function readXlsx(bytes) {
    const z = unzip(bytes), text = async n => z.has(n) ? new TextDecoder().decode(await z.get(n)()) : null;
    const wb = xml(await text('xl/workbook.xml') || '');
    const rels = xml(await text('xl/_rels/workbook.xml.rels') || '<r/>');
    const target = {};
    for (const r of kids(rels, 'Relationship')) target[r.getAttribute('Id')] = r.getAttribute('Target');
    const shared = [];
    const ss = await text('xl/sharedStrings.xml');
    if (ss) for (const si of kids(xml(ss), 'si')) shared.push(kids(si, 't').map(t => t.textContent).join(''));
    const sheets = [];
    for (const s of kids(wb, 'sheet')) {
      const rid = s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id');
      let t = target[rid] || ''; t = t.startsWith('/') ? t.slice(1) : 'xl/' + t.replace(/^\.\//, '');
      const raw = await text(t);
      if (!raw) continue;
      const rows = [];
      for (const row of kids(xml(raw), 'row')) {
        const r = [];
        for (const c of kids(row, 'c')) {
          const type = c.getAttribute('t'), v = kids(c, 'v')[0]?.textContent ?? '';
          let val = type === 's' ? shared[+v] ?? '' : type === 'inlineStr' ? kids(c, 't').map(x => x.textContent).join('') : type === 'b' ? (v === '1' ? 'WAHR' : 'FALSCH') : v;
          // ganze Zahlen ohne „.0“ (z. B. Postleitzahlen)
          if (!type && /^-?\d+\.0+$/.test(val)) val = val.replace(/\.0+$/, '');
          r[colIndex(c.getAttribute('r') || 'A1')] = String(val).trim();
        }
        rows[(+row.getAttribute('r') || rows.length + 1) - 1] = Array.from(r, x => x ?? '');
      }
      sheets.push({ name: s.getAttribute('name'), rows: Array.from(rows, x => x || []) });
    }
    return sheets;
  }

  function readCsv(bytes) {
    let text = new TextDecoder('utf-8').decode(bytes);
    if (text.includes('�')) text = new TextDecoder('windows-1252').decode(bytes); // Excel-CSV unter Windows
    text = text.replace(/^﻿/, '');
    const first = text.split(/\r?\n/)[0];
    const sep = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0];
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell.trim()); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
    return [{ name: 'CSV', rows: rows.filter(r => r.some(x => x)) }];
  }

  // Datei -> [{name, rows: [[zelle, ...], ...]}]
  async function read(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (/\.(xlsx|xlsm)$/i.test(file.name)) return readXlsx(bytes);
    if (/\.(csv|txt)$/i.test(file.name)) return readCsv(bytes);
    if (/\.xls$/i.test(file.name)) throw new Error('Das alte Excel-Format .xls wird nicht unterstützt. Bitte in Excel als .xlsx oder .csv speichern.');
    throw new Error('Bitte eine .xlsx-, .xlsm- oder .csv-Datei wählen.');
  }

  return { read, unzip, readXlsx, readCsv };
})();
