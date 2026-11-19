# Hinweise für Claude

Projektbeschreibung, Aufbau und Befehle stehen in README.md. Bitte zuerst lesen.

- Antworte auf Deutsch.
- `dist/` wird von `build.py` erzeugt und nicht eingecheckt. Änderungen gehören in `src/`, `kunden/` oder `build.py`.
- Kundenspezifisches gehört nie in `src/`, sondern in ein Kundenpaket unter `kunden/<kurzname>/`. Die App liest es über `KUNDE` und `DATA`.
- Keine echten Kundendaten in dieses Repository: `kunden/` außer `demo` ist per `.gitignore` ausgeschlossen.
- `pdf*.min.js` und `kunden/*/data.json` nicht komplett einlesen.
- Nach Änderungen `python3 build.py` ausführen und `dist/Onboarding.html` sowie `dist/Gewerke-Anfragen-demo.html` im Browser prüfen (Demo-Daten unter `demo-daten/`).
- Die Oberfläche muss als einzelne Datei offline laufen: keine externen Skripte, kein Server, kein Build-Tool außer `build.py`.
- `fill()` in `build.py` und in `src/onboarding.js` synchron halten. Ebenso `src/gaeb.js` und `gaeb_gewerke/gaeb_gewerke.py` (GAEB 90, CP850).
- Dateinamen mit Umlauten (SCHÜTT, BÜRO) kommen auf dem Mac zerlegt (NFD) an. Immer mit `normalize('NFC')` vergleichen.
