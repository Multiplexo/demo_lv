# Gewerke-Anfragen · Demo mit Kunden-Onboarding

Aus einem Gesamt-LV (GAEB 90 `.D83`/`.P83` oder GAEB XML `.X83`) entsteht je Gewerk eine Anfrage-Datei für Subunternehmer, dazu eine Liste der nächstgelegenen passenden Anbieter.
Dieses Repository ist die **mandantenfähige Demo**: Die Logik ist für alle Kunden gleich, alles Kundenspezifische (Name, Logo, Farben, Gewerke, Lieferantenliste, Beispiel-Ausschreibungen, Stichwörter) kommt aus einem **Kundenpaket**, das mit dem **Onboarding** erstellt wird.

Der mitgelieferte Kunde `demo` („Musterbau GmbH“) ist frei erfunden. Es sind keine echten Kundendaten enthalten.

## Schnellstart

Voraussetzung ist nur **Python 3**.

```bash
python3 build.py
```

Erzeugt in `dist/`:

- `Onboarding.html`: der Assistent zum Anlegen eines neuen Kunden
- `Gewerke-Anfragen-demo.html`: die fertige App für den Demo-Kunden

Beide Dateien laufen per Doppelklick in Chrome oder Edge, ohne Server und offline. Alle Daten bleiben im Browser.

Zum Ausprobieren in der App `demo-daten/Test-Ausschreibung/26-100.D83` hineinziehen und „Intelligente Zuordnung“ klicken.

## Einen neuen Kunden anlegen

1. `dist/Onboarding.html` öffnen und die sechs Schritte durchgehen:
   1. **Unternehmen:** Firmenname, Kurzname, Logo, Favicon, Farben (auf Wunsch aus dem Logo übernommen), Login-Name
   2. **Gewerke:** Kürzel, Name, Stichwörter für „Art der Arbeiten“ und Umkreis. Die Vorlage Straßen- und Tiefbau (46 Gewerke) ist der schnellste Start.
   3. **Lieferanten:** Excel (`.xlsx`/`.xlsm`) oder CSV hochladen und die Spalten zuordnen. Arten der Arbeiten ohne Gewerk lassen sich direkt zuordnen. Der Text für gesperrte Firmen wird hier festgelegt.
   4. **Beispiel-Ausschreibungen:** Ordner abgeschlossener Vergabepakete (Gesamt-LV + Gewerke-Dateien `KÜRZEL_<LV>.D83`) ablegen. Unbekannte Kürzel werden abgefragt.
   5. **Stichwörter:** eindeutige Begriffe, Wort → Gewerk
   6. **Prüfen & erzeugen:** Checkliste, Trefferquote (jedes Paket wird aus den übrigen vorgeschlagen und mit der echten Zuordnung verglichen), danach Download von App und Kundenpaket
2. Der Entwurf wird im Browser zwischengespeichert. Mit „Kundenpaket öffnen“ lässt sich ein heruntergeladenes Paket später weiterbearbeiten.
3. Das Kundenpaket (`Kundenpaket-<kurzname>.zip`) enthält `kunden/<kurzname>/kunde.json`, `data.json` und `kw.json`. Ins Repository entpacken und mit `python3 build.py` bauen.

Zum Testen des Onboardings liegen unter `demo-daten/` eine Lieferantenliste, fünf Beispielpakete, ein Test-LV und ein Logo (erzeugt mit `python3 tools/demo_daten.py`, braucht `openpyxl`).

## Aufbau

```
build.py                 baut App(s) und Onboarding; nur Python-Standardbibliothek
src/
  app.html               Vorlage der App; Kundendaten über die Platzhalter /*KUNDE*/, /*DATA*/, /*KW*/
  onboarding.html/.js    Onboarding-Assistent (erzeugt Kundenpaket und App direkt im Browser)
  xlsx.js                liest .xlsx/.xlsm/.csv und ZIP ohne Fremdbibliothek
  vorlage.js             Vorlage Straßen- und Tiefbau: Gewerke, Kürzel-Aliasse, Stichwörter
  engine.js              Gewerke-Vorschlag: Katalog-Regeln, Stichwörter, ähnlichste Position (TF-IDF)
  gaeb.js, x83.js        GAEB 90 und GAEB XML lesen und schreiben
  pdfsite.js, pdf*.js    Baustelle aus der „Aufforderung zur Angebotsabgabe“ (PDF)
  plz.csv                PLZ -> Koordinaten (für die Entfernung zur Baustelle)
kunden/<kurzname>/       ein Ordner je Kunde: kunde.json, data.json, kw.json
gaeb_gewerke/            Kommandozeile: Zuordnung auslesen, LV zerlegen, Abgleich
demo-daten/, tools/      erfundene Demo-Daten und ihr Generator
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

Ein Kundenpaket enthält die Lieferantenliste mit Kontaktdaten. Deshalb ignoriert `.gitignore` alle Ordner unter `kunden/` außer `demo`.
Für einen echten Kunden ein **eigenes, privates Repository** anlegen (Kopie dieses Repos), das Kundenpaket dort einchecken, die Ausnahme in `.gitignore` für diesen Kunden ergänzen und mit `KUNDE=<kurzname>` deployen.

## Hinweise

- Speicher im Browser (Regeln, Sperren, gelernte Beispiele) ist je Kunde getrennt (Schlüssel `gwa.<kurzname>.…`).
- `src/gaeb.js` und `gaeb_gewerke/gaeb_gewerke.py` implementieren dieselbe GAEB-90-Logik (CP850). Änderungen auf beiden Seiten nachziehen.
- `fill()` gibt es zweimal, in `build.py` und in `src/onboarding.js`. Beide müssen dieselben Platzhalter gleich ersetzen.
- Die Demo-LV sind vereinfachte, synthetisch erzeugte GAEB-90-Dateien. Die Trefferquote auf Demo-Daten ist deshalb höher als bei echten Ausschreibungen.
