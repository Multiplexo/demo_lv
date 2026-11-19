#!/usr/bin/env python3
"""Erzeugt die erfundenen Demo-Daten für den Beispielkunden „Musterbau GmbH“.

  python3 tools/demo_daten.py

Ergebnis in demo-daten/:
  Lieferantenliste_Musterbau.xlsx   erfundene Firmen (eine Zeile je Firma und Art der Arbeiten)
  Beispielpakete/<Paket>/           Gesamt-LV + Gewerke-Dateien (KÜRZEL_<LV>.D83), wie von Hand zerlegt
  Test-Ausschreibung/               ein neues LV zum Ausprobieren der App
  musterbau-logo.svg                Demo-Logo

Alle Firmen, Adressen und Leistungsverzeichnisse sind frei erfunden. Braucht openpyxl.
"""
import csv, json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'demo-daten')
sys.path.insert(0, os.path.join(ROOT, 'gaeb_gewerke'))
import gaeb_gewerke as G  # noqa: E402

rnd = random.Random(42)

# ------------------------------------------------------------ Positionskatalog
# (Gewerk oder None = Eigenleistung, Kurztext-Vorlage, Langtext, Einheit, Menge von-bis)
V = lambda *xs: rnd.choice(xs)
KATALOG = [
    (None, 'Baustelle einrichten', 'Baustelleneinrichtung für sämtliche Leistungen herstellen, vorhalten und nach Abschluss räumen.', 'psch', (1, 1)),
    (None, 'Baustelle räumen', 'Geräte, Anlagen und Einrichtungen von der Baustelle entfernen, Flächen in den ursprünglichen Zustand versetzen.', 'psch', (1, 1)),
    (None, lambda: f'Asphaltbefestigung fräsen, Dicke {V(4, 6, 8, 10)} cm', 'Asphaltschichten profilgerecht fräsen, Fräsgut laden und abfahren.', 'm2', (200, 4000)),
    (None, lambda: f'Asphaltdeckschicht AC {V(8, 11)} D S einbauen, {V(3, 4)} cm', 'Asphaltdeckschicht nach ZTV Asphalt-StB herstellen, einschließlich Verdichten.', 'm2', (300, 5000)),
    (None, lambda: f'Asphalttragschicht AC {V(22, 32)} T S, {V(8, 10, 12, 14)} cm', 'Asphalttragschicht herstellen und verdichten.', 'm2', (200, 3000)),
    (None, lambda: f'Boden lösen, laden, Bodenklasse {V(3, 4, 5)}', 'Boden profilgerecht lösen und zur Weiterverwendung oder Abfuhr laden.', 'm3', (50, 800)),
    (None, 'Planum herstellen', 'Planum profilgerecht herstellen und verdichten, Ev2 mindestens 45 MN/m2.', 'm2', (200, 3000)),
    (None, lambda: f'Bordstein {V("Hochbord", "Tiefbord", "Rundbord")} setzen', 'Bordsteine in Beton C20/25 mit Rückenstütze setzen.', 'm', (40, 600)),
    (None, 'Schachtabdeckung regulieren', 'Vorhandene Schachtabdeckung an die neue Höhe anpassen.', 'St', (2, 30)),
    ('MARK', lambda: f'Leitlinie {V(12, 15)} cm, weiß, {V("Heißplastik", "Kaltplastik", "Farbe")}', 'Fahrbahnmarkierung als Leitlinie nach RMS herstellen, Typ II.', 'm', (200, 3000)),
    ('MARK', lambda: f'Fahrstreifenbegrenzung {V(12, 25)} cm, {V("Heißplastik", "Kaltplastik")}', 'Durchgehende Linie herstellen, einschließlich Vorvermessung.', 'm', (100, 2000)),
    ('MARK', lambda: f'Sperrfläche markieren, {V("Heißplastik", "Kaltplastik")}', 'Sperrflächen in Schrägstrichen herstellen.', 'm2', (10, 200)),
    ('MARK', 'Markierung demarkieren', 'Vorhandene Markierung durch Fräsen oder Strahlen restlos entfernen.', 'm', (50, 800)),
    ('MARK', lambda: f'Pfeilmarkierung {V("Geradeaus", "Links", "Rechts")}, 5 m', 'Richtungspfeil nach RMS herstellen.', 'St', (2, 30)),
    ('VS', lambda: f'Verkehrssicherung {V("Arbeitsstelle kürzerer Dauer", "Arbeitsstelle längerer Dauer")}', 'Verkehrssicherung nach RSA 21 einrichten, vorhalten, umsetzen und räumen.', 'psch', (1, 1)),
    ('VS', lambda: f'Absperrschranke {V(1.0, 1.6, 2.0)} m vorhalten', 'Absperrschranken mit Fuß und Warnleuchte vorhalten.', 'Std', (100, 5000)),
    ('VS', 'Umleitungsbeschilderung aufstellen', 'Umleitungsbeschilderung nach verkehrsrechtlicher Anordnung aufstellen und vorhalten.', 'psch', (1, 1)),
    ('VS', 'Transportable Lichtsignalanlage vorhalten', 'Transp. LSA mit zwei Signalgebern, verkehrsabhängig gesteuert, vorhalten.', 'd', (5, 60)),
    ('ANSPR', lambda: f'Bitumenemulsion {V("C60 BP1-S", "C40 BF1-S")} anspritzen', 'Unterlage mit Bitumenemulsion gleichmäßig anspritzen, 250 g/m2.', 'm2', (300, 5000)),
    ('ANSPR', 'Haftkleber auf Fräsfläche aufbringen', 'Anspritzen der gefrästen Fläche mit polymermodifizierter Emulsion.', 'm2', (300, 5000)),
    ('FUG', lambda: f'Fuge vergießen, {V("heiß", "kalt")} verarbeitbar', 'Fugen zwischen Asphalt und Einbauten mit Fugenmasse vergießen.', 'm', (50, 1200)),
    ('FUG', 'Asphalt schneiden, Tiefe bis 10 cm', 'Asphalt mit Fugenschneider gerade und senkrecht schneiden.', 'm', (20, 400)),
    ('FUG', 'Nahtband an Anschlussfugen aufbringen', 'Bitumenhaltiges Nahtband an Nähten und Anschlüssen aufbringen.', 'm', (50, 900)),
    ('MG', lambda: f'Mischgut AC {V(11, 16, 22)} liefern', 'Asphaltmischgut ab Werk liefern, Temperatur nach TL Asphalt-StB.', 't', (100, 2500)),
    ('MG', 'Fräsgut verwerten', 'Teerfreies Fräsgut übernehmen und im Mischwerk verwerten.', 't', (100, 2000)),
    ('SCHÜTT', lambda: f'Schottertragschicht 0/{V(32, 45)} liefern und einbauen', 'Mineralgemisch liefern, lagenweise einbauen und verdichten.', 'm3', (50, 900)),
    ('SCHÜTT', lambda: f'Boden entsorgen, {V("Z 1.1", "Z 1.2", "Z 2", "DK I")}', 'Belasteten Boden laden, abfahren und zur zugelassenen Deponie verbringen.', 't', (20, 900)),
    ('SCHÜTT', 'Frostschutzmaterial liefern', 'Frostschutzmaterial 0/32 liefern und einbauen.', 'm3', (50, 800)),
    ('BAU', lambda: f'Betonpflaster {V(8, 10)} cm liefern', 'Betonsteinpflaster grau liefern, frei Baustelle.', 'm2', (50, 600)),
    ('BAU', lambda: f'Entwässerungsrinne {V("Schlitzrinne", "Kastenrinne")} liefern', 'Entwässerungsrinne Klasse D 400 liefern.', 'm', (10, 200)),
    ('BAU', 'Geotextil GRK 3 liefern', 'Geotextil als Trenn- und Filterlage liefern.', 'm2', (100, 2000)),
    ('BÜRO', 'Baubüro vorhalten', 'Bürocontainer mit Einrichtung, Heizung und Stromanschluss vorhalten.', 'Wo', (4, 40)),
    ('BÜRO', 'Sanitärcontainer vorhalten', 'WC-Container mit Waschgelegenheit vorhalten und reinigen.', 'Wo', (4, 40)),
    ('KAMPF', 'Kampfmittelsondierung Fläche', 'Fläche vor Beginn der Erdarbeiten auf Kampfmittel sondieren.', 'm2', (200, 4000)),
    ('SCHUTZ', lambda: f'Schutzplanke {V("ESP", "EDSP", "Stahlschutzwand")} herstellen', 'Fahrzeug-Rückhaltesystem nach Systemzulassung aufstellen.', 'm', (40, 800)),
    ('SCHUTZ', 'Schutzplanke demontieren', 'Vorhandene Schutzplanke einschließlich Pfosten zurückbauen.', 'm', (40, 800)),
    ('BESCH', lambda: f'Verkehrszeichen {V(205, 206, 274, 283)} aufstellen', 'Verkehrszeichen RA 2 mit Pfosten und Fundament aufstellen.', 'St', (1, 20)),
    ('GEL', lambda: f'Geländer {V("Füllstabgeländer", "Holmgeländer")} herstellen', 'Geländer aus Stahl, feuerverzinkt, auf Fundament montieren.', 'm', (10, 200)),
    ('PFLASTER', lambda: f'Pflaster verlegen, {V("Reihenverband", "Fischgrät")}', 'Pflastersteine in Bettung verlegen, einschlämmen und abrütteln.', 'm2', (50, 600)),
    ('KANALBAU', lambda: f'Kanalrohr DN {V(200, 300, 400)} verlegen', 'Kanalrohr in offener Bauweise verlegen, einschließlich Leitungsgraben.', 'm', (20, 300)),
    ('KANALBAU', 'Hausanschlussleitung herstellen', 'Grundstücksanschluss DN 150 an Hauptkanal anschließen.', 'St', (2, 20)),
    ('BAUFELD', lambda: f'Baum fällen, Stammdurchmesser {V(30, 50, 80)} cm', 'Baumfällung einschließlich Wurzelstock roden und entsorgen.', 'St', (1, 15)),
    ('BAUFELD', 'Baumschutz herstellen', 'Stammschutz mit Bohlenummantelung herstellen und vorhalten.', 'St', (2, 20)),
    ('LEIT', 'Leitpfosten aufstellen', 'Leitpfosten aus Kunststoff mit Reflektor aufstellen.', 'St', (10, 120)),
    ('PROB', lambda: f'Probe entnehmen, {V("Bohrkern", "Asphaltprobe", "Bodenprobe")}', 'Probenahme und Prüfung durch anerkannte Prüfstelle.', 'St', (2, 20)),
    ('ELEKTRO', 'Straßenbeleuchtung umsetzen', 'Mast mit Leuchte demontieren und an neuer Stelle aufbauen, Kabelarbeiten.', 'St', (1, 12)),
]


def pos(entry):
    code, kt, lt, eh, (lo, hi) = entry
    kurz = kt() if callable(kt) else kt
    menge = lo if lo == hi else rnd.randint(lo, hi)
    return code, kurz, lt, eh, menge


# ------------------------------------------------------------ GAEB 90 schreiben (vereinfacht, für die Demo)
def rec(s):
    return s[:74].ljust(74)


def lv_text(name, bezeichnung, auftraggeber, gruppen, datum):
    """gruppen: [(titel, [(code, kurz, lang, einheit, menge), ...]), ...] -> (Text, {code: [oz, ...]})"""
    rs = [rec('00' + ' ' * 11 + name.ljust(17)), rec('01' + bezeichnung.ljust(40) + datum),
          rec('02' + bezeichnung), rec('03' + auftraggeber)]
    zuord = {}
    for gi, (titel, positionen) in enumerate(gruppen, 1):
        rs += [rec('11' + f'{gi:02d}'), rec('12' + titel)]
        for pi, (code, kurz, lang, eh, menge) in enumerate(positionen, 1):
            oz = f'{gi:02d} {pi * 10:04d}'.ljust(9)
            rs.append(rec('21' + oz + ' ' * 12 + f'{menge * 1000:011d}' + eh.ljust(4)))
            rs.append(rec('25' + kurz))
            for i in range(0, len(lang), 69):
                rs.append(rec('26   ' + lang[i:i + 69]))
            if code:
                zuord.setdefault(code, []).append(oz.strip())
        rs.append(rec('31' + f'{gi:02d}'))
    lines = [r + f'{i + 1:06d}' for i, r in enumerate(rs)]
    n = sum(1 for r in rs if r[:2] == '21')
    lines.append(rec('99').ljust(69)[:69] + f'{n:05d}' + f'{len(lines) + 1:06d}')
    return '\r\n'.join(lines) + '\r\n', zuord


def lv(n_min, n_max):
    picks = rnd.sample(KATALOG, rnd.randint(n_min, n_max))
    picks = [KATALOG[0]] + [p for p in picks if p is not KATALOG[0]]
    eigen = [pos(p) for p in picks if p[0] is None]
    fremd = [pos(p) for p in picks if p[0] is not None]
    half = len(fremd) // 2
    return [('Baustelleneinrichtung und Verkehrssicherung', eigen[:2] + [p for p in fremd if p[0] in ('VS', 'BÜRO', 'KAMPF')]),
            ('Fahrbahn', eigen[2:] + [p for p in fremd[:half] if p[0] not in ('VS', 'BÜRO', 'KAMPF')]),
            ('Ausstattung und Nebenarbeiten', [p for p in fremd[half:] if p[0] not in ('VS', 'BÜRO', 'KAMPF')])]


def write_paket(ordner, name, bez, ag, gruppen, mit_gewerken=True):
    d = os.path.join(OUT, ordner)
    os.makedirs(d, exist_ok=True)
    text, zuord = lv_text(name, bez, ag, [g for g in gruppen if g[1]], '15.03.26')
    main = os.path.join(d, name + '.D83')
    open(main, 'wb').write(text.encode('cp850'))
    if mit_gewerken:
        header, root, trailer = G.parse(main)
        for code, oz in zuord.items():
            sel = {it.oz for it in G.iter_items(root) if it.oz.strip() in oz}
            t = G.build(header, root, trailer, code, sel, '20.03.26')
            open(os.path.join(d, f'{code}_{name}.D83'), 'wb').write(t.encode('cp850'))
    return main, zuord


# ------------------------------------------------------------ Lieferantenliste
ORTE = [('59065', 'Hamm'), ('44135', 'Dortmund'), ('33602', 'Bielefeld'), ('48143', 'Münster'), ('50667', 'Köln'), ('45127', 'Essen'),
        ('40213', 'Düsseldorf'), ('34117', 'Kassel'), ('30159', 'Hannover'), ('49074', 'Osnabrück'), ('33098', 'Paderborn'),
        ('44787', 'Bochum'), ('57072', 'Siegen'), ('33330', 'Gütersloh'), ('32756', 'Detmold'), ('59494', 'Soest'), ('47051', 'Duisburg'),
        ('42103', 'Wuppertal'), ('58095', 'Hagen'), ('52062', 'Aachen'), ('53111', 'Bonn'), ('60311', 'Frankfurt am Main'),
        ('28195', 'Bremen'), ('20095', 'Hamburg'), ('04109', 'Leipzig'), ('99084', 'Erfurt'), ('90402', 'Nürnberg'), ('70173', 'Stuttgart')]
BRANCHEN = {  # Firmenbezeichnung -> Arten der Arbeiten (passen zu den Stichwörtern der Vorlage)
    'Markierungstechnik': ['Markierung', 'Demarkierung'], 'Verkehrstechnik': ['Verkehrssicherung', 'Absperrtechnik', 'Ampelverleih'],
    'Straßenservice': ['Anspritzarbeiten', 'Fugen'], 'Fugentechnik': ['Fugen', 'Schneiden (Asphalt)'], 'Asphaltmischwerk': ['Mischgut'],
    'Baustoffhandel': ['Baustoffe', 'Betonwaren', 'Entwässerungsrinnen'], 'Recycling': ['Schüttgüter', 'Entsorgung', 'Deponie'],
    'Containerdienst': ['Baubüro', 'WC-Mietservice'], 'Kampfmittelräumung': ['Kampfmittel'], 'Stahlschutz': ['Schutzplanken', 'Stahlschutzwand'],
    'Schilder': ['Verkehrszeichen'], 'Metallbau': ['Geländer', 'Metallbau'], 'Pflasterbau': ['Pflasterarbeiten'],
    'Kanalbau': ['Kanalbau', 'Leitungsbau'], 'Baumpflege': ['Baumfällung', 'Baumschutz', 'Baufeldräumung'],
    'Leitpfosten Service': ['Leitpfosten'], 'Baustoffprüfung': ['Asphaltprüfungen', 'Beprobung'], 'Elektrotechnik': ['Straßenbeleuchtung', 'Elektroarbeiten'],
    'Grünpflege': ['Gartenbau', 'Winterdienst'],  # bewusst ohne passendes Gewerk, zeigt „Arten ohne Gewerk“ im Onboarding
}
REGION = ['Nord', 'Süd', 'West', 'Ost', 'Mitte', 'Rhein', 'Ruhr', 'Weser', 'Ems', 'Lippe']


def lieferanten():
    from openpyxl import Workbook
    plz = {r[''] for r in csv.DictReader(open(os.path.join(ROOT, 'src', 'plz.csv'), encoding='utf-8'))}
    orte = [o for o in ORTE if o[0] in plz]
    wb = Workbook(); ws = wb.active; ws.title = 'NU-Liste'
    ws.append(['Firma', 'Bemerkung', 'Art der Arbeiten', 'E-Mail', 'Telefon', 'Straße', 'PLZ', 'Ort', 'Ansprechpartner', 'Mobil', 'Internet'])
    n = 0
    for branche, arten in BRANCHEN.items():
        for _ in range(rnd.randint(5, 9)):
            p, ort = rnd.choice(orte)
            reg = rnd.choice(REGION)
            firma = f'{branche} {reg} {ort.split()[0]} (Demo) GmbH'
            slug = ''.join(c for c in f'{branche}{reg}{ort}'.lower() if c.isalnum()).replace('ü', 'ue').replace('ö', 'oe').replace('ä', 'ae').replace('ß', 'ss')
            bem = rnd.choices(['', 'telefonisch anfragen', 'nur Großprojekte', 'nicht mehr anfragen'], [70, 12, 10, 8])[0]
            for a in rnd.sample(arten, rnd.randint(1, len(arten))):
                ws.append([firma, bem, a, f'info@{slug}.example', '0000 000000', f'Musterstraße {rnd.randint(1, 120)}', p, ort,
                           rnd.choice(['', 'Frau Beispiel', 'Herr Muster']), '', f'www.{slug}.example'])
            n += 1
    for col, w in zip('ABCDEFGHIJK', [44, 22, 24, 34, 14, 22, 8, 18, 18, 10, 30]):
        ws.column_dimensions[col].width = w
    wb.save(os.path.join(OUT, 'Lieferantenliste_Musterbau.xlsx'))
    return n


LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" width="360" height="80">
<rect x="4" y="14" width="52" height="52" rx="10" fill="#1F4E79"/>
<path d="M16 54 L30 26 L44 54" fill="none" stroke="#E8772E" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
<text x="70" y="50" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#1F4E79" letter-spacing="1">MUSTERBAU</text>
<text x="72" y="68" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#5D6B7E" letter-spacing="3">GMBH · DEMO</text>
</svg>
'''


def main():
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'musterbau-logo.svg'), 'w', encoding='utf-8').write(LOGO)
    print('Firmen:', lieferanten())
    ag = ['Stadt Musterstadt', 'Landesbetrieb Straßenbau (Demo)', 'Kreis Beispielland', 'Gemeinde Musterdorf', 'Stadtwerke Musterstadt']
    for i in range(1, 6):
        name = f'26-{i:03d}'
        _, z = write_paket(os.path.join('Beispielpakete', f'Paket_{i}'), name, f'Deckenerneuerung Abschnitt {i}', ag[i - 1], lv(22, 34))
        print(f'Paket_{i}: Gewerke', ', '.join(f'{k} {len(v)}' for k, v in z.items()))
    write_paket('Test-Ausschreibung', '26-100', 'Ausbau Beispielweg (Test)', 'Stadt Musterstadt', lv(26, 36), mit_gewerken=False)
    print('fertig:', OUT)


if __name__ == '__main__':
    main()
