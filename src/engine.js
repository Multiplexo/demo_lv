// Gewerke-Vorschlag: Katalog-Regeln, Titel-Regeln, Stichwort-Regeln, aehnliche Positionen.
const ENGINE = (() => {
  // Leistungsbereich-Schluessel aus der Katalognummer (die ersten 3 Ziffern sind die Katalogausgabe)
  const katKey = kat => (kat && kat.length > 6 ? kat.slice(3) : '');

  // Katalog-Regeln aus Beispielen ableiten: Praefix -> Gewerke, wenn eindeutig genug
  function learnKatRules(examples, { minN = 5, purity = 0.75 } = {}) {
    const rules = [];
    for (const len of [3, 5]) {
      const g = new Map();
      for (const e of examples) {
        const k = katKey(e.kat); if (k.length < len) continue;
        const p = k.slice(0, len);
        if (!g.has(p)) g.set(p, []);
        g.get(p).push(e.codes.slice().sort().join('+'));
      }
      for (const [p, v] of g) {
        if (v.length < minN) continue;
        const c = new Map(); v.forEach(x => c.set(x, (c.get(x) || 0) + 1));
        const [best, n] = [...c].sort((a, b) => b[1] - a[1])[0];
        if (n / v.length < purity) continue;
        // feinere Regel nur, wenn sie etwas anderes sagt als die grobe
        const coarse = rules.find(r => p.startsWith(r.prefix));
        if (coarse && coarse.codes.join('+') === best) continue;
        rules.push({ prefix: p, codes: best ? best.split('+') : [], n: v.length, quote: Math.round(100 * n / v.length) });
      }
    }
    return rules.sort((a, b) => b.prefix.length - a.prefix.length);
  }

  const tok = s => (s.toLowerCase().match(/[a-zäöüß0-9]+/g) || []).filter(w => w.length > 2);

  function makeKnn(examples) {
    const df = new Map();
    examples.forEach(e => new Set(tok(e.text)).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
    const N = examples.length || 1, idf = w => Math.log(N / (df.get(w) || 1));
    const vec = s => {
      const c = new Map(); tok(s).forEach(w => c.set(w, (c.get(w) || 0) + 1));
      let n = 0; const v = new Map();
      c.forEach((k, w) => { const x = k * idf(w); v.set(w, x); n += x * x; });
      n = Math.sqrt(n) || 1; v.forEach((x, w) => v.set(w, x / n)); return v;
    };
    const index = new Map();
    examples.forEach((e, d) => vec(e.text).forEach((x, w) => { if (!index.has(w)) index.set(w, []); index.get(w).push([d, x]); }));
    return text => {
      const score = new Map();
      vec(text).forEach((x, w) => (index.get(w) || []).forEach(([d, y]) => score.set(d, (score.get(d) || 0) + x * y)));
      let best = -1, bs = 0; score.forEach((s, d) => { if (s > bs) { bs = s; best = d; } });
      return best < 0 ? null : { ex: examples[best], score: bs };
    };
  }

  // Abschnittstitel einer Position, innerster zuerst. pos.titel (Liste) hat Vorrang, sonst über pos.group
  function titlesOf(pos) {
    if (Array.isArray(pos.titel)) return pos.titel.slice().reverse();
    const out = [];
    for (let g = pos.group; g; g = g.parent) if (g.title) out.push(g.title);
    return out;
  }
  // „KG420“, „KG 420“ und „Kg. 420“ gleich behandeln
  const normTitle = t => t.toLowerCase().replace(/\bkg\.?\s*(\d)/g, 'kg $1');
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Titel-Stichwörter müssen am Wortanfang stehen, sonst passt „elt“ auch in „Gestaltung“
  const wordStart = w => new RegExp('(^|[^a-zäöüß0-9])' + esc(normTitle(w.trim())), 'i');

  // kw-Regeln: [{wort, codes, schnitt?}] ; kat-Regeln: [{prefix, codes}] ; titel-Regeln: [{wort, codes}]
  // schnitt = Schnittstelle: Gewerk kommt zusätzlich dazu und die Position wird als „bitte prüfen“ markiert
  function make(examples, kwRules, katRules, titelRules = []) {
    const knn = makeKnn(examples);
    const kws = kwRules.map(r => ({ ...r, re: new RegExp(esc(r.wort), 'i') }));
    const tts = titelRules.filter(r => r.wort && r.wort.trim() && r.codes.length).map(r => ({ ...r, re: wordStart(r.wort) }));
    const q = w => '„' + w + '“';
    return function suggest(pos) {
      // 1. Katalognummer
      const k = katKey(pos.kat);
      if (k) {
        const r = katRules.find(r => k.startsWith(r.prefix));
        if (r) return { codes: r.codes.slice(), reason: `Katalog-Regel ${r.prefix}`, why: `die Katalognummer mit ${r.prefix} beginnt (Katalog-Regel)`, sure: true };
      }
      const hits = kws.filter(r => r.re.test(pos.kurztext));
      const schnitt = hits.filter(r => r.schnitt);
      const extraOf = codes => [...new Set(schnitt.flatMap(r => r.codes))].filter(c => !codes.includes(c));
      // 2. Abschnittstitel (innerster Abschnitt mit Treffer gewinnt)
      if (tts.length) {
        for (const t of titlesOf(pos)) {
          const nt = normTitle(t), th = tts.filter(r => r.re.test(nt));
          if (!th.length) continue;
          let codes = [...new Set(th.flatMap(r => r.codes))];
          // Abschnitt passt zu mehreren Gewerken (z. B. „Fassade und Fenster“): Stichwort oder ähnliche Position entscheidet
          if (codes.length > 1) {
            const inT = hits.filter(r => !r.schnitt && r.codes.every(c => codes.includes(c)));
            const m = inT.length ? null : knn(pos.kurztext + ' ' + (pos.langtext || '').slice(0, 200));
            const pick = inT.length ? [...new Set(inT.flatMap(r => r.codes))] : m && m.ex.codes.length && m.ex.codes.every(c => codes.includes(c)) ? m.ex.codes.slice() : null;
            if (!pick) return { codes, reason: `Abschnitt ${q(t)} passt zu mehreren Gewerken`, why: `der Abschnitt ${q(t)} zu mehreren Gewerken passt (bitte eins wählen)`, sure: false };
            codes = pick;
            if (!extraOf(codes).length) return inT.length
              ? { codes, reason: `Abschnitt ${q(t)} + Stichwort ${inT.map(r => q(r.wort)).join(', ')}`, why: `die Position im Abschnitt ${q(t)} steht und der Kurztext ${inT.map(r => q(r.wort)).join(', ')} enthält`, sure: true }
              : { codes, reason: `Abschnitt ${q(t)}, ähnlich wie „${m.ex.kurz}“`, why: `die Position im Abschnitt ${q(t)} steht und „${m.ex.kurz}“ (${m.ex.src}) ähnlich ist`, sure: m.score >= 0.35, score: m.score };
          }
          const extra = extraOf(codes);
          if (extra.length) return { codes: codes.concat(extra), reason: `Abschnitt ${q(t)} + Schnittstelle ${schnitt.map(r => q(r.wort)).join(', ')}`,
            why: `die Position im Abschnitt ${q(t)} steht und der Kurztext ${schnitt.map(r => q(r.wort)).join(', ')} enthält (Schnittstelle, bitte prüfen)`, sure: false, schnitt: true };
          return { codes, reason: `Abschnitt ${q(t)}`, why: `die Position im Abschnitt ${q(t)} steht (Titel-Regel)`, sure: true };
        }
      }
      // 3. Stichwörter im Kurztext
      if (hits.length) {
        const codes = [...new Set(hits.flatMap(r => r.codes))];
        const s = schnitt.length > 0;
        return { codes, reason: (s ? 'Schnittstelle ' : 'Stichwort ') + hits.map(r => q(r.wort)).join(', '),
          why: 'der Kurztext ' + hits.map(r => q(r.wort)).join(', ') + ' enthält' + (s ? ' (Schnittstelle, bitte prüfen)' : ' (Stichwort-Regel)'), sure: !s, schnitt: s };
      }
      // 4. ähnlichste bekannte Position
      const m = knn(pos.kurztext + ' ' + (pos.langtext || '').slice(0, 200));
      if (!m) return { codes: [], reason: 'keine ähnliche Position bekannt', sure: false };
      return { codes: m.ex.codes.slice(), reason: `ähnlich wie „${m.ex.kurz}“ (${m.ex.src})`, sure: m.score >= 0.35, score: m.score, ex: m.ex };
    };
  }

  // Titel-Regeln aus den Gewerken: {CODE: {titel: [...]}} -> [{wort, codes}]
  const titelRulesFrom = gewerke => Object.entries(gewerke || {}).flatMap(([code, g]) => (g.titel || []).map(wort => ({ wort, codes: [code] })));

  return { make, learnKatRules, katKey, titelRulesFrom, titlesOf };
})();
if (typeof module !== 'undefined') module.exports = ENGINE;
