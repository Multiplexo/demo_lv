# Gewerke-Anfragen · Demo mit Kunden-Onboarding

Aus einem Gesamt-LV (GAEB 90 `.D83`/`.P83` oder GAEB XML `.X83`, auch Phasen 81 bis 86) entsteht je Gewerk eine Anfrage-Datei für Subunternehmer, dazu eine Liste der nächstgelegenen passenden Anbieter.
Die Gewerke kommen aus einer **Vorlagen-Bibliothek** je Sparte: Straßen- und Tiefbau sowie Schlüsselfertigbau aus Sicht GU/GÜ (mit Planung, Holzbau und TGA).
Dieses Repository ist die **mandantenfähige Demo**: Die Logik ist für alle Kunden gleich, alles Kundenspezifische (Name, Logo, Farben, Gewerke, Lieferantenliste, Beispiel-Ausschreibungen, Stichwörter) kommt aus einem **Kundenpaket**, das mit dem **Onboarding** erstellt wird.

Mitgeliefert sind zwei frei erfundene Kunden, ohne echte Kundendaten:

- `demo` („Musterbau GmbH“): Straßen- und Tiefbau, Test-LV `demo-daten/Test-Ausschreibung/26-100.D83`
- `demo-sf` („Holzbau Muster GmbH“): Schlüsselfertigbau als GU/GÜ, Holzrahmenbau mit TGA, Test-LV `demo-daten/sf/Test-Ausschreibung/26-500.D83` (Kita mit Losen, Titeln je Gewerk und Schnittstellen)

## Schnellstart

Voraussetzung ist nur **Python 3**.

```bash
python3 build.py
```

Erzeugt in `dist/`:

- `Onboarding.html`: der Assistent zum Anlegen eines neuen Kunden
- `Gewerke-Anfragen-demo.html`, `Gewerke-Anfragen-demo-sf.html`: die fertigen Apps der Demo-Kunden

Beide Dateien laufen per Doppelklick in Chrome oder Edge, ohne Server und offline. Alle Daten bleiben im Browser.

Zum Ausprobieren in der App `demo-daten/Test-Ausschreibung/26-100.D83` hineinziehen und „Intelligente Zuordnung“ klicken.

## Einen neuen Kunden anlegen

1. `dist/Onboarding.html` öffnen und die sechs Schritte durchgehen:
   1. **Unternehmen:** Firmenname, Kurzname, Logo, Favicon, Farben (auf Wunsch aus dem Logo übernommen), Login-Name
   2. **Gewerke:** Kürzel, Name, Stichwörter für „Art der Arbeiten“, Stichwörter in Abschnittstiteln und Umkreis. Am schnellsten mit einer Vorlage: Straßen- und Tiefbau (46 Gewerke) oder Schlüsselfertigbau GU/GÜ (48 Vergabeeinheiten). Vorlagen lassen sich kombinieren („zu den vorhandenen hinzufügen“).
   3. **Lieferanten:** Excel (`.xlsx`/`.xlsm`) oder CSV hochladen und die Spalten zuordnen. Arten der Arbeiten ohne Gewerk lassen sich direkt zuordnen. Der Text für gesperrte Firmen wird hier festgelegt.
   4. **Beispiel-Ausschreibungen:** Ordner abgeschlossener Vergabepakete (Gesamt-LV + Gewerke-Dateien `KÜRZEL_<LV>.D83`) ablegen. Unbekannte Kürzel werden abgefragt.
   5. **Stichwörter:** eindeutige Begriffe, Wort → Gewerk. „Schnittstelle“ (z. B. Kernbohrung, Abschottung) fügt das Gewerk zusätzlich hinzu und markiert die Position zur Prüfung.
   6. **Prüfen & erzeugen:** Checkliste, Trefferquote (jedes Paket wird aus den übrigen vorgeschlagen und mit der echten Zuordnung verglichen), danach Download von App und Kundenpaket
2. Der Entwurf wird im Browser zwischengespeichert. Mit „Kundenpaket öffnen“ lässt sich ein heruntergeladenes Paket später weiterbearbeiten.
3. Das Kundenpaket (`Kundenpaket-<kurzname>.zip`) enthält `kunden/<kurzname>/kunde.json`, `data.json` und `kw.json`. Ins Repository entpacken und mit `python3 build.py` bauen.

Zum Testen des Onboardings liegen unter `demo-daten/` eine Lieferantenliste, fünf Beispielpakete, ein Test-LV und ein Logo (erzeugt mit `python3 tools/demo_daten.py`, braucht `openpyxl`).
Für Schlüsselfertigbau liegen unter `demo-daten/sf/` NU-Liste, vier Beispielprojekte, Test-LV und Logo (erzeugt mit `python3 tools/demo_sf.py`). Mit `--nur-lv --bezeichnung … --auftraggeber …` entsteht ein einzelnes Test-LV für eine Kundenvorführung.

## So entsteht der Vorschlag

1. **Katalog-Regel:** Die Katalognummer beginnt mit einer bekannten Nummer (StLK, z. B. Straßen.NRW)
2. **Titel-Regel:** Der Abschnittstitel passt zu einem Gewerk (z. B. „Holzrahmenbau“, „KG 420 Heizung“). Passt ein Titel zu mehreren Gewerken („Fassade und Fenster“), entscheiden Stichwort oder ähnliche Position.
3. **Stichwort** im Kurztext; Schnittstellen-Stichwörter ergänzen das Gewerk des Abschnitts und markieren „Schnittstelle prüfen“
4. **Ähnlichste bekannte Position** aus Beispielpaketen und exportierten LV

Im Export kommen **Projektvorgaben** (für alle oder je Gewerk, z. B. aus der Bewertungsmatrix) in E-Mail-Text und ZIP. PDFs aus dem Ausschreibungsordner lassen sich als **Anlagen** mitschicken; Tariftreue-, Mindestlohn- und Eigenerklärungen sind vorausgewählt.

## Aufbau

```
build.py                 baut App(s) und Onboarding; nur Python-Standardbibliothek
src/
  app.html               Vorlage der App; Kundendaten über die Platzhalter /*KUNDE*/, /*DATA*/, /*KW*/
  onboarding.html/.js    Onboarding-Assistent (erzeugt Kundenpaket und App direkt im Browser)
  xlsx.js                liest .xlsx/.xlsm/.csv und ZIP ohne Fremdbibliothek
  vorlage.js             Vorlagen-Bibliothek (VORLAGEN) mit Straßen- und Tiefbau; vorlage_<sparte>.js hängt weitere an
  vorlage_sf.js          Schlüsselfertigbau GU/GÜ: Vergabeeinheiten inkl. Planung, Holzbau, TGA; Titel- und Schnittstellen-Stichwörter
  engine.js              Gewerke-Vorschlag: Katalog-, Titel- und Stichwort-Regeln, ähnlichste Position (TF-IDF)
  gaeb.js, x83.js        GAEB 90 und GAEB XML lesen und schreiben
  pdfsite.js, pdf*.js    Baustelle aus der „Aufforderung zur Angebotsabgabe“ (PDF)
  plz.csv                PLZ -> Koordinaten (für die Entfernung zur Baustelle)
kunden/<kurzname>/       ein Ordner je Kunde: kunde.json, data.json, kw.json
gaeb_gewerke/            Kommandozeile: Zuordnung auslesen, LV zerlegen, Abgleich
demo-daten/, tools/      erfundene Demo-Daten und ihre Generatoren (demo_daten.py, demo_sf.py)
Dockerfile, deploy/      nginx mit Passwortschutz
```

`kunde.json` enthält Name, Kurzname, Farben, Logo und Favicon (als data-URL), den Login-Namen, die Sperr-Kennzeichnung und die Paketnamen. Unter `onboarding` stehen zusätzlich die Bearbeitungsdaten, die die App nicht braucht.
`data.json` enthält Beispielpositionen, Firmen, Gewerke und Aliasse. Die PLZ-Tabelle setzt `build.py` beim Bauen hinzu.

## Deployment (Sliplane / Docker)

```bash
docker build --build-arg KUNDE=demo -t gewerke-demo .
docker run -p 8080:80 -e BASIC_AUTH_PASSWORD=geheim gewerke-demo
```

- `/` ist die App des gewählten Kunden, `/onboarding.html` das Onboarding, `/healthz` der Healthcheck ohne Login.
- `BASIC_AUTH_PASSWORD` ist Pflicht, sonst startet der Container nicht. `BASIC_AUTH_USER` ist optional, Standard `demo`.
- Sliplane: Port 80, Healthcheck-Pfad `/healthz`, Umgebungsvariable `BASIC_AUTH_PASSWORD`. Ein anderer Kunde wird über das Build-Argument `KUNDE` gewählt.

## Echte Kunden

Ein Kundenpaket enthält die Lieferantenliste mit Kontaktdaten. Deshalb ignoriert `.gitignore` alle Ordner unter `kunden/` außer `demo` und `demo-sf`.
Für einen echten Kunden ein **eigenes, privates Repository** anlegen (Kopie dieses Repos), das Kundenpaket dort einchecken, die Ausnahme in `.gitignore` für diesen Kunden ergänzen und mit `KUNDE=<kurzname>` deployen.

## Hinweise

- Speicher im Browser (Regeln, Sperren, gelernte Beispiele) ist je Kunde getrennt (Schlüssel `gwa.<kurzname>.…`).
- `src/gaeb.js` und `gaeb_gewerke/gaeb_gewerke.py` implementieren dieselbe GAEB-90-Logik (CP850). Änderungen auf beiden Seiten nachziehen.
- `fill()` gibt es zweimal, in `build.py` und in `src/onboarding.js`. Beide müssen dieselben Platzhalter gleich ersetzen.
- Die Demo-LV sind vereinfachte, synthetisch erzeugte GAEB-90-Dateien. Die Trefferquote auf Demo-Daten ist deshalb höher als bei echten Ausschreibungen.
