#!/usr/bin/env python3
"""Erzeugt erfundene Demo-Daten für Schlüsselfertigbau (GU/GÜ, Holzrahmenbau, mit TGA).

  python3 tools/demo_sf.py                 Demo-Kunde „Holzbau Muster GmbH“ nach demo-daten/sf/
  python3 tools/demo_sf.py --nur-lv --out ORDNER --name 26-500 \\
      --bezeichnung "Neubau Kita Beispielplatz" --auftraggeber "Stadt Beispielstadt"
                                           nur ein Test-LV mit eigener Bezeichnung (z. B. für eine Kundenvorführung)

Ergebnis in demo-daten/sf/:
  Lieferantenliste_Holzbau_Muster.xlsx  erfundene Nachunternehmer (eine Zeile je Firma, Spalte „Gewerk“)
  Beispielpakete/<Projekt>/              Gesamt-LV + VE-Dateien (KÜRZEL_<LV>.D83), wie von Hand vergeben
  Test-Ausschreibung/                    neues LV (Kita in Holzrahmenbau) mit Schnittstellen und gemischten Abschnitten
  holzbau-muster-logo.svg                Demo-Logo

Die LV sind wie beim GU gegliedert: Lose (Rohbau/Holzbau, Hülle, Ausbau, TGA, Außenanlagen) mit Titeln je Gewerk.
Alle Firmen, Adressen und Positionen sind frei erfunden. Braucht openpyxl (nur für die Lieferantenliste).
"""
import argparse, csv, json, os, random, sys, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'demo-daten', 'sf')
sys.path.insert(0, os.path.join(ROOT, 'gaeb_gewerke'))
import gaeb_gewerke as G  # noqa: E402

rnd = random.Random(7)

# ------------------------------------------------------------ Positionen je Abschnitt
# Abschnitt -> (Titel-Varianten, [(VE oder None = Eigenleistung, Kurztext, Langtext, Einheit, (Menge von, bis)), ...])
# Positionen mit fremdem VE im Abschnitt sind Schnittstellen (z. B. Kernbohrung im Abschnitt Heizung).
A = {
    'be': (['Baustelleneinrichtung', 'Baustelleneinrichtung und Allgemeines'], [
        (None, 'Baustelle einrichten', 'Baustelleneinrichtung für alle Leistungen des GU herstellen, vorhalten und räumen.', 'psch', (1, 1)),
        ('BE', 'Bauzaun mobil, Höhe 2,00 m', 'Mobilen Bauzaun mit Fußplatten und Schellen liefern, aufstellen, vorhalten und abbauen.', 'm', (80, 220)),
        ('BE', 'Bürocontainer mit Besprechungsraum', 'Containeranlage als Baubüro inkl. Möblierung und Anschlüssen vorhalten.', 'Mon', (8, 14)),
        ('BE', 'Sanitärcontainer vorhalten', 'Sanitärcontainer mit WC und Waschgelegenheit vorhalten und reinigen.', 'Mon', (8, 14)),
        ('BE', 'Baustromverteiler anschließen', 'Baustromverteiler liefern, anschließen und vorhalten.', 'St', (1, 3)),
        ('GER', 'Arbeits- und Schutzgerüst, Lastklasse 3', 'Fassadengerüst als Arbeits- und Schutzgerüst stellen, vorhalten und abbauen.', 'm2', (400, 900)),
    ]),
    'erd': (['Erdarbeiten', 'Erd- und Verbauarbeiten'], [
        ('ERD', 'Oberboden abtragen und lagern', 'Oberboden 30 cm abtragen, seitlich lagern, Mieten profilieren.', 'm2', (600, 1800)),
        ('ERD', 'Baugrube ausheben, Bodenklasse 3-5', 'Baugrube profilgerecht ausheben, Boden laden und abfahren.', 'm3', (300, 900)),
        ('ERD', 'Arbeitsraum verfüllen und verdichten', 'Arbeitsräume lagenweise verfüllen und verdichten.', 'm3', (80, 250)),
        ('ERD', 'Frostschutzschicht unter Bodenplatte', 'Frostschutzmaterial 0/32 liefern, einbauen und verdichten.', 'm3', (120, 400)),
        (None, 'Vermessung Schnurgerüst', 'Schnurgerüst erstellen und Achsen abstecken.', 'psch', (1, 1)),
    ]),
    'kan': (['Grundleitungen und Entwässerung', 'Entwässerungskanalarbeiten'], [
        ('KAN', 'Grundleitung KG 2000 DN 150', 'Grundleitung aus PP liefern und verlegen, inkl. Formstücke.', 'm', (40, 140)),
        ('KAN', 'Revisionsschacht DN 1000 herstellen', 'Schacht aus Betonfertigteilen mit Abdeckung Klasse D.', 'St', (2, 5)),
        ('KAN', 'Rigole für Regenwasserversickerung', 'Rigolenkörper aus Kunststoffboxen mit Geotextil herstellen.', 'm3', (20, 60)),
        ('KAN', 'Dichtheitsprüfung Grundleitungen', 'Dichtheitsprüfung nach DIN EN 1610 mit Protokoll.', 'psch', (1, 1)),
    ]),
    'roh': (['Gründung und Bodenplatte', 'Beton- und Stahlbetonarbeiten', 'Rohbauarbeiten'], [
        ('ROH', 'Streifenfundament C25/30', 'Streifenfundamente aus Ortbeton herstellen, inkl. Schalung.', 'm3', (20, 70)),
        ('ROH', 'Bodenplatte Stahlbeton d = 25 cm', 'Bodenplatte WU-Beton C30/37 herstellen, glätten.', 'm2', (400, 1200)),
        ('ROH', 'Betonstahl B500B liefern und verlegen', 'Bewehrung nach statischer Berechnung.', 't', (15, 45)),
        ('ROH', 'Perimeterdämmung XPS 160 mm', 'Perimeterdämmung unter Bodenplatte verlegen.', 'm2', (400, 1200)),
        ('ROH', 'Treppenhauskern Stahlbetonwände', 'Aussteifende Stahlbetonwände des Treppenhauses herstellen.', 'm3', (25, 80)),
        ('ABD', 'Bauwerksabdichtung erdberührter Bauteile', 'Abdichtung nach DIN 18533 mit PMBC herstellen.', 'm2', (80, 300)),
        ('BOHR', 'Kernbohrung DN 150 für Hausanschluss', 'Kernbohrung durch Stahlbeton herstellen, Ringraumdichtung.', 'St', (2, 6)),
        ('BLITZ', 'Fundamenterder Edelstahl V4A', 'Fundamenterder als Ring verlegen und anschließen.', 'm', (100, 260)),
    ]),
    'holz': (['Holzrahmenbau', 'Zimmer- und Holzbauarbeiten', 'Holztafelbau Wände und Decken'], [
        ('HOLZ', 'Außenwandelement Holzrahmen, gedämmt', 'Holzrahmen-Außenwand mit Zellulosedämmung 240 mm, OSB innen, Holzfaserplatte außen, vorgefertigt.', 'm2', (500, 1400)),
        ('HOLZ', 'Innenwandelement Holzrahmen tragend', 'Tragende Innenwand in Holzrahmenbauweise, beidseitig beplankt.', 'm2', (200, 700)),
        ('HOLZ', 'Brettsperrholzdecke 200 mm', 'Deckenelemente aus Brettsperrholz liefern und montieren.', 'm2', (300, 1100)),
        ('HOLZ', 'Brettschichtholzträger GL24h', 'Unterzüge aus Brettschichtholz liefern und montieren.', 'm3', (8, 30)),
        ('HOLZ', 'Dachelement Holzrahmen mit Dämmung', 'Dachelemente in Holzrahmenbauweise, Dämmung 300 mm.', 'm2', (400, 1200)),
        ('HOLZ', 'Luftdichtheitsebene abkleben', 'Stöße der Dampfbremse luftdicht abkleben.', 'm', (300, 900)),
        ('HOLZ', 'Montage mit Autokran', 'Montage der Elemente inkl. Kranstellung und Montagepersonal.', 'Tag', (6, 15)),
    ]),
    'dach': (['Dachabdichtung und Gründach', 'Dachdeckungs- und Klempnerarbeiten', 'Flachdach'], [
        ('DACH', 'Dachabdichtung Kunststoffbahn FPO 2-lagig', 'Flachdachabdichtung auf Holzschalung inkl. Trennlage.', 'm2', (400, 1200)),
        ('DACH', 'Extensive Dachbegrünung', 'Extensive Dachbegrünung mit Substrat 10 cm und Sedum.', 'm2', (300, 1000)),
        ('DACH', 'Attikaabdeckung Aluminium', 'Attikaabdeckung aus Aluminium, Zuschnitt 400 mm.', 'm', (120, 300)),
        ('DACH', 'Dachrinne und Fallrohr Titanzink', 'Dachentwässerung aus Titanzink liefern und montieren.', 'm', (40, 120)),
        ('DACH', 'Absturzsicherung Anschlagpunkte', 'Einzelanschlagpunkte nach DIN EN 795 setzen.', 'St', (6, 20)),
        ('GER', 'Dachfanggerüst stellen', 'Dachfanggerüst als Absturzsicherung stellen und vorhalten.', 'm', (60, 160)),
    ]),
    'fen': (['Fenster und Außentüren', 'Fensterelemente'], [
        ('FEN', 'Holz-Alu-Fenster 3-fach verglast', 'Holz-Aluminium-Fenster, Uw ≤ 0,8 W/m²K, inkl. Montage nach RAL.', 'St', (30, 90)),
        ('FEN', 'Hauseingangstür Holz-Alu, barrierefrei', 'Eingangstür mit Seitenteil, barrierefreie Schwelle, Motorschloss.', 'St', (1, 3)),
        ('FEN', 'Fenstertür Terrassenausgang', 'Fenstertür zweiflügelig mit Stulp.', 'St', (6, 18)),
        ('FEN', 'Fensterbank außen Aluminium', 'Außenfensterbank aus Aluminium mit Endkappen.', 'm', (60, 160)),
    ]),
    'fas': (['Fassade', 'Fassadenbekleidung Holz', 'Außenputz und WDVS'], [
        ('FAS', 'Fassadenbekleidung Lärche, vertikal', 'Boden-Deckel-Schalung aus Lärche auf Lattung.', 'm2', (300, 900)),
        ('FAS', 'Unterkonstruktion Konterlattung', 'Konterlattung 40/60 für hinterlüftete Fassade.', 'm2', (300, 900)),
        ('FAS', 'Außenputz auf Holzfaserplatte', 'Mineralischer Putz auf Holzfaserdämmplatte mit Armierung.', 'm2', (100, 400)),
        ('FAS', 'Insektenschutzgitter Lüftungsschlitz', 'Lochblech als Insektenschutz am Fußpunkt.', 'm', (100, 260)),
        ('GER', 'Fassadengerüst vorhalten, Zusatzwochen', 'Gerüstvorhaltung über die Grundstandzeit hinaus.', 'Wo', (4, 12)),
    ]),
    'son': (['Sonnenschutz', 'Sonnenschutzanlagen'], [
        ('SON', 'Raffstore elektrisch, Aluminium', 'Außenraffstore mit Motor und Windwächter.', 'St', (25, 80)),
        ('SON', 'Textiler Sonnenschutz Screen', 'Senkrechtmarkise mit Screengewebe und Motor.', 'St', (6, 20)),
        ('SON', 'Steuerung Sonnenschutz', 'Zentralsteuerung mit Wetterstation.', 'psch', (1, 1)),
    ]),
    'tro': (['Trockenbau', 'Trockenbauarbeiten'], [
        ('TRO', 'Metallständerwand 125 mm, doppelt beplankt', 'Ständerwand mit Gipskarton 2x12,5 mm, Mineralwolle.', 'm2', (300, 900)),
        ('TRO', 'Vorsatzschale Installationswand', 'Vorsatzschale aus Gipsfaser für Sanitärbereiche.', 'm2', (60, 200)),
        ('TRO', 'Akustikdecke Gipskarton gelocht', 'Abhangdecke mit Lochplatten, αw ≥ 0,7.', 'm2', (300, 900)),
        ('TRO', 'Revisionsöffnung 400x400', 'Revisionsklappe in Abhangdecke einbauen.', 'St', (10, 30)),
    ]),
    'est': (['Estricharbeiten', 'Estrich'], [
        ('EST', 'Calciumsulfatestrich 50 mm auf Dämmung', 'Fließestrich als Heizestrich auf Trittschalldämmung.', 'm2', (500, 1500)),
        ('EST', 'Trittschalldämmung EPS-T 30', 'Trittschalldämmung verlegen, Randdämmstreifen.', 'm2', (500, 1500)),
        ('EST', 'Zementestrich im Nassbereich', 'Zementestrich mit Gefälle in Nassräumen.', 'm2', (40, 120)),
    ]),
    'fli': (['Fliesenarbeiten', 'Fliesen- und Plattenarbeiten'], [
        ('FLI', 'Wandfliesen 30x60 im Dünnbett', 'Wandfliesen in Sanitärräumen verlegen und verfugen.', 'm2', (150, 450)),
        ('FLI', 'Bodenfliesen R10 30x60', 'Bodenfliesen rutschhemmend verlegen.', 'm2', (60, 200)),
        ('FLI', 'Verbundabdichtung Nassbereich', 'Flüssige Verbundabdichtung unter Fliesen.', 'm2', (80, 250)),
    ]),
    'mal': (['Malerarbeiten', 'Maler- und Lackierarbeiten'], [
        ('MAL', 'Dispersionsanstrich Wände', 'Wandflächen spachteln Q3 und mit Dispersion streichen.', 'm2', (1200, 3500)),
        ('MAL', 'Deckenanstrich Gipskarton', 'Deckenflächen grundieren und streichen.', 'm2', (400, 1200)),
        ('MAL', 'Holzlasur Innenbauteile', 'Sichtholzflächen lasieren.', 'm2', (100, 400)),
    ]),
    'bod': (['Bodenbelagarbeiten', 'Bodenbeläge Linoleum'], [
        ('BOD', 'Linoleum 2,5 mm verlegen', 'Linoleumbelag vollflächig verkleben, Nähte verschweißen.', 'm2', (400, 1200)),
        ('BOD', 'Sockelleiste Holz', 'Sockelleisten aus Massivholz montieren.', 'm', (300, 900)),
        ('BOD', 'Sauberlaufzone im Eingang', 'Sauberlaufmatte in Mattenrahmen.', 'm2', (4, 12)),
    ]),
    'tis': (['Innentüren', 'Tischlerarbeiten Innentüren'], [
        ('TIS', 'Innentür Holz, Röhrenspan, Stahlzarge', 'Innentürelement mit Drückergarnitur.', 'St', (20, 60)),
        ('TIS', 'Innentür T30-RS', 'Feuerschutztür T30 mit Rauchschutz und Obentürschließer.', 'St', (2, 8)),
        ('TIS', 'Fensterbank innen Holz', 'Innenfensterbank aus Multiplex mit Linoleum.', 'm', (40, 120)),
        ('TIS', 'Garderobenbank mit Fächern', 'Garderobenmöbel nach Zeichnung.', 'St', (4, 12)),
    ]),
    'met': (['Metallbauarbeiten', 'Schlosserarbeiten'], [
        ('MET', 'Treppengeländer Stahl verzinkt', 'Geländer mit Handlauf, Füllung Lochblech.', 'm', (20, 60)),
        ('MET', 'Handlauf Edelstahl wandseitig', 'Handlauf mit Wandhaltern.', 'm', (20, 60)),
        ('MET', 'Gitterrost vor Eingang', 'Gitterrost in Rahmen, rutschhemmend.', 'St', (1, 4)),
    ]),
    'sl': (['Schließanlage'], [
        ('SL', 'Schließzylinder Profil, Schließanlage', 'Profilzylinder in Hauptschlüsselanlage.', 'St', (30, 80)),
        ('SL', 'Generalhauptschlüssel', 'Generalhauptschlüssel für die Anlage.', 'St', (3, 6)),
    ]),
    'rein': (['Baureinigung', 'Reinigungsarbeiten'], [
        ('REIN', 'Bauendreinigung', 'Bauendreinigung aller Räume vor Übergabe.', 'm2', (500, 1500)),
        ('REIN', 'Fensterreinigung beidseitig', 'Glas- und Rahmenreinigung.', 'm2', (150, 400)),
    ]),
    'san': (['KG 410 Sanitär', 'Sanitärinstallation', 'Abwasser-, Wasser- und Gasanlagen'], [
        ('SAN', 'Trinkwasserleitung Edelstahl DN 20', 'Trinkwasserleitung inkl. Formteile und Befestigung.', 'm', (150, 450)),
        ('SAN', 'Abwasserleitung PP DN 100', 'Schallgedämmte Abwasserleitung innerhalb des Gebäudes.', 'm', (80, 220)),
        ('SAN', 'Waschtisch Kinderhöhe', 'Waschtisch inkl. Armatur, Montage in Kinderhöhe.', 'St', (6, 18)),
        ('SAN', 'WC-Anlage wandhängend', 'WC mit Vorwandelement und Betätigungsplatte.', 'St', (6, 16)),
        ('DÄM', 'Rohrdämmung Trinkwasser kalt', 'Dämmung von Rohrleitungen gegen Tauwasser.', 'm', (100, 300)),
        ('TRO', 'Brandschutzabschottung Rohrdurchführung', 'Abschottung R 90 an Deckendurchführungen.', 'St', (10, 40)),
        ('BOHR', 'Kernbohrung DN 100 durch Decke', 'Kernbohrung für Steigleitungen.', 'St', (6, 20)),
    ]),
    'hzg': (['KG 420 Heizung', 'Heizungsanlage', 'Wärmeversorgungsanlagen'], [
        ('HZG', 'Luft-Wasser-Wärmepumpe 40 kW', 'Wärmepumpe außen aufgestellt, inkl. Regelung.', 'St', (1, 2)),
        ('HZG', 'Pufferspeicher 1000 l', 'Pufferspeicher mit Dämmung.', 'St', (1, 2)),
        ('HZG', 'Fußbodenheizung Noppensystem', 'Fußbodenheizung inkl. Heizkreisverteiler.', 'm2', (500, 1400)),
        ('HZG', 'Heizkreisverteiler 8 Kreise', 'Verteiler mit Stellantrieben.', 'St', (3, 8)),
        ('ELT', 'Elektrischer Anschluss Wärmepumpe', 'Elektrischer Anschluss der Wärmepumpe inkl. Zuleitung.', 'psch', (1, 1)),
        ('DÄM', 'Rohrdämmung Heizungsleitungen', 'Dämmung von Rohrleitungen nach GEG.', 'm', (100, 300)),
    ]),
    'rlt': (['KG 430 Lüftung', 'Lüftungsanlage', 'Raumlufttechnische Anlagen'], [
        ('RLT', 'Lüftungsgerät mit Wärmerückgewinnung', 'Zentrales Lüftungsgerät 3000 m³/h, WRG ≥ 80 %.', 'St', (1, 2)),
        ('RLT', 'Luftkanal verzinkt, rechteckig', 'Luftkanäle inkl. Formteile.', 'm2', (150, 450)),
        ('RLT', 'Brandschutzklappe K90', 'Brandschutzklappe mit Auslöseeinrichtung.', 'St', (4, 12)),
        ('RLT', 'Zuluftauslass Drallauslass', 'Drallauslass mit Anschlusskasten.', 'St', (20, 60)),
        ('TRO', 'Abschottung Lüftungsleitung R 90', 'Brandschutzabschottung an Wanddurchführungen.', 'St', (6, 20)),
    ]),
    'elt': (['KG 440 Elektro', 'Elektroinstallation', 'Starkstromanlagen'], [
        ('ELT', 'Unterverteilung Kita', 'Unterverteilung mit FI/LS, komplett verdrahtet.', 'St', (2, 5)),
        ('ELT', 'Mantelleitung NYM-J 3x1,5', 'Installationsleitung im Holzbau in Leerrohr.', 'm', (2500, 6000)),
        ('ELT', 'Steckdose mit Kinderschutz', 'Schutzkontaktsteckdose mit erhöhtem Berührungsschutz.', 'St', (120, 300)),
        ('ELT', 'LED-Leuchte Gruppenraum', 'Pendelleuchte LED, dimmbar.', 'St', (40, 120)),
        ('ELT', 'Sicherheitsbeleuchtung Rettungszeichen', 'Rettungszeichenleuchte mit Einzelbatterie.', 'St', (10, 30)),
        ('BOHR', 'Kernbohrung für Hauseinführung', 'Kernbohrung für Mehrspartenhauseinführung.', 'St', (1, 2)),
    ]),
    'pv': (['Photovoltaikanlage', 'PV-Anlage auf dem Gründach'], [
        ('PV', 'PV-Modul monokristallin 420 Wp', 'PV-Module auf Aufständerung für Gründach.', 'St', (60, 160)),
        ('PV', 'Wechselrichter 30 kW', 'String-Wechselrichter inkl. Montage.', 'St', (1, 2)),
        ('PV', 'Unterkonstruktion Gründach, ballastiert', 'Aufständerung ohne Durchdringung der Abdichtung.', 'm2', (200, 500)),
    ]),
    'blitz': (['Blitzschutz und Erdung', 'Blitzschutzanlage'], [
        ('BLITZ', 'Fangeinrichtung auf Flachdach', 'Fangleitung und Fangstangen.', 'm', (100, 260)),
        ('BLITZ', 'Ableitung Aluminium', 'Ableitung an der Fassade.', 'm', (40, 120)),
        ('ELT', 'Potentialausgleich Hauptschiene', 'Potentialausgleichsschiene anschließen.', 'St', (1, 2)),
    ]),
    'fm': (['KG 450 Fernmelde- und Brandmeldetechnik', 'Brandmeldeanlage und Datennetz'], [
        ('FM', 'Brandmelderzentrale', 'Brandmelderzentrale mit Feuerwehrbedienfeld.', 'St', (1, 1)),
        ('FM', 'Rauchmelder automatisch', 'Optischer Rauchmelder mit Sockel.', 'St', (40, 120)),
        ('FM', 'Datenverkabelung Cat. 7', 'Datenkabel Cat. 7 verlegen.', 'm', (800, 2500)),
        ('FM', 'Netzwerkdose 2-fach', 'Anschlussdose Cat. 6A.', 'St', (20, 60)),
        ('FM', 'Klingelanlage mit Video', 'Video-Türsprechanlage.', 'St', (1, 2)),
    ]),
    'auf': (['Aufzugsanlage', 'KG 460 Förderanlagen'], [
        ('AUF', 'Personenaufzug 630 kg, barrierefrei', 'Seilaufzug ohne Triebwerksraum, 2 Haltestellen.', 'St', (1, 1)),
        ('AUF', 'Wartung Aufzug 1. Jahr', 'Vollwartung im ersten Betriebsjahr.', 'psch', (1, 1)),
    ]),
    'aus': (['Außenanlagen', 'Freianlagen'], [
        ('AUS', 'Betonpflaster 8 cm verlegen', 'Pflaster in Splittbett inkl. Tragschicht.', 'm2', (300, 900)),
        ('AUS', 'Rasenfläche ansäen', 'Gebrauchsrasen ansäen inkl. Fertigstellungspflege.', 'm2', (500, 1500)),
        ('AUS', 'Zaunanlage Stabgitter 1,40 m', 'Stabgitterzaun mit Toren.', 'm', (100, 250)),
        ('AUS', 'Baumpflanzung Hochstamm', 'Hochstamm 18-20 inkl. Verankerung.', 'St', (4, 12)),
    ]),
    'spiel': (['Spielgeräte und Fallschutz', 'Spielplatz'], [
        ('SPIEL', 'Spielgerät Kletterkombination', 'Kletterkombination aus Robinie nach DIN EN 1176.', 'St', (1, 2)),
        ('SPIEL', 'Fallschutz Holzhackschnitzel', 'Fallschutzbereich 30 cm einbauen.', 'm2', (60, 200)),
        ('SPIEL', 'Sandspielbereich mit Einfassung', 'Sandkasten mit Robinieneinfassung.', 'St', (1, 2)),
    ]),
}
LOSE = [('Rohbau und Holzbau', ['be', 'erd', 'kan', 'roh', 'holz', 'dach']), ('Gebäudehülle', ['fen', 'fas', 'son']),
        ('Ausbau', ['tro', 'est', 'fli', 'mal', 'bod', 'tis', 'met', 'sl', 'rein']),
        ('Technische Gebäudeausrüstung', ['san', 'hzg', 'rlt', 'elt', 'pv', 'blitz', 'fm', 'auf']), ('Außenanlagen', ['aus', 'spiel'])]


def projekt(variante, ohne=(), mischen=False):
    """Lose -> Titel -> Positionen. mischen: im Ausbau ein gemischter Titel „Böden“ (Estrich, Fliesen, Belag)."""
    lose = []
    for los, keys in LOSE:
        titel = []
        for k in keys:
            if k in ohne:
                continue
            varianten, pos = A[k]
            wahl = [p for p in pos if rnd.random() < 0.85] or pos[:1]
            titel.append((varianten[variante % len(varianten)], [(c, kt, lt, eh, rnd.randint(lo, hi)) for c, kt, lt, eh, (lo, hi) in wahl]))
        if mischen and los == 'Ausbau':
            boden = [t for t in titel if t[0] in (A['est'][0] + A['fli'][0] + A['bod'][0])]
            titel = [t for t in titel if t not in boden] + [('Böden', [p for t in boden for p in t[1]])]
        lose.append((los, titel))
    return lose


# ------------------------------------------------------------ GAEB 90 mit Losen und Titeln (vereinfacht, für die Demo)
def rec(s):
    return s[:74].ljust(74)


def lv_text(name, bezeichnung, auftraggeber, lose, datum):
    rs = [rec('00' + ' ' * 11 + name.ljust(17)), rec('01' + bezeichnung[:40].ljust(40) + datum),
          rec('02' + bezeichnung), rec('03' + auftraggeber)]
    zuord = {}
    for li, (los, titel) in enumerate(lose, 1):
        rs += [rec('11' + f'{li}'), rec('12' + f'Los {li} {los}')]
        for ti, (t, positionen) in enumerate(titel, 1):
            rs += [rec('11' + f'{li}.{ti:02d}'), rec('12' + t)]
            for pi, (code, kurz, lang, eh, menge) in enumerate(positionen, 1):
                oz = f'{li}.{ti:02d}.{pi * 10:04d}'[:9].ljust(9)
                rs.append(rec('21' + oz + ' ' * 12 + f'{menge * 1000:011d}' + eh.ljust(4)))
                rs.append(rec('25' + kurz))
                for zeile in textwrap.wrap(lang, 69):
                    rs.append(rec('26   ' + zeile))
                if code:
                    zuord.setdefault(code, []).append(oz.strip())
            rs.append(rec('31' + f'{li}.{ti:02d}'))
        rs.append(rec('31' + f'{li}'))
    lines = [r + f'{i + 1:06d}' for i, r in enumerate(rs)]
    n = sum(1 for r in rs if r[:2] == '21')
    lines.append(rec('99').ljust(69)[:69] + f'{n:05d}' + f'{len(lines) + 1:06d}')
    return '\r\n'.join(lines) + '\r\n', zuord


def write_lv(ordner, name, bez, ag, lose, mit_ve=True):
    os.makedirs(ordner, exist_ok=True)
    text, zuord = lv_text(name, bez, ag, lose, '10.06.26')
    main = os.path.join(ordner, name + '.D83')
    open(main, 'wb').write(text.encode('cp850', 'replace'))
    if mit_ve:
        header, root, trailer = G.parse(main)
        for code, oz in zuord.items():
            sel = {it.oz for it in G.iter_items(root) if it.oz.strip() in oz}
            t = G.build(header, root, trailer, code, sel, '20.06.26')
            open(os.path.join(ordner, f'{code}_{name}.D83'), 'wb').write(t.encode('cp850', 'replace'))
    return zuord


# ------------------------------------------------------------ Nachunternehmer-Liste (Aufbau wie eine typische GU-Adressliste)
ORTE = [('59555', 'Lippstadt'), ('59494', 'Soest'), ('33098', 'Paderborn'), ('59065', 'Hamm'), ('59821', 'Arnsberg'), ('59872', 'Meschede'),
        ('33330', 'Gütersloh'), ('44135', 'Dortmund'), ('33602', 'Bielefeld'), ('58095', 'Hagen'), ('48143', 'Münster'), ('34117', 'Kassel')]
GEWERKE_NU = ['Maurer- & Betonbau', 'Tiefbau', 'Holzbau', 'Montage Holzbau', 'Dachdecker', 'Klempner', 'Fenster', 'Sonnenschutz', 'Außenputz',
              'Trockenbau', 'Estrich', 'Fliesenleger', 'Malerarbeiten', 'Bodenlegerarbeiten', 'Tischler', 'Metallbau', 'Schließanlagen',
              'Gebäudereinigung', 'Sanitär', 'Heizung', 'Lüftung', 'Elektroarbeiten', 'PV', 'Blitzschutz', 'Brandmeldetechnik', 'Aufzug',
              'Gebäudeautomation', 'Gerüst', 'Kernbohrung & Betonschneiden', 'Garten- und Landschaftsbau', 'Spielgeräte',
              'Statik', 'TGA Planer', 'Bodengutachten', 'Vermessung', 'Brandschutz', 'Bauphysik', 'Architektur', 'Containerdienst', 'Transport']
NAMEN = ['Becker', 'Schulte', 'Hoffmann', 'Krämer', 'Wiese', 'Lange', 'Busch', 'Vogt', 'Brinkmann', 'Hagedorn', 'Kemper', 'Rüther',
         'Stratmann', 'Wolters', 'Kleine', 'Pieper', 'Tenbrink', 'Wessel', 'Sauerland', 'Hellweg']


def lieferanten(pfad):
    from openpyxl import Workbook
    plz = {r[''] for r in csv.DictReader(open(os.path.join(ROOT, 'src', 'plz.csv'), encoding='utf-8'))}
    orte = [o for o in ORTE if o[0] in plz]
    wb = Workbook(); ws = wb.active; ws.title = 'Subunternehmer'
    ws.append(['Suchbegriff', 'Firma', 'Strasse', 'Plz', 'Ort', 'Bemerkung', 'Ansprechpartner', 'Mail', 'Telefon', 'Gewerk'])
    n = 0
    for gw in GEWERKE_NU:
        for _ in range(rnd.randint(2, 4)):
            p, ort = rnd.choice(orte)
            name = rnd.choice(NAMEN)
            firma = f'{name} {gw.split()[0].rstrip("-&")} (Demo) GmbH'
            slug = ''.join(c for c in f'{name}{gw}{ort}'.lower() if c.isalnum()).replace('ü', 'ue').replace('ö', 'oe').replace('ä', 'ae').replace('ß', 'ss')
            bem = rnd.choices(['', 'nur Großprojekte', 'Tariftreueerklärung liegt vor', 'nicht mehr anfragen'], [70, 10, 12, 8])[0]
            ws.append([name, firma, f'Musterweg {rnd.randint(1, 90)}', p, ort, bem, rnd.choice(['', 'Frau Beispiel', 'Herr Muster']),
                       f'info@{slug[:24]}.example', '0000 000000', gw])
            n += 1
    for col, w in zip('ABCDEFGHIJ', [14, 40, 20, 8, 14, 28, 18, 36, 14, 28]):
        ws.column_dimensions[col].width = w
    wb.save(pfad)
    return n


LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 80" width="380" height="80">
<path d="M8 44 L36 16 L64 44 Z" fill="#2E6B4F"/>
<rect x="16" y="44" width="40" height="26" fill="#2E6B4F"/>
<rect x="30" y="52" width="12" height="18" fill="#C8A165"/>
<text x="78" y="46" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#2E6B4F" letter-spacing="1">HOLZBAU MUSTER</text>
<text x="80" y="66" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#6B5B45" letter-spacing="3">SCHLÜSSELFERTIG · DEMO</text>
</svg>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--nur-lv', action='store_true', help='nur ein Test-LV schreiben')
    ap.add_argument('--out', help='Zielordner für --nur-lv')
    ap.add_argument('--name', default='26-500')
    ap.add_argument('--bezeichnung', default='Neubau Kita Sonnenblume, Am Lindenplatz')
    ap.add_argument('--auftraggeber', default='Stadt Soest (Demo)')
    ap.add_argument('--wahrheit', help='mit --nur-lv: Soll-Zuordnung {OZ: [VE]} als JSON hierhin schreiben (zum Messen)')
    a = ap.parse_args()
    if a.nur_lv:
        z = write_lv(a.out or '.', a.name, a.bezeichnung, a.auftraggeber, projekt(1, mischen=True), mit_ve=False)
        if a.wahrheit:
            soll = {}
            for code, ozs in z.items():
                for oz in ozs:
                    soll.setdefault(oz, []).append(code)
            open(a.wahrheit, 'w', encoding='utf-8').write(json.dumps(soll, ensure_ascii=False))
        print('LV geschrieben:', os.path.join(a.out or '.', a.name + '.D83'), sum(len(v) for v in z.values()), 'Positionen an NU')
        return
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'holzbau-muster-logo.svg'), 'w', encoding='utf-8').write(LOGO)
    print('Firmen:', lieferanten(os.path.join(OUT, 'Lieferantenliste_Holzbau_Muster.xlsx')))
    beispiele = [('26-201', 'Wohnhaus 8 WE in Holzrahmenbau', 'Wohnungsbau Musterstadt eG (Demo)', 0, ('spiel', 'auf')),
                 ('26-202', 'Bürogebäude in Holzhybridbauweise', 'Muster Immobilien GmbH (Demo)', 1, ('spiel',)),
                 ('26-203', 'Kita Regenbogen, Holzrahmenbau', 'Gemeinde Beispieldorf (Demo)', 2, ()),
                 ('26-204', 'Grundschule Erweiterung in Holzmodulbau', 'Stadt Beispielstadt (Demo)', 0, ('spiel',))]
    for name, bez, ag, v, ohne in beispiele:
        z = write_lv(os.path.join(OUT, 'Beispielpakete', name), name, bez, ag, projekt(v, ohne))
        print(name, 'VE:', ', '.join(f'{k} {len(x)}' for k, x in sorted(z.items())))
    write_lv(os.path.join(OUT, 'Test-Ausschreibung'), a.name, a.bezeichnung, a.auftraggeber, projekt(1, mischen=True), mit_ve=False)
    print('fertig:', OUT)


if __name__ == '__main__':
    main()
