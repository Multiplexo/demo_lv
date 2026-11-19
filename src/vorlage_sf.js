// Vorlage Schlüsselfertigbau aus Sicht GU/GÜ: Vergabeeinheiten inkl. Planung, Holzbau und TGA.
// titel = Stichwörter in Abschnittstiteln des LV (z. B. „Holzrahmenbau“, „KG 420 Heizung“), daraus werden Titel-Regeln.
// kw mit schnitt = Schnittstelle (Kernbohrung, Abschottung, Gerüst …): Gewerk kommt dazu, Position wird zur Prüfung markiert.
VORLAGEN.push({
 "id": "schluesselfertig",
 "name": "Schlüsselfertigbau (GU/GÜ, mit TGA)",
 "gewerke": [
  {
   "code": "ARCH",
   "name": "Objektplanung / Architektur",
   "stichwoerter": [
    "architekt",
    "objektplanung"
   ],
   "titel": [
    "objektplanung",
    "architektenleistung"
   ],
   "radius": 150
  },
  {
   "code": "TWP",
   "name": "Tragwerksplanung",
   "stichwoerter": [
    "statik",
    "tragwerksplan"
   ],
   "titel": [
    "tragwerksplanung"
   ],
   "radius": 150
  },
  {
   "code": "PRÜF",
   "name": "Prüfstatik",
   "stichwoerter": [
    "prüfstatik",
    "prüfingenieur"
   ],
   "titel": [
    "prüfstatik",
    "bautechnische prüfung"
   ],
   "radius": 300
  },
  {
   "code": "TGAP",
   "name": "TGA-Planung",
   "stichwoerter": [
    "tga planer",
    "tga-planer",
    "tga-planung",
    "haustechnikplanung"
   ],
   "titel": [
    "tga-planung",
    "fachplanung tga"
   ],
   "radius": 150
  },
  {
   "code": "BRS",
   "name": "Brandschutzkonzept",
   "stichwoerter": [
    "brandschutz"
   ],
   "titel": [
    "brandschutzkonzept",
    "brandschutzgutachten"
   ],
   "radius": 200
  },
  {
   "code": "BPH",
   "name": "Bauphysik / Energienachweis",
   "stichwoerter": [
    "bauphysik",
    "energieberat",
    "wärmeschutznachweis",
    "blower"
   ],
   "titel": [
    "bauphysik",
    "energienachweis",
    "luftdichtheitsmessung"
   ],
   "radius": 200
  },
  {
   "code": "VERM",
   "name": "Vermessung",
   "stichwoerter": [
    "vermessung"
   ],
   "titel": [
    "vermessung"
   ],
   "radius": 80
  },
  {
   "code": "BGU",
   "name": "Baugrundgutachten",
   "stichwoerter": [
    "bodengutachten",
    "baugrund",
    "geotechnik"
   ],
   "titel": [
    "baugrund",
    "bodengutachten"
   ],
   "radius": 100
  },
  {
   "code": "SIGEKO",
   "name": "SiGeKo",
   "stichwoerter": [
    "sigeko"
   ],
   "titel": [
    "sigeko",
    "sicherheits- und gesundheitsschutz"
   ],
   "radius": 150
  },
  {
   "code": "BE",
   "name": "Baustelleneinrichtung",
   "stichwoerter": [
    "baustelleneinrichtung",
    "container",
    "bauzaun",
    "baustrom"
   ],
   "titel": [
    "baustelleneinrichtung"
   ],
   "radius": 100
  },
  {
   "code": "GER",
   "name": "Gerüst",
   "stichwoerter": [
    "gerüst"
   ],
   "titel": [
    "gerüst"
   ],
   "radius": 80
  },
  {
   "code": "ABB",
   "name": "Abbruch / Rückbau",
   "stichwoerter": [
    "abbruch",
    "rückbau",
    "schadstoffsanierung"
   ],
   "titel": [
    "abbruch",
    "rückbau"
   ],
   "radius": 80
  },
  {
   "code": "ERD",
   "name": "Erdarbeiten",
   "stichwoerter": [
    "tiefbau",
    "erdarbeiten",
    "erdbau"
   ],
   "titel": [
    "erdarbeiten",
    "erdbau",
    "verbau",
    "wasserhaltung"
   ],
   "radius": 60
  },
  {
   "code": "KAN",
   "name": "Entwässerung / Grundleitungen",
   "stichwoerter": [
    "entwässerung",
    "kanalbau",
    "grundleitung"
   ],
   "titel": [
    "entwässerung",
    "grundleitungen",
    "kanalarbeiten"
   ],
   "radius": 60
  },
  {
   "code": "ROH",
   "name": "Rohbau (Beton- und Maurerarbeiten)",
   "stichwoerter": [
    "maurer",
    "betonbau",
    "rohbau",
    "stahlbeton"
   ],
   "titel": [
    "rohbau",
    "mauerarbeiten",
    "betonarbeiten",
    "beton- und stahlbeton",
    "gründung",
    "bodenplatte"
   ],
   "radius": 60
  },
  {
   "code": "BOHR",
   "name": "Kernbohrungen / Betonschneiden",
   "stichwoerter": [
    "kernbohr",
    "betonschneid",
    "tiefenbohrung",
    "betonbohr"
   ],
   "titel": [
    "kernbohrungen",
    "betonschneid"
   ],
   "radius": 100
  },
  {
   "code": "ABD",
   "name": "Bauwerksabdichtung",
   "stichwoerter": [
    "abdichtung"
   ],
   "titel": [
    "bauwerksabdichtung",
    "abdichtungsarbeiten"
   ],
   "radius": 150
  },
  {
   "code": "STB",
   "name": "Stahlbau",
   "stichwoerter": [
    "stahlbau"
   ],
   "titel": [
    "stahlbau"
   ],
   "radius": 150
  },
  {
   "code": "HOLZ",
   "name": "Holzbau (Holzrahmen / Holzmodul)",
   "stichwoerter": [
    "holzbau",
    "holzrahmen",
    "zimmerei",
    "zimmerer",
    "modulbau",
    "holzmodul"
   ],
   "titel": [
    "holzbau",
    "holzrahmenbau",
    "zimmer- und holzbau",
    "zimmerarbeiten",
    "zimmererarbeiten",
    "holzmodul",
    "holztafelbau"
   ],
   "radius": 150
  },
  {
   "code": "DACH",
   "name": "Dach (Dachdecker / Klempner)",
   "stichwoerter": [
    "dachdeck",
    "dachabdicht",
    "klempner",
    "spengler",
    "bedachung"
   ],
   "titel": [
    "dach",
    "dachdeckung",
    "dachabdichtung",
    "klempner",
    "flachdach",
    "gründach"
   ],
   "radius": 100
  },
  {
   "code": "FAS",
   "name": "Fassade / Außenputz / WDVS",
   "stichwoerter": [
    "außenputz",
    "aussenputz",
    "fassade",
    "wdvs",
    "verblend"
   ],
   "titel": [
    "fassade",
    "wdvs",
    "außenputz",
    "wärmedämmverbund",
    "vorgehängte"
   ],
   "radius": 100
  },
  {
   "code": "FEN",
   "name": "Fenster und Außentüren",
   "stichwoerter": [
    "fenster",
    "außentür",
    "haustür"
   ],
   "titel": [
    "fenster",
    "außentüren"
   ],
   "radius": 150
  },
  {
   "code": "SON",
   "name": "Sonnenschutz",
   "stichwoerter": [
    "sonnenschutz",
    "rollladen",
    "raffstore",
    "jalousie"
   ],
   "titel": [
    "sonnenschutz",
    "rollladen"
   ],
   "radius": 200
  },
  {
   "code": "PR",
   "name": "Pfosten-Riegel / Verglasung",
   "stichwoerter": [
    "pfosten-riegel",
    "glasfassade",
    "verglasung",
    "glaserei"
   ],
   "titel": [
    "pfosten-riegel",
    "verglasungsarbeiten"
   ],
   "radius": 200
  },
  {
   "code": "MET",
   "name": "Metallbau / Schlosser",
   "stichwoerter": [
    "metallbau",
    "schlosser",
    "geländer"
   ],
   "titel": [
    "metallbau",
    "schlosser"
   ],
   "radius": 100
  },
  {
   "code": "TRO",
   "name": "Trockenbau",
   "stichwoerter": [
    "trockenbau"
   ],
   "titel": [
    "trockenbau"
   ],
   "radius": 100
  },
  {
   "code": "PUTZ",
   "name": "Innenputz",
   "stichwoerter": [
    "innenputz",
    "verputz",
    "stuck"
   ],
   "titel": [
    "innenputz",
    "putz- und stuck"
   ],
   "radius": 80
  },
  {
   "code": "EST",
   "name": "Estrich",
   "stichwoerter": [
    "estrich"
   ],
   "titel": [
    "estrich"
   ],
   "radius": 100
  },
  {
   "code": "FLI",
   "name": "Fliesen",
   "stichwoerter": [
    "fliese"
   ],
   "titel": [
    "fliesen",
    "plattenarbeiten"
   ],
   "radius": 80
  },
  {
   "code": "MAL",
   "name": "Maler / Lackierer",
   "stichwoerter": [
    "maler",
    "anstrich",
    "lackier",
    "tapezier"
   ],
   "titel": [
    "malerarbeiten",
    "maler- und lackier",
    "beschichtung"
   ],
   "radius": 80
  },
  {
   "code": "BOD",
   "name": "Bodenbelag",
   "stichwoerter": [
    "bodenbelag",
    "bodenleger",
    "parkett",
    "linoleum",
    "kautschuk",
    "teppich"
   ],
   "titel": [
    "bodenbel",
    "parkett"
   ],
   "radius": 100
  },
  {
   "code": "TIS",
   "name": "Tischler / Innentüren",
   "stichwoerter": [
    "tischler",
    "innentür",
    "schreiner"
   ],
   "titel": [
    "tischler",
    "innentüren"
   ],
   "radius": 100
  },
  {
   "code": "SL",
   "name": "Schließanlage / Beschläge",
   "stichwoerter": [
    "schließanlage",
    "schließtechnik",
    "beschlag"
   ],
   "titel": [
    "schließanlage",
    "beschlag"
   ],
   "radius": 200
  },
  {
   "code": "REIN",
   "name": "Baureinigung",
   "stichwoerter": [
    "reinigung"
   ],
   "titel": [
    "reinigung"
   ],
   "radius": 80
  },
  {
   "code": "KÜ",
   "name": "Küche / Großküche",
   "stichwoerter": [
    "großküche",
    "küche",
    "gastro"
   ],
   "titel": [
    "küche"
   ],
   "radius": 200
  },
  {
   "code": "SAN",
   "name": "Sanitär",
   "stichwoerter": [
    "sanitär",
    "gas-wasser",
    "wasserinstallation"
   ],
   "titel": [
    "sanitär",
    "kg 410",
    "abwasser-, wasser",
    "trinkwasser"
   ],
   "radius": 100
  },
  {
   "code": "HZG",
   "name": "Heizung",
   "stichwoerter": [
    "heizung",
    "wärmepumpe",
    "wärmeversorgung"
   ],
   "titel": [
    "heizung",
    "kg 420",
    "wärmeversorgung",
    "wärmeerzeugung"
   ],
   "radius": 100
  },
  {
   "code": "RLT",
   "name": "Lüftung / Klima",
   "stichwoerter": [
    "lüftung",
    "klima",
    "raumluft"
   ],
   "titel": [
    "lüftung",
    "raumlufttechn",
    "kg 430",
    "klima"
   ],
   "radius": 150
  },
  {
   "code": "ELT",
   "name": "Elektro",
   "stichwoerter": [
    "elektro",
    "starkstrom"
   ],
   "titel": [
    "elektro",
    "starkstrom",
    "kg 440",
    "niederspannung"
   ],
   "radius": 80
  },
  {
   "code": "PV",
   "name": "Photovoltaik",
   "stichwoerter": [
    "photovoltaik",
    "pv",
    "solar"
   ],
   "titel": [
    "photovoltaik",
    "pv-anlage"
   ],
   "radius": 150
  },
  {
   "code": "BLITZ",
   "name": "Blitzschutz / Erdung",
   "stichwoerter": [
    "blitzschutz"
   ],
   "titel": [
    "blitzschutz"
   ],
   "radius": 150
  },
  {
   "code": "FM",
   "name": "Fernmelde / Daten / Brandmelde",
   "stichwoerter": [
    "fernmelde",
    "datennetz",
    "brandmelde",
    "kommunikation",
    "schwachstrom",
    "sicherheitstechnik"
   ],
   "titel": [
    "fernmelde",
    "informationstechn",
    "kg 450",
    "brandmelde",
    "kommunikation",
    "gefahrmelde"
   ],
   "radius": 150
  },
  {
   "code": "AUF",
   "name": "Aufzug",
   "stichwoerter": [
    "aufzug"
   ],
   "titel": [
    "aufzug",
    "förderanlagen",
    "kg 460"
   ],
   "radius": 500
  },
  {
   "code": "GLT",
   "name": "Gebäudeautomation",
   "stichwoerter": [
    "gebäudeautomation",
    "msr",
    "gebäudeleittechnik"
   ],
   "titel": [
    "gebäudeautomation",
    "kg 480",
    "msr-technik"
   ],
   "radius": 200
  },
  {
   "code": "DÄM",
   "name": "Dämmung technischer Anlagen",
   "stichwoerter": [
    "rohrisolierung",
    "technische dämmung",
    "isolierung"
   ],
   "titel": [
    "dämmarbeiten an technischen",
    "technische dämmung"
   ],
   "radius": 150
  },
  {
   "code": "SPR",
   "name": "Sprinkler / Löschanlagen",
   "stichwoerter": [
    "sprinkler",
    "löschanlage",
    "feuerlösch"
   ],
   "titel": [
    "sprinkler",
    "feuerlösch"
   ],
   "radius": 300
  },
  {
   "code": "AUS",
   "name": "Außenanlagen / GaLaBau",
   "stichwoerter": [
    "garten- und landschaftsbau",
    "galabau",
    "außenanlagen",
    "landschaftsbau",
    "pflaster"
   ],
   "titel": [
    "außenanlagen",
    "landschaftsbau",
    "freianlagen"
   ],
   "radius": 80
  },
  {
   "code": "SPIEL",
   "name": "Spielgeräte / Fallschutz",
   "stichwoerter": [
    "spielgeräte",
    "spielplatz",
    "fallschutz"
   ],
   "titel": [
    "spielgeräte",
    "spielplatz"
   ],
   "radius": 300
  }
 ],
 "alias": {
  "ELEKTRO": "ELT",
  "ELEK": "ELT",
  "E": "ELT",
  "HEIZ": "HZG",
  "HEI": "HZG",
  "SANI": "SAN",
  "LÜFT": "RLT",
  "LUEFT": "RLT",
  "MAURER": "ROH",
  "BETON": "ROH",
  "ZIMMER": "HOLZ",
  "ZIM": "HOLZ",
  "DACHD": "DACH",
  "MALER": "MAL",
  "FLIESE": "FLI",
  "TÜR": "TIS",
  "GALA": "AUS"
 },
 "kw": [
  {
   "wort": "brettsperrholz",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "holzrahmen",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "holztafel",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "konstruktionsvollholz",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "brettschichtholz",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "holzmodul",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "zellulosedämmung",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "holzfaserdämm",
   "codes": [
    "HOLZ"
   ]
  },
  {
   "wort": "dachabdichtung",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "dachrinne",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "fallrohr",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "attikaabdeckung",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "extensive dachbegrünung",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "dachziegel",
   "codes": [
    "DACH"
   ]
  },
  {
   "wort": "wärmedämmverbund",
   "codes": [
    "FAS"
   ]
  },
  {
   "wort": "außenputz",
   "codes": [
    "FAS"
   ]
  },
  {
   "wort": "fassadenbekleidung",
   "codes": [
    "FAS"
   ]
  },
  {
   "wort": "fenster",
   "codes": [
    "FEN"
   ]
  },
  {
   "wort": "hauseingangstür",
   "codes": [
    "FEN"
   ]
  },
  {
   "wort": "raffstore",
   "codes": [
    "SON"
   ]
  },
  {
   "wort": "rollladen",
   "codes": [
    "SON"
   ]
  },
  {
   "wort": "außenjalousie",
   "codes": [
    "SON"
   ]
  },
  {
   "wort": "bodenplatte",
   "codes": [
    "ROH"
   ]
  },
  {
   "wort": "streifenfundament",
   "codes": [
    "ROH"
   ]
  },
  {
   "wort": "mauerwerk",
   "codes": [
    "ROH"
   ]
  },
  {
   "wort": "stahlbeton",
   "codes": [
    "ROH"
   ]
  },
  {
   "wort": "perimeterdämmung",
   "codes": [
    "ROH"
   ]
  },
  {
   "wort": "oberboden abtragen",
   "codes": [
    "ERD"
   ]
  },
  {
   "wort": "baugrube",
   "codes": [
    "ERD"
   ]
  },
  {
   "wort": "verfüllen",
   "codes": [
    "ERD"
   ]
  },
  {
   "wort": "grundleitung",
   "codes": [
    "KAN"
   ]
  },
  {
   "wort": "revisionsschacht",
   "codes": [
    "KAN"
   ]
  },
  {
   "wort": "bauwerksabdichtung",
   "codes": [
    "ABD"
   ]
  },
  {
   "wort": "gipskarton",
   "codes": [
    "TRO"
   ]
  },
  {
   "wort": "gipsfaser",
   "codes": [
    "TRO"
   ]
  },
  {
   "wort": "metallständerwand",
   "codes": [
    "TRO"
   ]
  },
  {
   "wort": "abhangdecke",
   "codes": [
    "TRO"
   ]
  },
  {
   "wort": "akustikdecke",
   "codes": [
    "TRO"
   ]
  },
  {
   "wort": "innenputz",
   "codes": [
    "PUTZ"
   ]
  },
  {
   "wort": "zementestrich",
   "codes": [
    "EST"
   ]
  },
  {
   "wort": "calciumsulfatestrich",
   "codes": [
    "EST"
   ]
  },
  {
   "wort": "trittschalldämmung",
   "codes": [
    "EST"
   ]
  },
  {
   "wort": "wandfliesen",
   "codes": [
    "FLI"
   ]
  },
  {
   "wort": "bodenfliesen",
   "codes": [
    "FLI"
   ]
  },
  {
   "wort": "dispersionsanstrich",
   "codes": [
    "MAL"
   ]
  },
  {
   "wort": "lasur",
   "codes": [
    "MAL"
   ]
  },
  {
   "wort": "tapete",
   "codes": [
    "MAL"
   ]
  },
  {
   "wort": "raufaser",
   "codes": [
    "MAL"
   ]
  },
  {
   "wort": "linoleum",
   "codes": [
    "BOD"
   ]
  },
  {
   "wort": "kautschuk",
   "codes": [
    "BOD"
   ]
  },
  {
   "wort": "parkett",
   "codes": [
    "BOD"
   ]
  },
  {
   "wort": "sockelleiste",
   "codes": [
    "BOD"
   ]
  },
  {
   "wort": "innentür",
   "codes": [
    "TIS"
   ]
  },
  {
   "wort": "zarge",
   "codes": [
    "TIS"
   ]
  },
  {
   "wort": "fensterbank innen",
   "codes": [
    "TIS"
   ]
  },
  {
   "wort": "treppengeländer",
   "codes": [
    "MET"
   ]
  },
  {
   "wort": "handlauf",
   "codes": [
    "MET"
   ]
  },
  {
   "wort": "gitterrost",
   "codes": [
    "MET"
   ]
  },
  {
   "wort": "schließzylinder",
   "codes": [
    "SL"
   ]
  },
  {
   "wort": "generalhauptschlüssel",
   "codes": [
    "SL"
   ]
  },
  {
   "wort": "bauendreinigung",
   "codes": [
    "REIN"
   ]
  },
  {
   "wort": "feinreinigung",
   "codes": [
    "REIN"
   ]
  },
  {
   "wort": "waschtisch",
   "codes": [
    "SAN"
   ]
  },
  {
   "wort": "wc-anlage",
   "codes": [
    "SAN"
   ]
  },
  {
   "wort": "trinkwasser",
   "codes": [
    "SAN"
   ]
  },
  {
   "wort": "abwasserleitung",
   "codes": [
    "SAN"
   ]
  },
  {
   "wort": "vorwandinstallation",
   "codes": [
    "SAN"
   ]
  },
  {
   "wort": "wärmepumpe",
   "codes": [
    "HZG"
   ]
  },
  {
   "wort": "fußbodenheizung",
   "codes": [
    "HZG"
   ]
  },
  {
   "wort": "heizkörper",
   "codes": [
    "HZG"
   ]
  },
  {
   "wort": "pufferspeicher",
   "codes": [
    "HZG"
   ]
  },
  {
   "wort": "lüftungsgerät",
   "codes": [
    "RLT"
   ]
  },
  {
   "wort": "wärmerückgewinnung",
   "codes": [
    "RLT"
   ]
  },
  {
   "wort": "luftkanal",
   "codes": [
    "RLT"
   ]
  },
  {
   "wort": "brandschutzklappe",
   "codes": [
    "RLT"
   ]
  },
  {
   "wort": "unterverteilung",
   "codes": [
    "ELT"
   ]
  },
  {
   "wort": "steckdose",
   "codes": [
    "ELT"
   ]
  },
  {
   "wort": "leuchte",
   "codes": [
    "ELT"
   ]
  },
  {
   "wort": "mantelleitung",
   "codes": [
    "ELT"
   ]
  },
  {
   "wort": "sicherheitsbeleuchtung",
   "codes": [
    "ELT"
   ]
  },
  {
   "wort": "photovoltaik",
   "codes": [
    "PV"
   ]
  },
  {
   "wort": "pv-modul",
   "codes": [
    "PV"
   ]
  },
  {
   "wort": "wechselrichter",
   "codes": [
    "PV"
   ]
  },
  {
   "wort": "fangeinrichtung",
   "codes": [
    "BLITZ"
   ]
  },
  {
   "wort": "erdungsanlage",
   "codes": [
    "BLITZ"
   ]
  },
  {
   "wort": "fundamenterder",
   "codes": [
    "BLITZ"
   ]
  },
  {
   "wort": "brandmelde",
   "codes": [
    "FM"
   ]
  },
  {
   "wort": "rauchwarnmelder",
   "codes": [
    "FM"
   ]
  },
  {
   "wort": "datenverkabelung",
   "codes": [
    "FM"
   ]
  },
  {
   "wort": "netzwerkdose",
   "codes": [
    "FM"
   ]
  },
  {
   "wort": "klingelanlage",
   "codes": [
    "FM"
   ]
  },
  {
   "wort": "aufzug",
   "codes": [
    "AUF"
   ]
  },
  {
   "wort": "raumregelung",
   "codes": [
    "GLT"
   ]
  },
  {
   "wort": "gebäudeleittechnik",
   "codes": [
    "GLT"
   ]
  },
  {
   "wort": "pflaster",
   "codes": [
    "AUS"
   ]
  },
  {
   "wort": "rasen",
   "codes": [
    "AUS"
   ]
  },
  {
   "wort": "zaunanlage",
   "codes": [
    "AUS"
   ]
  },
  {
   "wort": "baumpflanzung",
   "codes": [
    "AUS"
   ]
  },
  {
   "wort": "spielgerät",
   "codes": [
    "SPIEL"
   ]
  },
  {
   "wort": "fallschutz",
   "codes": [
    "SPIEL"
   ]
  },
  {
   "wort": "sandspielbereich",
   "codes": [
    "SPIEL"
   ]
  },
  {
   "wort": "arbeitsgerüst",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "schutzgerüst",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "fassadengerüst",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "fanggerüst",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "raumgerüst",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "gerüstvorhaltung",
   "codes": [
    "GER"
   ],
   "schnitt": true
  },
  {
   "wort": "kernbohrung",
   "codes": [
    "BOHR"
   ],
   "schnitt": true
  },
  {
   "wort": "durchbruch",
   "codes": [
    "BOHR"
   ],
   "schnitt": true
  },
  {
   "wort": "brandschutzabschottung",
   "codes": [
    "TRO"
   ],
   "schnitt": true
  },
  {
   "wort": "abschottung",
   "codes": [
    "TRO"
   ],
   "schnitt": true
  },
  {
   "wort": "rohrdämmung",
   "codes": [
    "DÄM"
   ],
   "schnitt": true
  },
  {
   "wort": "dämmung von rohrleitungen",
   "codes": [
    "DÄM"
   ],
   "schnitt": true
  },
  {
   "wort": "elektrischer anschluss",
   "codes": [
    "ELT"
   ],
   "schnitt": true
  },
  {
   "wort": "potentialausgleich",
   "codes": [
    "ELT"
   ],
   "schnitt": true
  },
  {
   "wort": "fundament für",
   "codes": [
    "ROH"
   ],
   "schnitt": true
  }
 ]
});
