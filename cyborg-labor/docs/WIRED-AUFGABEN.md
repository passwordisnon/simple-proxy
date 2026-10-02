# WIRED 2.0 · Aufgaben neu gedacht

Stand: 2 October 2026. Jede alte Aufgabe ist hier auf die neue Struktur umgeschrieben. Wer eine Aufgabe umsetzt, liest zuerst den Abschnitt "Für alle Aufgaben gilt".

## Für alle Aufgaben gilt

- **Welt:** Jeder Planet ist ein Kindertraum von 1999, den NEMURI aus Bildern nachgebaut hat. Uhr steht auf 31.12.1999 23:59. Jeder Ort hat: Traumquelle, Haupttätigkeit, einen Rissling, eine Ruine von Kokon 95/97.
- **Look Candy-Mech:** durchsichtiges Bonbon-Plastik (bondi, grape, tangerine, lime, strawberry) über sichtbaren Zahnrädern und Leiterbahnen, Chrom-Rahmen mit Schrauben, Gel-Knöpfe, Sticker, LCD-Anzeigen. Farben und Schriften aus `wired.css` und dem Design-System. Japanisch nur als Sticker-Schmuck.
- **Drei Ebenen:** Kokon (Alltag, bunt), Wired (Menüs, Wartungstunnel, Nacht), Riss (Glitch: Farben weg, Stromleitungen, ein Rot). Riss nur für Glitch-Momente.
- **Ton:** unheimlich, aber warm. Nie Horror, nie Gewalt. Kehrmaschinen werden umgangen, nicht bekämpft.
- **Kinder:** keine Sexualisierung, keine Körper-Inszenierung. Kein Glücksspiel um Geld.
- **Beamer** ist nur Ansicht und gehört nicht zur Geschichte. Alles andere ist freies Spiel.
- **Sprache:** alle Texte auf Deutsch schreiben; `i18n.js` übersetzt. Neue Menütexte zusätzlich ins Wörterbuch `D` (en, fr, it, ja).
- **Assets:** CC0 zuerst (Kenney, Quaternius, KayKit, Glitch, ambientCG, Poly Haven), CC-BY mit Nennung, keine Share-alike-Grafik. Lizenz in `docs/LIZENZEN.md` eintragen.
- **Technik:** Ein Rumpf aus einem Guss. Gegenstände über `GAME.placeObj` (exakte Höhe, tiefster Punkt der Grundfläche). Wege bleiben frei. Neue Planeten über `PLANETKIT.add`.
- **Abschluss jeder Aufgabe:** Kopftest mit `tools/app-test.mjs` (keine PAGEERROR), Wunschliste aktualisieren, committen, pushen, Spiel-Artifact neu veröffentlichen, PR grün halten.

## Zahlen neu: geschätzt aus Paketgrösse und Brauchbarkeit

Grundsatz: so viel wie möglich verwenden, alles im Hintergrund laden. Jeder Planet lädt nur seine Pakete (gruppenweise), der Rest wird geladen, während man spielt, und im Browser zwischengespeichert. Grenzen des Artifacts: 16 MB je Datei, 256 MB je Version.

| Quelle | Inhalt | brauchbar im Candy-Mech-Stil | wofür |
| --- | --- | --- | --- |
| Glitch (CC0) | 10'000+ 2D-Grafiken | ca. 40 % (Gegenstände, Wesen, Pflanzen, Icons) | Sammelbuch-Bilder, Sticker, Poster, Wandbilder, Ladenschilder, Gegenstand-Icons |
| Quaternius (CC0) | Sci-Fi MegaKit 270+, Nature MegaKit 110+, Monsters 50, Robot, Mech, Tiere | ca. 70 % | Wartungstunnel, NEMURI-Kern, Bäume und Felsen, Tiere, Risslinge, Kehrmaschinen, Körperteile |
| Kenney 3D (CC0) | Space, Space Station, Modular Space, Factory 140+, Conveyor, City, Platformer 150+, Furniture, Food, Holiday, Nature 330, Arcade | ca. 60 % | Möbel, Fabrik- und Arcade-Planeten, Natur, Esswaren, Raumstationen |
| KayKit (CC0) | Furniture Bits, Space Base, Platformer, Restaurant, City Builder | ca. 70 % | Möbel 1999, Läden, Kaufhaus |
| ambientCG / Poly Haven (CC0) | 2'000+ Materialien, 990 HDRIs | ca. 50 Materialien, 10 Himmel | Plastik, Chrom, Lack; Lichtstimmungen |
| Freedoom (BSD) | Hunderte Texturen, Klänge, Musik | ca. 20 % | Wartungstunnel, Riss-Geräusche |
| Kenney Audio (CC0) | ca. 230 Klänge | ca. 80 % | Knöpfe, Relais, Piepser |
| 効果音ラボ | Tausende Klänge | ca. 300 | Spielklänge, Tiere, Alltag 1999 |
| DOVA | Tausende Stücke | ca. 50 | eine Melodie je Planet und Menü (gepackt) |
| Blender-Open-Movies (CC-BY) | Figuren, Tiere, Requisiten | wenige, gezielt | Spezial-Tiere, Bühnenbilder |

| Bereich | bisher | neu (Ziel) | woher |
| --- | --- | --- | --- |
| Planeten | 15 | **30**, alle von Hand gebaut (14 bestehende im WIRED-Umbau, 15 neue, eigener Planet) + Glitch-Kern | Liste im Briefing, 7 Gruppen |
| Monde | 0 | **7** (einer je Gruppe, kleine Spezialorte) | PLANETKIT |
| Raumstationen | 3 | **7** (eine je Gruppe) | Kenney Space Station, Quaternius Sci-Fi |
| Je Planet | gemischt | **volles Set:** 12 Fische, 12 Insekten, 6 Tiere, 1 Rissling-Familie, eigene Möbel- und Kleiderlinie, eigene Musik, 10 Fundstücke, eigene Natur | handverlesen aus allen Paketen |
| Körperteile | 263 | **ca. 1'000** | Quaternius Robot/Mech, Kenney Space/Factory, eigene |
| Rumpfformen | 11 | **36** | eigene Modelle |
| Häute und Muster | 21 | **50** | ambientCG, Bonbon-Plastik-Shader |
| Natur-Modelle | 169 | **ca. 600** | Quaternius Nature, Kenney Nature, OpenGameArt CC0 |
| Möbel und Deko | 333 | **ca. 1'500** | Kenney, KayKit, Quaternius, Glitch-Poster und -Sticker |
| Gegenstände | 65 | **ca. 1'000** | Glitch (CC0), Kenney Food/Holiday |
| Fische / Insekten | 96 / 90 | **360 / 360** | 12 je Planet |
| Tiere | einige je Planet | **180** | 6 je Planet |
| Risslinge | 0 | **30 Familien** | eine je Planet |
| Fundstücke | 53 | **300** | Kokon-95/97, Fossilien, Glitch |
| Kleidung | Boutique | **ca. 400** | 1999-Mode, kindgerecht |
| Musikstücke | 6 | **ca. 45 + eigene Musik im Browser** | DOVA (gepackt), Web-Audio |
| Klänge | 55 | **ca. 800** | Kenney, 効果音ラボ, Freedoom, ZzFX |
| Sprachen | 1 | **4 von Hand + alle weiteren maschinell** | i18n.js |

**Reserve:** Gefunden sind Tausende über Tausende weiterer Stücke (Glitch, Kenney, Quaternius, KayKit, OpenGameArt-CC0, ambientCG, Poly Haven, 効果音ラボ, DOVA). Sie bleiben als Reserve im Hintergrund und kommen am Schluss dazu, wenn Zeit und Speicher reichen.

**Qualität vor Menge:** Jedes Stück wird von Hand ausgewählt und muss im Candy-Mech-Stil gut aussehen und etwas tun. Die Zahlen sind Obergrenzen, keine Pflicht.

**Speicher:** Das Artifact fasst 256 MB je Version und 16 MB je Datei. Darum: Modelle als kompakte Pakete (wie `assets/kits`, Vertex-Farben statt Texturen), Bilder als Sprite-Blätter, Audio gebündelt und komprimiert. Alles wird im Hintergrund pro Planet nachgeladen und im Browser zwischengespeichert. Was nicht in eine Version passt, kommt in den Asset-Speicher des Artifacts. Varianten (Farbe, Muster, Grösse, Kombination) entstehen im Spiel und kosten keinen Speicher.

Die Zahlen sind Schätzungen. Was im Stil nicht passt, wird weggelassen, auch wenn das Ziel dann kleiner ausfällt.

## 1. Körper 2.0 (ersetzt: Rumpfformen im Tierdorf-Stil neu)

Ziel: 36 Rumpfformen statt 11 (die folgenden 24 zuerst), als Spielzeug von 1999 mit Mechanik.
- Bestehende 11 Formen (Ei, Kugel, Kapsel, Birne, Kiste, Dose, Bohne, Glocke, Mochi, Tropfen, Teddy) überarbeiten: knuffige Tierdorf-Proportionen, kurzer Hals, weicher Bauch.
- 13 neue Formen: Kapselspielzeug (zweiteilige Plastikkugel), Ei-Gerät mit Bildschirm, Plüsch mit Reissverschluss, Roboter-Dose mit Nieten, Gameboy-Block, Wasserkocher, Laterne, Goldfischglas, Konserventurm, Wollknäuel, Seifenblase, Radiowecker, Rucksack-Roboter.
- Neue Haut "Bonbon-Plastik": durchsichtig, innen drehen sich Zahnräder (Shader), Farbe aus den Candy-Tönen.
- Immer ein einziger Rumpf. Kleidung (`torsoShell`) muss jede Form umschliessen.

## 2. Inhalte verdoppeln (ersetzt: nature2.js ~40 Modelle, Gegenstände, Fische, Insekten, Relikte)

- Körperteile von 263 auf rund 1000, je Slot ein Candy-Mech-Satz (Antennen, Lautsprecher-Ohren, Klappbildschirm-Köpfe, Gel-Hände, Rollschuh-Beine, Rückenschlüssel).
- Natur je Planetengruppe statt einer allgemeinen Liste: Spielzeug-Pflanzen (Kreisel-Blumen, Kabelranken, Glasfaser-Gras), dazu die bestehende Natur im neuen Look.
- Fische und Insekten: je Planet 6 Arten (je rund 360, 12 je Planet). Dazu **30 Rissling-Familien** (eine je Planet) als eigene Sammelseite (Zwilling, Bergbrecher, Schwebling, Echo, Zeichensalat, Durchgänger und je Gruppe weitere).
- Relikte werden **Kokon-Fundstücke**: Disketten, CRT-Splitter, Pager, Traumhelm-Teile, Tagebuchseiten der früheren Schläfer:innen. Dino-Fossilien bleiben in der Urzeit-Gruppe.
- Gegenstände des Alltags 1999: Pager, CD-Player, durchsichtiges Telefon, Gelstifte, Kapselspielzeug, Virtual-Pet-Ei.

## 3. Haus 2.0 (ersetzt: mehr Hausgegenstände und Anbauten)

- Bestehende Anbauten (Sternwarte, Gewächshaus, Labor) im Candy-Mech-Look neu.
- Neue Anbauten: Arcade-Ecke (Minispiele), Funkstation (Pager-Botschaften an Freund:innen), Server-Schrank (Daten sammeln), **Wartungsluke** (ab Akt III Einstieg in die Tunnel).
- Möbel "Kinderzimmer 1999": Lavalampe, aufblasbarer Sessel, Röhrenfernseher mit Konsole, Perlenvorhang, Leuchtsterne, durchsichtiges Telefon, Ghettoblaster, Hochbett, Sitzsack, Aquarium mit Bildschirmschoner.
- Neue Läden kommen auf den Planeten Kaufhaus 1999 statt als weitere Dorfgebäude.

## 4. Planeten (ersetzt: 30+ Planeten, Monde, Stationen, Biome, 3 neue Planeten)

- Grundlage ist die Liste im Briefing: 7 Gruppen, jede ein Raum im Glitch-Kern. Es bleiben 30 Planeten, alle von Hand gebaut, dazu 7 Monde und 7 Stationen.
- **Umbau** der 14 bestehenden Planeten: Bonbon-Plastik-Schilder und Bänke mit Zahnrädern, LCD-Anzeigen, versteckte Wartungsluke, Rissling-Lebensraum, Ruine.
- **15 neue**, gruppenweise, in der Qualität von Urzeit, Metro und Dschungel: zuerst die Urzeit-Gruppe (Bernstein-Mond, Dino-Spielzeugfabrik), dann Metro (Neon-Arkade, Kaufhaus 1999, Funkturm, Magnetbahn-Ring), dann Dschungel (Ranken-Rechenzentrum, Leuchtquallen-Tiefsee), dann Himmel, Uhrwerk, Bildschirm.
- **Monde:** Bernstein-Mond und Uhrwerk-Mond sind die ersten besuchbaren Monde.
- **Raumstationen** werden Kokon-Wartungsstationen mit Toonami-Gängen; Rennen bleiben.
- **Glitch-Kern** als Finalort zuletzt.

## 5. Raumfahrt (ersetzt: steuerbares Raumschiff, Sonnensystem-Karte, Raketen-Bau, Bruchlandung)

- Ist schon gebaut. Umbau: Raketenteile im Candy-Mech-Stil (durchsichtige Rümpfe, Gel-Flossen), Sonnensystem-Karte als LCD-Sternkarte im Cy-Phone, Planeten nach Gruppen geordnet.
- Die Bruchlandung wird Teil des Prologs: Piko schlüpft beim Reparieren.

## 6. Sprach- und Wetter-Ebene (ersetzt: No-Man's-Sky-Ebene)

- Die Alien-Schrift wird **NEMURIs alte Kokon-Schrift**. Wortsteine in Ruinen sind Tagebuchzeilen; je mehr Wörter gelernt, desto mehr Tagebuch lesbar. Passt zum Rissling Zeichensalat.
- Wetter, Wolken, Ringe bleiben. Neu: Riss-Wetter, das mit der Geschichte zunimmt (Bildrauschen-Schnee, Scanline-Regen, kurz stehende Wolken).

## 7. Freies Spiel (ersetzt: Jobs, Wirtschaft, Casino, Zoo, Fossilien, Terraforming, eigener Planet, Rennen, Modeladen)

- Alles bleibt freies Spiel neben der Geschichte und bekommt den neuen Look.
- **Glücks-Salon:** Vorschlag, ihn durch Geschicklichkeitsspiele mit Preis-Theke in der Neon-Arkade zu ersetzen (kein Glücksspiel für Kinder). Wartet auf Entscheid.
- **Zoo und Aquarium:** eigener Bereich für Risslinge (sie leben dort sicher vor den Kehrmaschinen).
- **Jobs:** neue Jobs auf den neuen Planeten (Pager-Bote, Spielzeug-Fabrik, Kaufhaus-Fundbüro, Magnetbahn-Schaffner:in).
- **Mode:** 1999-Stil: Visiere, Fischerhüte, Plateau-Turnschuhe, Cyber-Brillen, Plüsch-Rucksäcke, durchsichtige Regenjacken. Kindgerecht.
- **Rennen:** Magnetbahn-Rennen und Stationsrennen.

## 8. Ablauf (ersetzt: Möbel-Agent einbinden, testen, veröffentlichen, pushen)

Jede Aufgabe endet mit Kopftest, Wunschliste, Commit, Push, Spiel-Artifact neu veröffentlichen und grünem PR (siehe oben).

## Reihenfolge

1. Klang 2.0 und Geschichte Prolog bis Akt II (aus dem Briefing).
2. Körper 2.0.
3. Planeten: Umbau Urzeit, Metro, Dschungel, dann ihre neuen Planeten.
4. Haus 2.0 und Inhalte verdoppeln, gruppenweise mit den Planeten.
5. Raumfahrt-Umbau, Sprach-/Wetter-Ebene.
6. Restliche Gruppen, Glitch-Kern, Finale.
