#!/usr/bin/env python3
"""Baut die Gewerke-Anfragen-App je Kunde und das Onboarding.

  python3 build.py                       alle Kunden aus kunden/ nach dist/Gewerke-Anfragen-<kunde>.html, dazu dist/Onboarding.html
  python3 build.py --kunde demo --out X  nur dieser Kunde: X/index.html (App) und X/onboarding.html (für Docker)

Ein Kunde ist ein Ordner kunden/<kurzname>/ mit kunde.json, data.json und kw.json.
Diesen Ordner erzeugt das Onboarding („Kundenpaket herunterladen“). Nur Python-Standardbibliothek.
"""
import argparse, base64, csv, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
KUNDEN = os.path.join(HERE, 'kunden')


def src(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def put(text, key, value):
    """Platzhalter genau einmal ersetzen (schützt vor versehentlichen Treffern in Bibliotheken)."""
    n = text.count(key)
    if n != 1:
        sys.exit(f'Platzhalter {key} kommt {n}-mal vor, erwartet genau einmal')
    return text.replace(key, value)


def js(obj):
    """JSON, das gefahrlos in einem <script> stehen kann."""
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def app_template():
    """app.html mit allen Bibliotheken, aber noch ohne Kundendaten (/*KUNDE*/, /*DATA*/, /*KW*/ bleiben)."""
    a = src('app.html')
    for key, f in [('/*GAEB*/', 'gaeb.js'), ('/*X83*/', 'x83.js'), ('/*PDFJS*/', 'pdf.min.js'),
                   ('/*PDFWORKER*/', 'pdf.worker.min.js'), ('/*PDFSITE*/', 'pdfsite.js'), ('/*ENGINE*/', 'engine.js')]:
        a = put(a, key, src(f))
    return a


def plz_table():
    out = {}
    with open(os.path.join(SRC, 'plz.csv'), encoding='utf-8') as f:
        for r in csv.DictReader(f):
            out[r['']] = [round(float(r['lat']), 4), round(float(r['lng']), 4)]
    return out


def fill(tpl, kunde, data, kw, plz):
    """Kundendaten einsetzen. Gleiche Logik wie fill() in src/onboarding.js."""
    d = dict(data)
    d['plz'] = plz
    # Die Bearbeitungsdaten des Onboardings (Gewerke-Definitionen usw.) braucht die App nicht
    k = {key: v for key, v in kunde.items() if key != 'onboarding'}
    h = put(tpl, '/*KUNDE*/', js(k))
    h = put(h, '/*KW*/', js(kw))
    h = put(h, '/*DATA*/', 'const DATA=' + js(d) + ';')
    return h


def load_kunde(slug):
    d = os.path.join(KUNDEN, slug)
    if not os.path.isdir(d):
        sys.exit(f'Kunde „{slug}“ nicht gefunden: {d}')
    read = lambda n: json.load(open(os.path.join(d, n), encoding='utf-8'))
    return read('kunde.json'), read('data.json'), read('kw.json')


def onboarding(tpl, plz):
    o = src('onboarding.html')
    for key, f in [('/*GAEB*/', 'gaeb.js'), ('/*X83*/', 'x83.js'), ('/*ENGINE*/', 'engine.js'),
                   ('/*XLSX*/', 'xlsx.js'), ('/*ONBOARDING*/', 'onboarding.js')]:
        o = put(o, key, src(f))
    # Vorlagen-Bibliothek: vorlage.js legt VORLAGEN an, jede vorlage_<sparte>.js hängt sich an
    extra = sorted(f for f in os.listdir(SRC) if f.startswith('vorlage_') and f.endswith('.js'))
    o = put(o, '/*VORLAGE*/', '\n'.join(src(f) for f in ['vorlage.js'] + extra))
    o = put(o, '/*PLZ*/', js(plz))
    # App-Vorlage als Base64, damit ihr HTML (inkl. </script>) das Onboarding nicht stört
    o = put(o, '/*APPTPL*/', base64.b64encode(tpl.encode('utf-8')).decode('ascii'))
    return o


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print('gebaut:', os.path.relpath(path, HERE), f'({len(text) // 1024} KB)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kunde', help='Kurzname des Kunden (Ordner unter kunden/)')
    ap.add_argument('--out', help='Zielordner für index.html und onboarding.html')
    a = ap.parse_args()
    tpl, plz = app_template(), plz_table()
    if a.kunde:
        out = a.out or os.path.join(HERE, 'dist', a.kunde)
        write(os.path.join(out, 'index.html'), fill(tpl, *load_kunde(a.kunde), plz))
        write(os.path.join(out, 'onboarding.html'), onboarding(tpl, plz))
        return
    for slug in sorted(os.listdir(KUNDEN)):
        if os.path.isfile(os.path.join(KUNDEN, slug, 'kunde.json')):
            write(os.path.join(HERE, 'dist', f'Gewerke-Anfragen-{slug}.html'), fill(tpl, *load_kunde(slug), plz))
    write(os.path.join(HERE, 'dist', 'Onboarding.html'), onboarding(tpl, plz))


if __name__ == '__main__':
    main()
