'use strict';
// Kunden-Onboarding: sammelt alles, was die Gewerke-Anfragen-App für ein neues Unternehmen braucht,
// und erzeugt daraus das Kundenpaket (kunden/<kurzname>/…) und die fertige App als eine HTML-Datei.
// Alles läuft im Browser; Dateien werden nicht hochgeladen.

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uniq = a => [...new Set(a)];

// ------------------------------------------------------------ Entwurf
const KEY = 'onb.entwurf';
const blank = () => ({
  name: '', slug: '', logo: '', favicon: '', farben: { primaer: '#1f4e79', akzent: '#e8772e' }, login: '',
  sperre: { text: 'nicht mehr anfragen', bis: new Date().getFullYear() + '-12-31' },
  gewerke: [], alias: {}, ignore: [], kw: [], vorlagen: [], // vorlagen: geladene Vorlagen-IDs (für Stichwörter)
  lieferanten: { datei: '', firms: [], mapping: null },
  pakete: [], // {id, label, lv, datei, codes:{code:n}, corpus:[[text, codes, kat, id, kurz]]}
});
let K = (() => { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { return blank(); } })();
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(K)); $('#saveState').textContent = 'Entwurf in diesem Browser gespeichert'; }
    catch (e) { $('#saveState').textContent = 'Entwurf zu groß zum Zwischenspeichern – bitte Kundenpaket herunterladen'; }
  }, 300);
}

const slugify = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/\b(gmbh|ag|kg|co|se|mbh|gbr|ohg|ug)\b/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const gwCodes = () => K.gewerke.map(g => g.code);
const normCode = c => K.alias[c] || c;
const known = c => gwCodes().includes(normCode(c));

// ------------------------------------------------------------ Schritte
const STEPS = [
  ['Unternehmen', () => !!(K.name && K.slug)],
  ['Gewerke', () => K.gewerke.length > 0],
  ['Lieferanten', () => K.lieferanten.firms.length > 0],
  ['Beispiel-Ausschreibungen', () => K.pakete.length > 0],
  ['Stichwörter', () => K.kw.length > 0],
  ['Prüfen & erzeugen', () => false],
];
let step = 0;
function renderSteps() {
  $('#steps').innerHTML = STEPS.map(([t, done], i) =>
    `<button data-i="${i}" class="${i === step ? 'on' : ''} ${done() ? 'done' : ''}"><span class="n">${done() && i !== step ? '✓' : i + 1}</span>${t}</button>`).join('');
  $$('#steps button').forEach(b => b.onclick = () => go(+b.dataset.i));
}
function go(i) { step = i; render(); window.scrollTo(0, 0); }
function foot(html) { $('#foot').innerHTML = html; }
function nav(nextLabel) {
  foot(`${step ? '<button class="s" id="prev">Zurück</button>' : ''}<button class="b" id="next">${nextLabel || 'Weiter'}</button>`);
  if ($('#prev')) $('#prev').onclick = () => go(step - 1);
  $('#next').onclick = () => go(step + 1);
}
function render() {
  renderSteps();
  [renderFirma, renderGewerke, renderLieferanten, renderPakete, renderKw, renderCheck][step]();
}

// ------------------------------------------------------------ 1. Unternehmen
function preview() {
  const p = K.farben.primaer, a = K.farben.akzent;
  return `<div class="pv" style="--pp:${esc(p)};--pa:${esc(a)}">
    <div class="hd">${K.logo ? `<img src="${esc(K.logo)}" alt="">` : `<span class="nm">${esc(K.name || 'Firmenname')}</span>`}<span class="t">Gewerke-Anfragen<i>PoC</i></span></div>
    <div class="bd"><span class="st on">1 LV einlesen</span><span class="st">2 Leistungen &amp; Gewerke</span><span class="st">3 Baustelle</span><span class="bt">Weiter</span></div></div>`;
}
function renderFirma() {
  $('#step').innerHTML = `
  <div class="card"><h2>Unternehmen</h2>
    <p class="mut" style="margin-top:0">Name, Logo und Farben erscheinen in der App des Kunden. Alle Angaben lassen sich später ändern.</p>
    <div class="grid2">
      <label class="f">Firmenname<input type="text" id="fName" value="${esc(K.name)}" placeholder="z. B. Musterbau GmbH"></label>
      <label class="f">Kurzname <span class="h">für Ordner, Dateinamen und Speicher im Browser; nur a–z, 0–9 und -</span><input type="text" id="fSlug" value="${esc(K.slug)}" placeholder="musterbau"></label>
      <label class="f">Benutzername für den Login <span class="h">beim Betrieb als Docker-Container; das Passwort wird erst dort gesetzt</span><input type="text" id="fLogin" value="${esc(K.login)}" placeholder="${esc(K.slug || 'kunde')}"></label>
    </div>
    <h3>Logo und Favicon</h3>
    <div class="row">
      <div class="logoBox">${K.logo ? `<img src="${esc(K.logo)}" alt="Logo">` : '<span class="mut">kein Logo</span>'}</div>
      <label class="s">Logo wählen<input type="file" id="fLogo" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></label>
      ${K.logo ? '<button class="s" id="fLogoDel">Logo entfernen</button>' : ''}
      <span class="sp"></span>
      <div class="logoBox">${K.favicon ? `<img src="${esc(K.favicon)}" alt="Favicon" style="max-height:32px">` : '<span class="mut small">Favicon: wie Logo</span>'}</div>
      <label class="s">Favicon wählen<input type="file" id="fFav" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></label>
      ${K.favicon ? '<button class="s" id="fFavDel">Favicon entfernen</button>' : ''}
    </div>
    <p class="mut small">PNG, JPG, SVG oder WebP. Ein breites Logo mit transparentem Hintergrund wirkt am besten. Als Favicon eignet sich die Bildmarke allein.</p>
    <h3>Farben</h3>
    <div class="row">
      <label class="f">Primärfarbe<span class="row"><input type="color" id="fP" value="${esc(K.farben.primaer)}"><input type="text" id="fPh" value="${esc(K.farben.primaer)}" size="9"></span></label>
      <label class="f">Akzentfarbe<span class="row"><input type="color" id="fA" value="${esc(K.farben.akzent)}"><input type="text" id="fAh" value="${esc(K.farben.akzent)}" size="9"></span></label>
      ${K.logo ? '<button class="s" id="fFromLogo" style="align-self:flex-end">Farben aus dem Logo übernehmen</button>' : ''}
    </div>
    <h3>Vorschau</h3>
    <div id="pv">${preview()}</div>
  </div>`;
  const upd = () => { $('#pv').innerHTML = preview(); save(); renderSteps(); };
  $('#fName').oninput = e => {
    const auto = !K.slug || K.slug === slugify(K.name);
    K.name = e.target.value.trim();
    if (auto) { K.slug = slugify(K.name); $('#fSlug').value = K.slug; $('#fLogin').placeholder = K.slug || 'kunde'; }
    upd();
  };
  $('#fSlug').oninput = e => { K.slug = slugify(e.target.value); upd(); };
  $('#fSlug').onblur = e => { e.target.value = K.slug; };
  $('#fLogin').oninput = e => { K.login = e.target.value.trim().replace(/[^\w.-]/g, ''); save(); };
  const color = (pick, hex, key) => {
    $(pick).oninput = e => { K.farben[key] = e.target.value; $(hex).value = e.target.value; upd(); };
    $(hex).oninput = e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { K.farben[key] = e.target.value; $(pick).value = e.target.value; upd(); } };
  };
  color('#fP', '#fPh', 'primaer'); color('#fA', '#fAh', 'akzent');
  const img = (sel, key) => $(sel).onchange = async e => { const f = e.target.files[0]; if (f) { K[key] = await imageData(f); save(); renderFirma(); } };
  img('#fLogo', 'logo'); img('#fFav', 'favicon');
  if ($('#fLogoDel')) $('#fLogoDel').onclick = () => { K.logo = ''; save(); renderFirma(); };
  if ($('#fFavDel')) $('#fFavDel').onclick = () => { K.favicon = ''; save(); renderFirma(); };
  if ($('#fFromLogo')) $('#fFromLogo').onclick = async () => {
    const c = await logoColors(K.logo);
    if (c[0]) K.farben.primaer = c[0];
    if (c[1]) K.farben.akzent = c[1];
    save(); renderFirma();
  };
  nav();
}
// Bild als data-URL; große Rasterbilder werden auf 600 px Breite verkleinert
async function imageData(file) {
  const url = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(file); });
  if (/svg/.test(file.type)) return url;
  const im = await loadImg(url);
  if (im.naturalWidth <= 600) return url;
  const c = document.createElement('canvas'); c.width = 600; c.height = Math.round(im.naturalHeight * 600 / im.naturalWidth);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}
const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
// Die zwei prägendsten bunten Farben des Logos (häufig und gesättigt, ohne Weiß/Grau)
async function logoColors(src) {
  const im = await loadImg(src), c = document.createElement('canvas');
  c.width = 120; c.height = Math.max(1, Math.round(120 * im.naturalHeight / im.naturalWidth));
  const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data, bins = new Map();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    const [r, g, b] = [d[i], d[i + 1], d[i + 2]], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0;
    if (sat < 0.25 || mx < 40) continue;
    const k = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
    const e = bins.get(k) || { n: 0, r: 0, g: 0, b: 0, sat };
    e.n++; e.r += r; e.g += g; e.b += b; bins.set(k, e);
  }
  const hex = e => '#' + [e.r, e.g, e.b].map(v => Math.round(v / e.n).toString(16).padStart(2, '0')).join('');
  const hue = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn || 1;
    return (mx === r ? (g - b) / dd : mx === g ? 2 + (b - r) / dd : 4 + (r - g) / dd) * 60 % 360; };
  const list = [...bins.values()].sort((a, b) => b.n * (b.sat + .3) - a.n * (a.sat + .3)).map(hex);
  const first = list[0], second = list.find(h => { const dh = Math.abs(hue(h) - hue(first)); return Math.min(dh, 360 - dh) > 40; });
  return [first, second];
}

// ------------------------------------------------------------ 2. Gewerke
function renderGewerke() {
  const used = new Map();
  K.pakete.forEach(p => Object.entries(p.codes).forEach(([c, n]) => used.set(normCode(c), (used.get(normCode(c)) || 0) + n)));
  const arten = uniq(K.lieferanten.firms.flatMap(f => f.arten));
  const nArten = g => arten.filter(a => matchArt(g, a)).length;
  $('#step').innerHTML = `
  <div class="card"><h2>Gewerke</h2>
    <p class="mut" style="margin-top:0">Je Gewerk (bzw. Vergabeeinheit) ein <b>Kürzel</b> (so beginnen die Dateinamen der Anfragen, z. B. <code>HOLZ_&lt;LV&gt;.D83</code>), ein Name,
    Stichwörter, an denen die passenden Einträge der Spalte „Art der Arbeiten“ in der Lieferantenliste erkannt werden, Stichwörter in <b>Abschnittstiteln</b> des LV
    (z. B. „Holzrahmenbau“, „KG 420“: alle Positionen darunter gehen an dieses Gewerk) und der übliche Umkreis in km.</p>
    <div class="row" style="margin-bottom:10px">
      <select id="gVSel">${VORLAGEN.map(v => `<option value="${esc(v.id)}">${esc(v.name)} (${v.gewerke.length} Gewerke)</option>`).join('')}</select>
      <button class="s" id="gVorlage">Vorlage laden</button>
      ${K.gewerke.length ? '<button class="s" id="gVorlagePlus" title="Gewerke der Vorlage hinzufügen, vorhandene Kürzel bleiben unverändert">zu den vorhandenen hinzufügen</button>' : ''}
      <button class="s" id="gAdd">+ Gewerk</button>
      <span class="mut small">${K.gewerke.length} Gewerke${arten.length ? ` · ${arten.length} Arten der Arbeiten aus der Lieferantenliste` : ''}</span>
    </div>
    <div class="scroll"><table>
      <tr><th style="width:110px">Kürzel</th><th style="width:220px">Name</th><th>Stichwörter Art der Arbeiten (mit Komma)</th><th>Stichwörter in Abschnittstiteln</th><th style="width:80px">Umkreis km</th>${arten.length ? '<th style="width:70px">Arten</th>' : ''}${used.size ? '<th style="width:80px">in Beispielen</th>' : ''}<th style="width:30px"></th></tr>
      ${K.gewerke.map((g, i) => `<tr>
        <td><input type="text" data-i="${i}" data-f="code" value="${esc(g.code)}"></td>
        <td><input type="text" data-i="${i}" data-f="name" value="${esc(g.name)}"></td>
        <td><input type="text" data-i="${i}" data-f="stichwoerter" value="${esc(g.stichwoerter.join(', '))}"></td>
        <td><input type="text" data-i="${i}" data-f="titel" value="${esc((g.titel || []).join(', '))}"></td>
        <td><input type="number" data-i="${i}" data-f="radius" value="${g.radius}" min="5" max="1000"></td>
        ${arten.length ? `<td><span class="badge ${nArten(g) ? 'ok' : 'warn'}">${nArten(g)}</span></td>` : ''}
        ${used.size ? `<td>${used.get(g.code) ? `<span class="badge ok">${used.get(g.code)}</span>` : ''}</td>` : ''}
        <td><button class="x" data-del="${i}" title="Gewerk löschen">×</button></td></tr>`).join('')}
    </table></div>
    ${K.gewerke.length ? '' : '<p class="mut">Noch keine Gewerke. Am schnellsten mit der Vorlage beginnen und dann anpassen.</p>'}
    <h3>Abweichende Kürzel</h3>
    <p class="mut small" style="margin-top:0">Falls in alten Dateinamen andere Kürzel vorkommen (z. B. <code>MAR_</code> statt <code>MARK_</code>), hier zuordnen.</p>
    <table style="max-width:520px">
      <tr><th>Kürzel in Dateinamen</th><th>gehört zu Gewerk</th><th></th></tr>
      ${Object.entries(K.alias).map(([a, c]) => `<tr><td><code>${esc(a)}</code></td><td>${esc(c)} · ${esc(K.gewerke.find(g => g.code === c)?.name || 'unbekannt')}</td><td><button class="x" data-adel="${esc(a)}">×</button></td></tr>`).join('')}
      <tr><td><input type="text" id="aFrom" placeholder="z. B. MAR"></td><td><select id="aTo">${K.gewerke.map(g => `<option value="${esc(g.code)}">${esc(g.code)} · ${esc(g.name)}</option>`).join('')}</select></td><td><button class="s" id="aAdd">+</button></td></tr>
    </table>
  </div>`;
  $$('#step input[data-i]').forEach(inp => inp.oninput = () => {
    const g = K.gewerke[+inp.dataset.i], f = inp.dataset.f, v = inp.value;
    if (f === 'code') g.code = v.toUpperCase().replace(/[^A-ZÄÖÜ0-9]/g, '');
    else if (f === 'stichwoerter' || f === 'titel') g[f] = v.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    else if (f === 'radius') g.radius = Math.max(5, +v || 100);
    else g.name = v;
    save(); renderSteps();
  });
  $$('#step input[data-f="code"]').forEach(inp => inp.onblur = () => { inp.value = K.gewerke[+inp.dataset.i].code; });
  $$('[data-del]').forEach(b => b.onclick = () => { K.gewerke.splice(+b.dataset.del, 1); save(); renderGewerke(); });
  $$('[data-adel]').forEach(b => b.onclick = () => { delete K.alias[b.dataset.adel]; save(); renderGewerke(); });
  $('#aAdd').onclick = () => { const a = $('#aFrom').value.trim().toUpperCase(); if (a && $('#aTo').value) { K.alias[a] = $('#aTo').value; save(); renderGewerke(); } };
  $('#gAdd').onclick = () => { K.gewerke.push({ code: 'NEU' + (K.gewerke.length + 1), name: '', stichwoerter: [], titel: [], radius: 100 }); save(); renderGewerke(); };
  const vorlage = () => VORLAGEN.find(v => v.id === $('#gVSel').value);
  $('#gVorlage').onclick = () => {
    const V = vorlage();
    if (K.gewerke.length && !confirm(`Vorhandene Gewerke durch die Vorlage „${V.name}“ ersetzen?`)) return;
    K.gewerke = JSON.parse(JSON.stringify(V.gewerke)); K.alias = { ...V.alias }; K.vorlagen = [V.id];
    if (!K.kw.length) K.kw = JSON.parse(JSON.stringify(V.kw));
    save(); renderGewerke();
  };
  // Vorlagen kombinieren (z. B. GU mit eigener Tiefbau-Sparte): nur neue Kürzel kommen dazu
  if ($('#gVorlagePlus')) $('#gVorlagePlus').onclick = () => {
    const V = vorlage(), have = new Set(gwCodes());
    const neu = V.gewerke.filter(g => !have.has(g.code));
    K.gewerke.push(...JSON.parse(JSON.stringify(neu)));
    for (const [a, c] of Object.entries(V.alias)) if (!(a in K.alias) && !have.has(a)) K.alias[a] = c;
    if (!K.vorlagen.includes(V.id)) K.vorlagen.push(V.id);
    save(); renderGewerke();
    alert(`${neu.length} Gewerke hinzugefügt` + (V.gewerke.length > neu.length ? `, ${V.gewerke.length - neu.length} Kürzel gab es schon` : '') + '.');
  };
  nav();
}
const matchArt = (g, art) => { const a = art.toLowerCase(); return g.stichwoerter.some(w => w && a.includes(w)); };

// ------------------------------------------------------------ 3. Lieferanten
const FIELDS = [
  ['firma', 'Firma', /firma|unternehmen|firmenname|lieferant|^name$/],
  ['art', 'Art der Arbeiten', /art der|arbeiten|leistung|gewerk|tätigkeit|kategorie|branche/],
  ['bem', 'Bemerkung / Hinweis', /bemerk|hinweis|notiz|kommentar|status|info/],
  ['mail', 'E-Mail', /mail/],
  ['tel', 'Telefon', /^tel|telefon|phone|fon$/],
  ['str', 'Straße', /stra(ß|ss)e|adresse|anschrift/],
  ['plz', 'PLZ', /plz|postleit/],
  ['ort', 'Ort', /^ort|stadt|^ort$/],
  ['name', 'Ansprechpartner', /ansprech|kontakt/],
  ['mobil', 'Mobil', /mobil|handy/],
  ['www', 'Internet', /www|internet|web|homepage/],
];
let sheets = null; // nur während der Sitzung: gelesene Tabellen der Lieferantenliste
function guessMapping(header) {
  const m = {}, taken = new Set();
  for (const [k, , re] of FIELDS) {
    const i = header.findIndex((h, j) => !taken.has(j) && re.test(String(h).toLowerCase()) && !(k === 'firma' && /ansprech/i.test(h)) && !(k === 'tel' && /mobil|fax/i.test(h)));
    if (i >= 0) { m[k] = i; taken.add(i); }
  }
  return m;
}
function renderLieferanten() {
  const L = K.lieferanten, M = L.mapping;
  const sh = sheets && M ? sheets[M.sheet] : null;
  const header = sh ? sh.rows[M.headerRow] || [] : [];
  const opts = sel => `<option value="">–</option>` + header.map((h, i) => `<option value="${i}" ${sel === i ? 'selected' : ''}>${esc(h || 'Spalte ' + (i + 1))}</option>`).join('');
  const st = stats();
  $('#step').innerHTML = `
  <div class="card"><h2>Lieferanten- und NU-Liste</h2>
    <p class="mut" style="margin-top:0">Excel (.xlsx, .xlsm) oder CSV. Eine Zeile je Firma oder je Firma und Art der Arbeiten – beides geht. Die Datei wird nur in diesem Browser gelesen.</p>
    <div class="drop" id="lDrop">Lieferantenliste hier ablegen</div>
    <div class="row" style="margin-top:8px"><label class="s">Datei wählen<input type="file" id="lIn" accept=".xlsx,.xlsm,.csv,.txt" hidden></label>
      ${L.datei ? `<span class="mut small">Zuletzt übernommen: <b>${esc(L.datei)}</b> · ${L.firms.length} Firmen</span>` : ''}</div>
    <div id="lMsg" class="msg"></div>
  </div>
  ${sh ? `<div class="card"><h2>Spalten zuordnen</h2>
    <div class="row">
      ${sheets.length > 1 ? `<label class="f">Tabellenblatt<select id="mSheet">${sheets.map((s, i) => `<option value="${i}" ${i === M.sheet ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>` : ''}
      <label class="f">Überschriften in Zeile<input type="number" id="mHead" value="${M.headerRow + 1}" min="1" max="20" style="width:80px"></label>
      <label class="f">Mehrere Arten in einer Zelle getrennt durch<input type="text" id="mSplit" value="${esc(M.split)}" style="width:80px"><span class="h">z. B. ; (leer = nicht trennen)</span></label>
    </div>
    <div class="grid2" style="margin-top:10px">${FIELDS.map(([k, t]) => `<label class="f">${t}${k === 'firma' || k === 'art' ? ' *' : ''}${k === 'plz' ? ' <span class="h">für die Entfernung zur Baustelle</span>' : ''}<select data-m="${k}">${opts(M[k])}</select></label>`).join('')}</div>
    <h3>Vorschau (erste 5 Zeilen)</h3>
    <div class="scroll" style="max-height:220px"><table><tr>${FIELDS.filter(([k]) => M[k] != null).map(([, t]) => `<th>${t}</th>`).join('')}</tr>
      ${sh.rows.slice(M.headerRow + 1, M.headerRow + 6).map(r => `<tr>${FIELDS.filter(([k]) => M[k] != null).map(([k]) => `<td class="small">${esc(r[M[k]])}</td>`).join('')}</tr>`).join('')}</table></div>
    <div class="row" style="margin-top:12px"><button class="b" id="mApply" ${M.firma == null || M.art == null ? 'disabled' : ''}>Lieferanten übernehmen</button><span class="mut small">Firma und Art der Arbeiten sind Pflicht.</span></div>
  </div>` : ''}
  <div class="card"><h2>Gesperrte Firmen</h2>
    <p class="mut" style="margin-top:0">Steht dieser Text in der Bemerkung einer Firma, ist sie in der App vorab gesperrt.</p>
    <div class="row"><label class="f">Text in der Bemerkung<input type="text" id="sText" value="${esc(K.sperre.text)}" placeholder="z. B. nicht mehr anfragen"></label>
      <label class="f">Sperre gilt bis<input type="date" id="sBis" value="${esc(K.sperre.bis)}"></label>
      ${L.firms.length ? `<span class="badge" style="align-self:flex-end">${st.gesperrt} Firmen betroffen</span>` : ''}</div>
  </div>
  ${L.firms.length ? `<div class="card"><h2>Ergebnis</h2>
    <div class="kpis">
      <div class="kpi"><b>${L.firms.length}</b>Firmen</div>
      <div class="kpi"><b>${st.arten.length}</b>Arten der Arbeiten</div>
      <div class="kpi"><b>${L.firms.length - st.ohneGeo}</b>mit PLZ verortet${st.ohneGeo ? ` <span class="badge warn">${st.ohneGeo} ohne</span>` : ''}</div>
      <div class="kpi"><b>${st.arten.length - st.frei.length}</b>Arten einem Gewerk zugeordnet</div>
    </div>
    ${st.frei.length ? `<h3>Arten ohne Gewerk (${st.frei.length})</h3>
      <p class="mut small" style="margin-top:0">Firmen mit diesen Arten erscheinen in keinem Gewerk. Ein Gewerk wählen fügt die Art dort als Stichwort hinzu.</p>
      <div class="scroll" style="max-height:300px"><table><tr><th>Art der Arbeiten</th><th style="width:70px">Firmen</th><th style="width:280px">zu Gewerk</th></tr>
      ${st.frei.map(([a, n]) => `<tr><td>${esc(a)}</td><td>${n}</td><td><select data-art="${esc(a)}"><option value="">–</option>${K.gewerke.map((g, i) => `<option value="${i}">${esc(g.code)} · ${esc(g.name)}</option>`).join('')}</select></td></tr>`).join('')}</table></div>` : '<p class="msg ok">Alle Arten der Arbeiten sind einem Gewerk zugeordnet.</p>'}
  </div>` : ''}`;
  const drop = $('#lDrop');
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) readList(e.dataTransfer.files[0]); };
  $('#lIn').onchange = e => e.target.files[0] && readList(e.target.files[0]);
  if (sh) {
    if ($('#mSheet')) $('#mSheet').onchange = e => { const s = +e.target.value; Object.assign(M, { sheet: s, headerRow: headerRow(sheets[s].rows) }, guessMapping(sheets[s].rows[headerRow(sheets[s].rows)] || [])); renderLieferanten(); };
    $('#mHead').onchange = e => { M.headerRow = Math.max(0, (+e.target.value || 1) - 1); FIELDS.forEach(([k]) => delete M[k]); Object.assign(M, guessMapping(sh.rows[M.headerRow] || [])); renderLieferanten(); };
    $('#mSplit').oninput = e => { M.split = e.target.value; };
    $$('[data-m]').forEach(s => s.onchange = () => { M[s.dataset.m] = s.value === '' ? null : +s.value; renderLieferanten(); });
    $('#mApply').onclick = () => { applyList(); renderLieferanten(); };
  }
  $('#sText').oninput = e => { K.sperre.text = e.target.value; save(); };
  $('#sText').onchange = () => renderLieferanten();
  $('#sBis').oninput = e => { K.sperre.bis = e.target.value; save(); };
  $$('[data-art]').forEach(s => s.onchange = () => {
    const g = K.gewerke[+s.value]; if (!g) return;
    const w = s.dataset.art.toLowerCase(); if (!g.stichwoerter.includes(w)) g.stichwoerter.push(w);
    save(); renderLieferanten();
  });
  nav();
}
function headerRow(rows) {
  // erste Zeile mit mindestens zwei ausgefüllten Textzellen
  const i = rows.findIndex(r => r.filter(x => x && isNaN(x)).length >= 2);
  return i < 0 ? 0 : i;
}
async function readList(file) {
  const msg = t => { $('#lMsg').className = 'msg'; $('#lMsg').textContent = t; };
  msg('lese ' + file.name + ' …');
  try {
    sheets = await SHEET.read(file);
    if (!sheets.length || !sheets.some(s => s.rows.length > 1)) throw new Error('keine Zeilen gefunden');
    const s = Math.max(0, sheets.findIndex(x => x.rows.length > 1)), hr = headerRow(sheets[s].rows);
    K.lieferanten.mapping = { sheet: s, headerRow: hr, split: ';', datei: file.name, ...guessMapping(sheets[s].rows[hr] || []) };
    renderLieferanten();
  } catch (e) { $('#lMsg').className = 'msg err'; $('#lMsg').textContent = file.name + ': ' + e.message; }
}
function applyList() {
  const M = K.lieferanten.mapping, rows = sheets[M.sheet].rows.slice(M.headerRow + 1);
  const cell = (r, k) => M[k] == null ? '' : String(r[M[k]] ?? '').trim();
  const firms = new Map();
  const splitRe = M.split ? new RegExp('[' + M.split.replace(/[\]\\^-]/g, '\\$&') + '\\n]') : /\n/;
  for (const r of rows) {
    const firma = cell(r, 'firma'); if (!firma) continue;
    const ort = cell(r, 'ort'), key = firma + '|' + ort;
    let plz = cell(r, 'plz').replace(/\D/g, ''); if (plz.length === 4) plz = '0' + plz;
    if (!firms.has(key)) firms.set(key, { id: firms.size, firma, ort, plz, str: cell(r, 'str'), mail: cell(r, 'mail'), tel: cell(r, 'tel'),
      name: cell(r, 'name'), mobil: cell(r, 'mobil'), www: cell(r, 'www'), geo: PLZ[plz] || null, arten: [], bem: [] });
    const f = firms.get(key);
    for (const a of cell(r, 'art').split(splitRe).map(x => x.trim()).filter(Boolean)) if (!f.arten.includes(a)) f.arten.push(a);
    const b = cell(r, 'bem'); if (b && !f.bem.includes(b)) f.bem.push(b);
    for (const k of ['mail', 'tel', 'str', 'name', 'mobil', 'www']) if (!f[k] && cell(r, k)) f[k] = cell(r, k);
  }
  K.lieferanten.firms = [...firms.values()];
  K.lieferanten.datei = M.datei;
  save();
  $('#lMsg') && ($('#lMsg').textContent = '');
}
function stats() {
  const F = K.lieferanten.firms, cnt = new Map();
  F.forEach(f => f.arten.forEach(a => cnt.set(a, (cnt.get(a) || 0) + 1)));
  const arten = [...cnt.keys()];
  const frei = [...cnt].filter(([a]) => !K.gewerke.some(g => matchArt(g, a))).sort((x, y) => y[1] - x[1]);
  const t = (K.sperre.text || '').trim().toLowerCase();
  return { arten, frei, ohneGeo: F.filter(f => !f.geo).length, gesperrt: t ? F.filter(f => f.bem.some(b => b.toLowerCase().includes(t))).length : 0 };
}

// ------------------------------------------------------------ 4. Beispiel-Ausschreibungen
function renderPakete() {
  const offen = uniq(K.pakete.flatMap(p => Object.keys(p.codes))).filter(c => !known(c) && !K.ignore.includes(c));
  const nPos = K.pakete.reduce((s, p) => s + p.corpus.length, 0);
  $('#step').innerHTML = `
  <div class="card"><h2>Beispiel-Ausschreibungen</h2>
    <p class="mut" style="margin-top:0">Abgeschlossene Vergabepakete, die schon von Hand in Gewerke zerlegt wurden: je Paket ein Ordner mit dem Gesamt-LV
    (GAEB 90 <code>.D83</code>/<code>.P83</code>, GAEB XML <code>.X83</code>, auch Phasen 81 bis 86) und den Gewerke-Dateien <code>KÜRZEL_&lt;LV-Name&gt;.D83</code>. Daraus lernt die App, welche Position zu welchem Gewerk gehört.
    Empfohlen sind 5 bis 10 Pakete. Mehrere Paket-Ordner können auf einmal abgelegt werden.</p>
    <div class="drop" id="pDrop">Paket-Ordner hier ablegen</div>
    <div class="row" style="margin-top:8px"><label class="s">Ordner wählen<input type="file" id="pIn" webkitdirectory multiple hidden></label><span class="mut small">Ein Ordner mit Unterordnern je Paket geht auch.</span></div>
    <div id="pMsg" class="msg"></div>
  </div>
  ${K.pakete.length ? `<div class="card"><h2>${K.pakete.length} Pakete · ${nPos} Positionen</h2>
    <table><tr><th>Paket (Name in der App)</th><th>Gesamt-LV</th><th>Positionen</th><th>Gewerke aus den Dateinamen</th><th></th></tr>
    ${K.pakete.map((p, i) => `<tr><td><input type="text" data-pl="${i}" value="${esc(p.label)}"></td><td class="small">${esc(p.datei)}</td>
      <td>${p.corpus.length} <span class="mut small">(${p.corpus.filter(e => e[1].length).length} vergeben)</span></td>
      <td>${Object.entries(p.codes).map(([c, n]) => `<span class="chip" style="${known(c) ? '' : K.ignore.includes(c) ? 'text-decoration:line-through;opacity:.6' : 'background:var(--warnbg);color:var(--warn)'}">${esc(c)} ${n}</span>`).join('')}</td>
      <td><button class="x" data-pdel="${i}" title="Paket entfernen">×</button></td></tr>`).join('')}</table>
  </div>` : ''}
  ${offen.length ? `<div class="card"><h2>Unbekannte Kürzel (${offen.length})</h2>
    <p class="mut" style="margin-top:0">Diese Kürzel stehen in Dateinamen, sind aber noch kein Gewerk. Bitte je Kürzel entscheiden.</p>
    <table style="max-width:640px"><tr><th>Kürzel</th><th>Positionen</th><th>Was ist das?</th></tr>
    ${offen.map(c => `<tr><td><code>${esc(c)}</code></td><td>${K.pakete.reduce((s, p) => s + (p.codes[c] || 0), 0)}</td><td><select data-code="${esc(c)}">
      <option value="">bitte wählen</option><option value="neu">neues Gewerk „${esc(c)}“ anlegen</option><option value="ignore">ignorieren (z. B. ARGE-Partner)</option>
      ${K.gewerke.map(g => `<option value="=${esc(g.code)}">gleich wie ${esc(g.code)} · ${esc(g.name)}</option>`).join('')}</select></td></tr>`).join('')}</table>
  </div>` : ''}`;
  const drop = $('#pDrop');
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = async e => { e.preventDefault(); drop.classList.remove('over'); addPakete(await droppedFiles(e.dataTransfer)); };
  $('#pIn').onchange = e => addPakete([...e.target.files].map(f => ({ file: f, path: f.webkitRelativePath || f.name })));
  $$('[data-pl]').forEach(inp => inp.oninput = () => { K.pakete[+inp.dataset.pl].label = inp.value; save(); });
  $$('[data-pdel]').forEach(b => b.onclick = () => { K.pakete.splice(+b.dataset.pdel, 1); save(); renderPakete(); });
  $$('[data-code]').forEach(s => s.onchange = () => {
    const c = s.dataset.code, v = s.value;
    if (v === 'neu') K.gewerke.push({ code: c, name: c, stichwoerter: [], titel: [], radius: 100 });
    else if (v === 'ignore') K.ignore.push(c);
    else if (v.startsWith('=')) K.alias[c] = v.slice(1);
    save(); renderPakete();
  });
  nav();
}
async function droppedFiles(dt) {
  const entries = [...dt.items].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  const out = [];
  const walk = async en => {
    if (en.isFile) out.push({ file: await new Promise((ok, no) => en.file(ok, no)), path: en.fullPath.replace(/^\//, '') });
    else if (en.isDirectory) {
      const r = en.createReader();
      for (let batch; (batch = await new Promise((ok, no) => r.readEntries(ok, no))).length;) for (const c of batch) await walk(c);
    }
  };
  for (const en of entries) await walk(en);
  return out;
}
// GAEB 90 (.D8x/.P8x) und GAEB XML (.X8x), Phasen 81 (Leistungsbeschreibung) bis 86 (Auftrag)
const LV_EXT = /\.[dpx]8[1-6]$/i;
// wie in der App: das Gesamt-LV ist die Datei, auf die sich die Gewerke-Dateien (KÜRZEL_<name>) beziehen
function pickMain(files) {
  const lvs = files.filter(f => LV_EXT.test(f.name));
  if (lvs.length < 2) return lvs[0];
  const ref = lvs.find(f => lvs.some(g => g !== f && g.name.endsWith('_' + f.name)));
  if (ref) return ref;
  const plain = lvs.filter(f => !/^[A-ZÄÖÜ]+_/.test(f.name));
  const pool = plain.length ? plain : lvs;
  return pool.sort((x, y) => (/\.d83$/i.test(y.name) - /\.d83$/i.test(x.name)) || y.size - x.size)[0];
}
// 'MARK_06-25-0079.D83' -> 'MARK' (gleiche Regel wie gaeb_gewerke.py)
function gewerkCode(name, mainName) {
  const stem = n => n.replace(/\.[^.]+$/, ''), s = stem(name).normalize('NFC'), suffix = '_' + stem(mainName).normalize('NFC');
  return (s.endsWith(suffix) ? s.slice(0, -suffix.length) : s.split('_')[0]).toUpperCase();
}
async function parseLv(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const head = new TextDecoder().decode(bytes.slice(0, 200)).replace(/^﻿?\s*/, '');
  return head.startsWith('<') ? X83.parse(new TextDecoder().decode(bytes)) : GAEB.parse(GAEB.decode(bytes));
}
async function addPakete(list) {
  const msg = (t, cls = '') => { $('#pMsg').className = 'msg ' + cls; $('#pMsg').textContent = t; };
  const dirs = new Map();
  for (const { file, path } of list) {
    if (!LV_EXT.test(file.name)) continue;
    const d = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '(ohne Ordner)';
    if (!dirs.has(d)) dirs.set(d, []);
    dirs.get(d).push(file);
  }
  if (!dirs.size) return msg('Keine LV-Dateien (GAEB .D81 bis .D86, .P8x oder .X8x) gefunden.', 'err');
  const fehler = [];
  let neu = 0;
  for (const [dir, files] of dirs) {
    const main = pickMain(files);
    const others = files.filter(f => f !== main);
    if (!others.length) { fehler.push(`${dir}: nur ein LV, keine Gewerke-Dateien`); continue; }
    msg('lese ' + dir + ' …');
    try {
      const lv = await parseLv(main);
      const key = it => it.kurztext + '|' + String(it.menge).trim();
      const lab = new Map(), codes = {};
      for (const f of others) {
        const c = gewerkCode(f.name, main.name);
        let g;
        try { g = await parseLv(f); } catch (e) { fehler.push(`${f.name}: ${e.message}`); continue; }
        codes[c] = (codes[c] || 0) + g.items.length;
        for (const it of g.items) { if (!lab.has(key(it))) lab.set(key(it), new Set()); lab.get(key(it)).add(c); }
      }
      let id = dir.split('/').pop() || main.name;
      while (K.pakete.some(p => p.id === id)) id += '_2';
      // 6. Feld: Abschnittstitel von außen nach innen (für Titel-Regeln und Trefferquote)
      const corpus = lv.items.map(it => [(it.kurztext + ' ' + it.langtext.slice(0, 200)).trim(), [...(lab.get(key(it)) || [])].sort(), it.kat || '', id, it.kurztext, ENGINE.titlesOf(it).reverse()]);
      K.pakete.push({ id, label: [id, lv.info.bezeichnung].filter(Boolean).join(' · ').slice(0, 80), datei: main.name, codes, corpus });
      neu++;
    } catch (e) { fehler.push(`${dir}: ${e.message}`); }
  }
  save(); renderPakete();
  msg(`${neu} Paket${neu === 1 ? '' : 'e'} übernommen.` + (fehler.length ? ' Nicht übernommen: ' + fehler.join('; ') : ''), fehler.length ? 'err' : 'ok');
}

// ------------------------------------------------------------ 5. Stichwörter
// Stichwörter der geladenen Vorlagen (ohne geladene Vorlage: die erste), nur für vorhandene Gewerke
function kwVorlage() {
  const vs = VORLAGEN.filter(v => K.vorlagen.includes(v.id));
  return (vs.length ? vs : VORLAGEN.slice(0, 1)).flatMap(v => v.kw).filter(r => !K.gewerke.length || r.codes.every(known));
}
function renderKw() {
  $('#step').innerHTML = `
  <div class="card"><h2>Stichwörter</h2>
    <p class="mut" style="margin-top:0">Steht ein Stichwort im Kurztext einer Position, schlägt die App das Gewerk direkt vor (vor dem Vergleich mit den Beispielen).
    Groß-/Kleinschreibung egal, Wortteile reichen (z. B. „absperr“). Sinnvoll für eindeutige Begriffe, die selten vorkommen.
    <b>Schnittstelle</b> (z. B. „Kernbohrung“, „Abschottung“, „Gerüst“): Das Gewerk kommt zu dem des Abschnitts dazu, die Position wird in der App zur Prüfung markiert.</p>
    <div class="row" style="margin-bottom:10px"><button class="s" id="kVorlage">Stichwörter der Vorlage laden (${kwVorlage().length})</button><button class="s" id="kAdd">+ Stichwort</button><span class="mut small">${K.kw.length} Stichwörter</span></div>
    <div class="scroll"><table><tr><th>Stichwort im Kurztext</th><th>Gewerk-Kürzel (mehrere mit Komma)</th><th style="width:100px">Schnittstelle</th><th style="width:30px"></th></tr>
    ${K.kw.map((r, i) => { const bad = r.codes.filter(c => !known(c)); return `<tr><td><input type="text" data-k="${i}" data-f="wort" value="${esc(r.wort)}"></td>
      <td><input type="text" data-k="${i}" data-f="codes" value="${esc(r.codes.join(', '))}" ${bad.length ? 'style="border-color:var(--bad)" title="unbekannt: ' + esc(bad.join(', ')) + '"' : ''}></td>
      <td style="text-align:center"><input type="checkbox" data-ks="${i}" ${r.schnitt ? 'checked' : ''}></td>
      <td><button class="x" data-kdel="${i}">×</button></td></tr>`; }).join('')}</table></div>
  </div>`;
  $$('[data-k]').forEach(inp => inp.oninput = () => {
    const r = K.kw[+inp.dataset.k];
    if (inp.dataset.f === 'wort') r.wort = inp.value; else r.codes = inp.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    save(); renderSteps();
  });
  $$('[data-f="codes"]').forEach(inp => inp.onchange = () => renderKw());
  $$('[data-ks]').forEach(cb => cb.onchange = () => { const r = K.kw[+cb.dataset.ks]; if (cb.checked) r.schnitt = true; else delete r.schnitt; save(); });
  $$('[data-kdel]').forEach(b => b.onclick = () => { K.kw.splice(+b.dataset.kdel, 1); save(); renderKw(); });
  $('#kAdd').onclick = () => { K.kw.push({ wort: '', codes: [] }); save(); renderKw(); };
  $('#kVorlage').onclick = () => {
    const have = new Set(K.kw.map(r => r.wort.toLowerCase()));
    K.kw.push(...kwVorlage().filter(r => !have.has(r.wort.toLowerCase())).map(r => ({ ...r, codes: [...r.codes] })));
    save(); renderKw();
  };
  nav();
}

// ------------------------------------------------------------ 6. Prüfen & erzeugen
function corpusAll() {
  return K.pakete.flatMap(p => p.corpus.map(([t, cs, kat, src, kurz, titel]) => [t, uniq(cs.filter(c => !K.ignore.includes(c)).map(normCode)).sort(), kat, src, kurz, titel || []]));
}
// Trefferquote: jedes Paket wird mit den Regeln und den übrigen Paketen vorgeschlagen und mit der echten Zuordnung verglichen
function quality() {
  if (K.pakete.length < 2) return null;
  const all = corpusAll().map(([text, codes, kat, src, kurz, titel]) => ({ text, codes, kat, src, kurz, titel }));
  const kw = K.kw.filter(r => r.wort.trim() && r.codes.length);
  const tt = ENGINE.titelRulesFrom(Object.fromEntries(K.gewerke.map(g => [g.code, g])));
  const res = K.pakete.map(p => {
    const train = all.filter(e => e.src !== p.id), test = all.filter(e => e.src === p.id);
    const sug = ENGINE.make(train, kw, ENGINE.learnKatRules(train), tt);
    let ok = 0;
    for (const e of test) {
      const r = sug({ kurztext: e.kurz, langtext: e.text.slice(e.kurz.length).trim(), kat: e.kat, titel: e.titel });
      const got = uniq(r.codes.map(normCode).filter(c => gwCodes().includes(c))).sort().join('+');
      if (got === e.codes.filter(c => gwCodes().includes(c)).join('+')) ok++;
    }
    return { label: p.label, n: test.length, ok };
  });
  const n = res.reduce((s, r) => s + r.n, 0), ok = res.reduce((s, r) => s + r.ok, 0);
  return { res, n, ok };
}
function exportData() {
  const F = K.lieferanten.firms, arten = uniq(F.flatMap(f => f.arten)).sort((a, b) => a.localeCompare(b, 'de'));
  const orte = {};
  const cnt = {};
  F.forEach(f => { if (f.ort && f.geo) { cnt[f.ort] = cnt[f.ort] || {}; cnt[f.ort][f.plz] = (cnt[f.ort][f.plz] || 0) + 1; } });
  for (const [o, c] of Object.entries(cnt)) orte[o] = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  const gewerke = {};
  for (const g of K.gewerke) gewerke[g.code] = { name: g.name || g.code, arten: arten.filter(a => matchArt(g, a)), radius: g.radius, titel: g.titel || [] };
  const kunde = {
    name: K.name, slug: K.slug, login: K.login || K.slug, farben: K.farben, logo: K.logo, favicon: K.favicon,
    sperre: K.sperre, pakete: Object.fromEntries(K.pakete.map(p => [p.id, p.label])),
    onboarding: { version: 1, stand: new Date().toISOString().slice(0, 10), vorlagen: K.vorlagen, gewerke: K.gewerke, alias: K.alias, ignore: K.ignore,
      lieferantenDatei: K.lieferanten.datei, pakete: K.pakete.map(p => ({ id: p.id, label: p.label, datei: p.datei, codes: p.codes })) },
  };
  const data = { corpus: corpusAll(), firms: F, orte, arten, gewerke, alias: K.alias };
  const kw = K.kw.filter(r => r.wort.trim() && r.codes.length);
  return { kunde, data, kw };
}
// Gleiche Logik wie fill() in build.py
const jsSafe = o => JSON.stringify(o).replace(/<\//g, '<\\/');
function fill(tpl, kunde, data, kw) {
  const put = (t, key, val) => { const i = t.indexOf(key); if (i < 0 || t.indexOf(key, i + 1) >= 0) throw new Error('Platzhalter ' + key); return t.slice(0, i) + val + t.slice(i + key.length); };
  const { onboarding, ...k } = kunde;
  let h = put(tpl, '/*KUNDE*/', jsSafe(k));
  h = put(h, '/*KW*/', jsSafe(kw));
  return put(h, '/*DATA*/', 'const DATA=' + jsSafe({ ...data, plz: PLZ }) + ';');
}
const appTemplate = () => new TextDecoder().decode(Uint8Array.from(atob(APP_TPL_B64), c => c.charCodeAt(0)));
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
// Minimaler ZIP-Writer (ohne Kompression), wie in der App
function zip(entries) {
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const parts = [], central = []; let off = 0;
  const u16 = v => [v & 255, v >>> 8 & 255], u32 = v => [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
  for (const [name, data] of entries) {
    const nb = new TextEncoder().encode(name), c = crc(data);
    const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(data.length), ...u32(data.length), ...u16(nb.length), ...u16(0)];
    const local = new Uint8Array([...u32(0x04034b50), ...common, ...nb]);
    parts.push(local, data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off), ...nb]));
    off += local.length + data.length;
  }
  const cl = central.reduce((s, x) => s + x.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(cl), ...u32(off), ...u16(0)]);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
function renderCheck() {
  const st = stats(), offen = uniq(K.pakete.flatMap(p => Object.keys(p.codes))).filter(c => !known(c) && !K.ignore.includes(c));
  const kwBad = K.kw.filter(r => r.codes.some(c => !known(c)));
  const item = (ok, text, level = ok ? 'ok' : 'bad') => `<li><span class="badge ${level}">${ok ? '✓' : level === 'warn' ? '!' : '✗'}</span> ${text}</li>`;
  const ready = K.name && K.slug && K.gewerke.length && K.lieferanten.firms.length;
  $('#step').innerHTML = `
  <div class="card"><h2>Prüfen</h2>
    <ul class="check" style="list-style:none;padding:0">
      ${item(!!(K.name && K.slug), `Unternehmen: <b>${esc(K.name || 'fehlt')}</b>${K.slug ? ` (Kurzname <code>${esc(K.slug)}</code>)` : ''}`)}
      ${item(!!K.logo, K.logo ? 'Logo hinterlegt' : 'Kein Logo, die App zeigt den Firmennamen', K.logo ? 'ok' : 'warn')}
      ${item(K.gewerke.length > 0, `${K.gewerke.length} Gewerke`)}
      ${item(K.lieferanten.firms.length > 0, `${K.lieferanten.firms.length} Firmen aus der Lieferantenliste${st.ohneGeo ? `, ${st.ohneGeo} ohne gültige PLZ (erscheinen ohne Entfernung)` : ''}`)}
      ${K.lieferanten.firms.length ? item(!st.frei.length, st.frei.length ? `${st.frei.length} Arten der Arbeiten keinem Gewerk zugeordnet (Schritt 3)` : 'Alle Arten der Arbeiten einem Gewerk zugeordnet', st.frei.length ? 'warn' : 'ok') : ''}
      ${item(K.pakete.length > 0, K.pakete.length ? `${K.pakete.length} Beispiel-Ausschreibungen mit ${K.pakete.reduce((s, p) => s + p.corpus.length, 0)} Positionen` : 'Keine Beispiel-Ausschreibungen: Vorschläge nur über Titel-Regeln und Stichwörter', K.pakete.length ? 'ok' : 'warn')}
      ${offen.length ? item(false, `Unbekannte Kürzel in Beispielen: ${offen.map(esc).join(', ')} (Schritt 4)`, 'warn') : ''}
      ${item(K.kw.length > 0, `${K.kw.length} Stichwörter${kwBad.length ? `, davon ${kwBad.length} mit unbekanntem Gewerk (Schritt 5)` : ''}`, K.kw.length && !kwBad.length ? 'ok' : 'warn')}
    </ul>
  </div>
  <div class="card"><h2>Trefferquote</h2>
    <div id="qOut"><p class="mut" style="margin:0">${K.pakete.length < 2 ? 'Ab zwei Beispiel-Ausschreibungen lässt sich messen, wie gut die Vorschläge sind.' : 'Jedes Paket wird so vorgeschlagen, als wäre es neu (gelernt aus den übrigen Paketen), und mit der echten Zuordnung verglichen.'}</p></div>
    ${K.pakete.length >= 2 ? '<div class="row" style="margin-top:10px"><button class="s" id="qRun">Trefferquote berechnen</button></div>' : ''}
  </div>
  <div class="card"><h2>Erzeugen</h2>
    <p class="mut" style="margin-top:0">Die <b>App</b> ist eine einzelne HTML-Datei für diesen Kunden (per Doppelklick nutzbar). Das <b>Kundenpaket</b> gehört ins Repository unter
    <code>kunden/${esc(K.slug || 'kurzname')}/</code>; daraus baut der Docker-Container die App (Build-Argument <code>KUNDE=${esc(K.slug || 'kurzname')}</code>).</p>
    <div class="row">
      <button class="b" id="eApp" ${ready ? '' : 'disabled'}>App herunterladen (.html)</button>
      <button class="s" id="eTest" ${ready ? '' : 'disabled'}>App in neuem Tab testen</button>
      <button class="s" id="ePkg" ${K.name && K.slug ? '' : 'disabled'}>Kundenpaket herunterladen (.zip)</button>
    </div>
    ${ready ? '' : '<p class="msg err">Für die App fehlen noch: ' + [!K.name && 'Firmenname', !K.slug && 'Kurzname', !K.gewerke.length && 'Gewerke', !K.lieferanten.firms.length && 'Lieferanten'].filter(Boolean).join(', ') + '.</p>'}
    <p class="mut small">Die Lieferantenliste steckt mit Kontaktdaten in App und Kundenpaket. Nur intern weitergeben und echte Kundenpakete nicht in ein öffentliches Repository legen.</p>
  </div>`;
  if ($('#qRun')) $('#qRun').onclick = () => {
    $('#qOut').innerHTML = '<p class="mut">rechne …</p>';
    setTimeout(() => {
      const q = quality(), pct = (a, b) => b ? Math.round(100 * a / b) : 0;
      $('#qOut').innerHTML = `<div class="kpis"><div class="kpi"><b>${pct(q.ok, q.n)} %</b>der ${q.n} Positionen richtig zugeordnet</div></div>
        <table style="max-width:640px"><tr><th>Paket</th><th>Positionen</th><th>richtig</th></tr>
        ${q.res.map(r => `<tr><td>${esc(r.label)}</td><td>${r.n}</td><td><span class="badge ${pct(r.ok, r.n) >= 80 ? 'ok' : pct(r.ok, r.n) >= 60 ? 'warn' : 'bad'}">${pct(r.ok, r.n)} %</span></td></tr>`).join('')}</table>
        <p class="mut small">„Richtig“ heißt: genau dieselben Gewerke wie in der echten Zuordnung (Eigenleistung zählt mit). Mehr Pakete und gezielte Stichwörter erhöhen die Quote.</p>`;
    }, 30);
  };
  const app = () => { const { kunde, data, kw } = exportData(); return fill(appTemplate(), kunde, data, kw); };
  $('#eApp').onclick = () => download(new Blob([app()], { type: 'text/html' }), `Gewerke-Anfragen-${K.slug}.html`);
  $('#eTest').onclick = () => window.open(URL.createObjectURL(new Blob([app()], { type: 'text/html' })), '_blank');
  $('#ePkg').onclick = () => {
    const { kunde, data, kw } = exportData(), enc = o => new TextEncoder().encode(JSON.stringify(o, null, 1) + '\n');
    download(zip([[`kunden/${K.slug}/kunde.json`, enc(kunde)], [`kunden/${K.slug}/data.json`, new TextEncoder().encode(JSON.stringify(data) + '\n')], [`kunden/${K.slug}/kw.json`, enc(kw)]]), `Kundenpaket-${K.slug}.zip`);
  };
  foot('<button class="s" id="prev">Zurück</button>');
  $('#prev').onclick = () => go(step - 1);
}

// ------------------------------------------------------------ Kundenpaket öffnen
async function openPackage(file) {
  try {
    const z = SHEET.unzip(new Uint8Array(await file.arrayBuffer()));
    const get = async suffix => { const n = [...z.keys()].find(k => k.endsWith(suffix)); return n ? JSON.parse(new TextDecoder().decode(await z.get(n)())) : null; };
    const kunde = await get('kunde.json'), data = await get('data.json'), kw = await get('kw.json');
    if (!kunde || !data) throw new Error('kunde.json oder data.json fehlt');
    const o = kunde.onboarding || {};
    const byPkg = new Map();
    for (const e of data.corpus) { if (!byPkg.has(e[3])) byPkg.set(e[3], []); byPkg.get(e[3]).push(e); }
    K = Object.assign(blank(), {
      name: kunde.name, slug: kunde.slug, logo: kunde.logo || '', favicon: kunde.favicon || '', farben: kunde.farben || blank().farben,
      login: kunde.login || '', sperre: kunde.sperre || blank().sperre,
      gewerke: o.gewerke || Object.entries(data.gewerke).map(([code, g]) => ({ code, name: g.name, stichwoerter: [], titel: g.titel || [], radius: g.radius })),
      vorlagen: o.vorlagen || [],
      alias: o.alias || data.alias || {}, ignore: o.ignore || [], kw: kw || [],
      lieferanten: { datei: o.lieferantenDatei || '', firms: data.firms || [], mapping: null },
      pakete: [...byPkg].map(([id, corpus]) => { const m = (o.pakete || []).find(p => p.id === id) || {};
        return { id, label: m.label || kunde.pakete?.[id] || id, datei: m.datei || '', codes: m.codes || {}, corpus }; }),
    });
    save(); go(0);
  } catch (e) { alert('Kundenpaket konnte nicht geöffnet werden: ' + e.message); }
}
$('#pkgIn').onchange = e => e.target.files[0] && openPackage(e.target.files[0]);
$('#newBtn').onclick = () => { if (confirm('Den aktuellen Entwurf verwerfen?')) { K = blank(); sheets = null; save(); go(0); } };

render();
