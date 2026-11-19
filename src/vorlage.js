// Vorlage Straßen- und Tiefbau: Gewerke, Kürzel-Aliasse und Start-Stichwörter.
// Wird im Onboarding über „Vorlage laden“ übernommen und kann dort frei angepasst werden.
const VORLAGE={
 "gewerke": [
  {
   "code": "BAU",
   "name": "Baustoffe",
   "stichwoerter": [
    "baustoffe",
    "betonwaren",
    "betonsteine",
    "pflastersteine",
    "schachtteile",
    "betonrohre",
    "kunststoffrohre",
    "entwässerungsrinnen",
    "geotextil",
    "geogitter",
    "geokunststoffe"
   ],
   "radius": 80
  },
  {
   "code": "MG",
   "name": "Mischgut + Fräsgut",
   "stichwoerter": [
    "mischgut",
    "asphaltzusätze"
   ],
   "radius": 40
  },
  {
   "code": "SCHÜTT",
   "name": "Schüttgüter + Entsorgung",
   "stichwoerter": [
    "schüttgüter",
    "entsorgung",
    "bodenentsorgung",
    "deponie",
    "sand",
    "bodenlieferung"
   ],
   "radius": 50
  },
  {
   "code": "VS",
   "name": "Verkehrssicherung",
   "stichwoerter": [
    "verkehrssicherung",
    "absperr",
    "ampelverleih",
    "led-vorwarntafeln"
   ],
   "radius": 100
  },
  {
   "code": "MARK",
   "name": "Markierung",
   "stichwoerter": [
    "markierung",
    "demarkierung",
    "roadmarker",
    "glasmarker"
   ],
   "radius": 150
  },
  {
   "code": "FUG",
   "name": "Fugen",
   "stichwoerter": [
    "fugen",
    "nähte",
    "schneiden (asphalt)"
   ],
   "radius": 150
  },
  {
   "code": "ANSPR",
   "name": "Anspritzen",
   "stichwoerter": [
    "anspritzarbeiten",
    "bitumenemulsion",
    "asphaltarmierung"
   ],
   "radius": 100
  },
  {
   "code": "ARM",
   "name": "Armierung",
   "stichwoerter": [
    "asphaltarmierung"
   ],
   "radius": 150
  },
  {
   "code": "TEER",
   "name": "teerhaltiges Material",
   "stichwoerter": [
    "pech-/teerhaltiges",
    "teeruntersuchung"
   ],
   "radius": 100
  },
  {
   "code": "BÜRO",
   "name": "Baubüro",
   "stichwoerter": [
    "baubüro",
    "wc-mietservice"
   ],
   "radius": 100
  },
  {
   "code": "BESCH",
   "name": "Beschilderung",
   "stichwoerter": [
    "verkehrszeichen"
   ],
   "radius": 150
  },
  {
   "code": "GEL",
   "name": "Geländer",
   "stichwoerter": [
    "geländer"
   ],
   "radius": 150
  },
  {
   "code": "KAMPF",
   "name": "Kampfmittel",
   "stichwoerter": [
    "kampfmittel"
   ],
   "radius": 200
  },
  {
   "code": "BETON",
   "name": "Betonwaren",
   "stichwoerter": [
    "betonwaren",
    "betonsteine",
    "fertigteile",
    "betonteile"
   ],
   "radius": 100
  },
  {
   "code": "PFLASTER",
   "name": "Pflasterarbeiten",
   "stichwoerter": [
    "pflaster"
   ],
   "radius": 80
  },
  {
   "code": "KANAL",
   "name": "Kanaluntersuchung",
   "stichwoerter": [
    "kanal-",
    "kanal-tv",
    "kanal-inspektion",
    "kanal-untersuchung",
    "kanal-dichtheit",
    "kanal-reinigung"
   ],
   "radius": 100
  },
  {
   "code": "KANALBAU",
   "name": "Offene Kanalbauarbeiten",
   "stichwoerter": [
    "kanalbau",
    "leitungsbau",
    "rohrleitungsbau"
   ],
   "radius": 80
  },
  {
   "code": "INLINER",
   "name": "Inliner",
   "stichwoerter": [
    "kanalsanierung",
    "schlauchliner",
    "inliner",
    "rohrsanierung"
   ],
   "radius": 200
  },
  {
   "code": "SCHUTZ",
   "name": "Schutzplanken",
   "stichwoerter": [
    "schutzplanken",
    "stahlschutzwand",
    "schutzeinrichtungen"
   ],
   "radius": 200
  },
  {
   "code": "BANK",
   "name": "Bankette",
   "stichwoerter": [
    "bankett"
   ],
   "radius": 100
  },
  {
   "code": "BAUFELD",
   "name": "Baufeldräumung + Baumschutz",
   "stichwoerter": [
    "baufeldräumung",
    "baumfällung",
    "rodung",
    "baumschutz",
    "gehölzpflege"
   ],
   "radius": 80
  },
  {
   "code": "BAUM",
   "name": "Baumfachliche Baubegleitung",
   "stichwoerter": [
    "baubegleitung (baumschutzfachlich)",
    "baumgutachten"
   ],
   "radius": 150
  },
  {
   "code": "EPS",
   "name": "Eichenprozessionsspinner",
   "stichwoerter": [
    "eichenprozessionsspinner",
    "schädlingsbekämpfung"
   ],
   "radius": 150
  },
  {
   "code": "LEIT",
   "name": "Leitpfosten",
   "stichwoerter": [
    "leitpfosten"
   ],
   "radius": 150
  },
  {
   "code": "FÜ",
   "name": "Fahrbahnübergänge",
   "stichwoerter": [
    "fahrbahnübergänge",
    "dehnfugen"
   ],
   "radius": 300
  },
  {
   "code": "BW",
   "name": "Bauwerk",
   "stichwoerter": [
    "bauwerk",
    "betonsanierung",
    "abdichtungen"
   ],
   "radius": 150
  },
  {
   "code": "GUSS",
   "name": "Gussasphalt",
   "stichwoerter": [
    "gussasphalt"
   ],
   "radius": 150
  },
  {
   "code": "FILTER",
   "name": "Filtersubstratrinnen",
   "stichwoerter": [
    "entwässerungsrinnen",
    "abscheidetechnik"
   ],
   "radius": 300
  },
  {
   "code": "MÖRTEL",
   "name": "Vermörtelung",
   "stichwoerter": [
    "mörtel",
    "fugenmörtel"
   ],
   "radius": 150
  },
  {
   "code": "AUS",
   "name": "Ausstattung",
   "stichwoerter": [
    "ausstattung"
   ],
   "radius": 200
  },
  {
   "code": "ENT",
   "name": "Entsorgung",
   "stichwoerter": [
    "entsorgung",
    "deponie"
   ],
   "radius": 50
  },
  {
   "code": "GAB",
   "name": "Gabionen",
   "stichwoerter": [
    "gabionen"
   ],
   "radius": 200
  },
  {
   "code": "SIGEKO",
   "name": "SiGeKo",
   "stichwoerter": [
    "sigeko"
   ],
   "radius": 150
  },
  {
   "code": "IND",
   "name": "Induktionsschleifen",
   "stichwoerter": [
    "induktionsschleifen"
   ],
   "radius": 200
  },
  {
   "code": "GRIFF",
   "name": "Griffigkeitsmessung",
   "stichwoerter": [
    "griffigkeit",
    "scrimmessung"
   ],
   "radius": 300
  },
  {
   "code": "PROB",
   "name": "Proben",
   "stichwoerter": [
    "proben",
    "prüfungen",
    "asphaltprüfungen",
    "beprobung"
   ],
   "radius": 150
  },
  {
   "code": "MO",
   "name": "Mobile Schrankenanlage",
   "stichwoerter": [
    "absperrschranke",
    "toranlagen (schrankenanlagen)"
   ],
   "radius": 200
  },
  {
   "code": "MAST",
   "name": "Maste",
   "stichwoerter": [
    "maste",
    "mastleuchten"
   ],
   "radius": 200
  },
  {
   "code": "LSA",
   "name": "Lichtsignalanlagen",
   "stichwoerter": [
    "lichtsignalanlagen",
    "ampelverleih",
    "signalbau"
   ],
   "radius": 150
  },
  {
   "code": "ELEKTRO",
   "name": "Elektroarbeiten",
   "stichwoerter": [
    "elektroarbeiten",
    "kabelarbeiten",
    "straßenbeleuchtung",
    "beleuchtung"
   ],
   "radius": 100
  },
  {
   "code": "GRÜND",
   "name": "Gründung",
   "stichwoerter": [
    "pfahlgründung",
    "tiefgründung",
    "bohrpfähle",
    "spezialtiefbau"
   ],
   "radius": 200
  },
  {
   "code": "FUND",
   "name": "Betonfundamente",
   "stichwoerter": [
    "streifenfundamente",
    "betonarbeiten",
    "ortbeton"
   ],
   "radius": 100
  },
  {
   "code": "METALL",
   "name": "Metallbau",
   "stichwoerter": [
    "metallbau",
    "stahlbau"
   ],
   "radius": 150
  },
  {
   "code": "HÜLL",
   "name": "Hüllrohre",
   "stichwoerter": [
    "kunststoffrohre",
    "kabelarbeiten"
   ],
   "radius": 150
  },
  {
   "code": "ERSCHÜTT",
   "name": "Erschütterungsmessung",
   "stichwoerter": [
    "erschütterungsmessung",
    "schwingungsmessung",
    "beweissicherung"
   ],
   "radius": 200
  },
  {
   "code": "ABFALL",
   "name": "Abfallbehälter",
   "stichwoerter": [
    "abfallbehälter"
   ],
   "radius": 300
  }
 ],
 "alias": {
  "ANS": "ANSPR",
  "ANSPNA": "ANSPR",
  "BS": "BAU",
  "BÜR": "BÜRO",
  "BÜROC": "BÜRO",
  "FU": "FUG",
  "MAR": "MARK",
  "MISCH": "MG",
  "SG": "SCHÜTT",
  "BA": "BANK",
  "UNTER": "KANAL",
  "VZ": "BESCH"
 },
 "kw": [
  {
   "wort": "markierung",
   "codes": [
    "MARK"
   ]
  },
  {
   "wort": "leitlinie",
   "codes": [
    "MARK"
   ]
  },
  {
   "wort": "sperrfläche",
   "codes": [
    "MARK"
   ]
  },
  {
   "wort": "bitumenemulsion",
   "codes": [
    "ANSPR"
   ]
  },
  {
   "wort": "anspritz",
   "codes": [
    "ANSPR"
   ]
  },
  {
   "wort": "verkehrssicherung",
   "codes": [
    "VS"
   ]
  },
  {
   "wort": "absperr",
   "codes": [
    "VS"
   ]
  },
  {
   "wort": "umleitungsbeschilderung",
   "codes": [
    "VS"
   ]
  },
  {
   "wort": "warnleuchte",
   "codes": [
    "VS"
   ]
  },
  {
   "wort": "Transp. LSA",
   "codes": [
    "VS"
   ]
  },
  {
   "wort": "baubüro",
   "codes": [
    "BÜRO"
   ]
  },
  {
   "wort": "bürocontainer",
   "codes": [
    "BÜRO"
   ]
  },
  {
   "wort": "kampfmittel",
   "codes": [
    "KAMPF"
   ]
  },
  {
   "wort": "schutzplanke",
   "codes": [
    "SCHUTZ"
   ]
  },
  {
   "wort": "gussasphalt",
   "codes": [
    "GUSS"
   ]
  },
  {
   "wort": "griffigkeit",
   "codes": [
    "GRIFF"
   ]
  },
  {
   "wort": "induktionsschleife",
   "codes": [
    "IND"
   ]
  },
  {
   "wort": "teer",
   "codes": [
    "TEER"
   ]
  },
  {
   "wort": "pechhaltig",
   "codes": [
    "TEER"
   ]
  },
  {
   "wort": "geländer",
   "codes": [
    "GEL"
   ]
  },
  {
   "wort": "leitpfosten",
   "codes": [
    "LEIT"
   ]
  },
  {
   "wort": "sigeko",
   "codes": [
    "SIGEKO"
   ]
  },
  {
   "wort": "fugenband",
   "codes": [
    "FUG"
   ]
  },
  {
   "wort": "fugenverguss",
   "codes": [
    "FUG"
   ]
  },
  {
   "wort": "asphalttragschicht",
   "codes": [
    "MG"
   ]
  },
  {
   "wort": "asphaltdeckschicht",
   "codes": [
    "MG"
   ]
  },
  {
   "wort": "asphaltbinder",
   "codes": [
    "MG"
   ]
  },
  {
   "wort": "inliner",
   "codes": [
    "INLINER"
   ]
  },
  {
   "wort": "schlauchliner",
   "codes": [
    "INLINER"
   ]
  },
  {
   "wort": "tv-untersuchung",
   "codes": [
    "KANAL"
   ]
  },
  {
   "wort": "kanalinspektion",
   "codes": [
    "KANAL"
   ]
  }
 ]
};
