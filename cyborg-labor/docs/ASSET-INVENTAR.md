# Asset-Inventar (Fundus)

Generiert von `tools/fundus.py`. Jedes Modell aus jedem Bausatz in `assets/kits` hat eine Entscheidung. Rollen: **Möbel** (kaufbar, Name auf Deutsch und Englisch), **Deko** (auf den genannten Planeten verstreut), **Bau** (Bauteil für Architektur, Innenräume, Gleise; Stufe 2), **weg** (mit Begründung).

| Bausatz | Modelle | Möbel | Deko | Bau | weg |
|---|---|---|---|---|---|
| arcade | 20 | 10 | 0 | 6 | 4 |
| brick | 296 | 6 | 8 | 37 | 259 |
| building | 79 | 0 | 0 | 79 | 0 |
| cars | 50 | 15 | 40 | 0 | 0 |
| castle | 76 | 5 | 21 | 53 | 2 |
| cave | 40 | 0 | 0 | 40 | 0 |
| dino | 6 | 0 | 6 | 0 | 0 |
| dungeon | 203 | 119 | 2 | 82 | 0 |
| factory | 143 | 15 | 34 | 94 | 0 |
| food | 200 | 200 | 0 | 0 | 0 |
| forest | 22 | 3 | 18 | 0 | 1 |
| furn | 140 | 120 | 0 | 20 | 0 |
| graveyard | 91 | 20 | 22 | 35 | 26 |
| halloween | 63 | 15 | 19 | 16 | 21 |
| hexa | 107 | 53 | 96 | 11 | 0 |
| holiday | 99 | 40 | 25 | 34 | 0 |
| industrial | 37 | 0 | 17 | 20 | 0 |
| jungle | 25 | 0 | 25 | 0 | 0 |
| kcity | 41 | 9 | 18 | 8 | 15 |
| kfurn | 53 | 53 | 0 | 0 | 0 |
| market | 20 | 11 | 0 | 8 | 1 |
| metro | 41 | 2 | 16 | 23 | 0 |
| modspace | 40 | 0 | 0 | 40 | 0 |
| modular | 108 | 0 | 0 | 108 | 0 |
| nature | 329 | 33 | 284 | 16 | 29 |
| pirate | 72 | 29 | 28 | 23 | 0 |
| plat | 153 | 48 | 98 | 0 | 32 |
| resto | 144 | 130 | 0 | 14 | 0 |
| retro | 105 | 0 | 10 | 95 | 0 |
| roads | 95 | 7 | 27 | 2 | 66 |
| ruins | 19 | 0 | 0 | 19 | 0 |
| space | 153 | 33 | 42 | 74 | 4 |
| spacebase | 57 | 20 | 43 | 0 | 14 |
| station | 97 | 38 | 0 | 59 | 0 |
| suburban | 40 | 1 | 3 | 30 | 7 |
| survival | 80 | 40 | 20 | 20 | 0 |
| town | 167 | 14 | 39 | 126 | 0 |
| train | 103 | 41 | 60 | 42 | 1 |
| water | 46 | 46 | 46 | 0 | 0 |
| **Summe** | **3660** | **1176** | **1067** | **1234** | **482** |

Im Spiel sichtbar (Möbel oder Deko): **1953** von 3660 Modellen. Bau-Teile: 1234 (davon 373 schon im Spiel). Weggelassen: 482.

## Weggelassen und warum

- **arcade** (2): Glücksspiel – passt nicht zur kindgerechten Regel (kein Glücksspiel). gambling-machine, prize-wheel
- **arcade** (2): fertige Figur; im Spiel baut man Figuren selbst. character-employee, character-gamer
- **brick** (259): gleiche Form in anderer Kanten- oder Detailstufe (von 8 Varianten bleibt eine: round-hq). bevel-hq-brick-1x1, bevel-hq-brick-1x1-round, bevel-hq-brick-1x2, bevel-hq-brick-1x4, bevel-hq-brick-1x6, bevel-hq-brick-1x8, bevel-hq-brick-2x2, bevel-hq-brick-2x4, bevel-hq-brick-2x6, bevel-hq-brick-2x8, bevel-hq-brick-corner, bevel-hq-brick-slope-1x2 …
- **castle** (2): flache Bodenkachel für Raster-Welten; unsere Planeten sind rund. ground, ground-hills
- **forest** (1): fertige Figur; im Spiel baut man Figuren selbst. character-archer
- **graveyard** (25): Grab-, Knochen- oder Untoten-Motiv – zu gruselig für die Altersgruppe. altar-stone, altar-wood, character-skeleton, character-vampire, character-zombie, coffin, coffin-old, cross, cross-column, cross-wood, detail-bowl, detail-chalice …
- **graveyard** (1): fertige Figur; im Spiel baut man Figuren selbst. character-keeper
- **halloween** (21): Grab-, Knochen- oder Untoten-Motiv – zu gruselig für die Altersgruppe. bone_A, bone_B, bone_C, coffin, coffin_decorated, crypt, floor_dirt_grave, grave_A, grave_A_destroyed, grave_B, gravemarker_A, gravemarker_B …
- **kcity** (7): flache Strassenkachel für Raster-Welten; unsere Strassen werden auf der Kugel erzeugt. base, road_corner, road_corner_curved, road_junction, road_straight, road_straight_crossing, road_tsplit
- **kcity** (8): Doppel: dasselbe Haus mit Sockelplatte (die Variante ohne Sockel wird verwendet). building_A, building_B, building_C, building_D, building_E, building_F, building_G, building_H
- **market** (1): fertige Figur; im Spiel baut man Figuren selbst. character-employee
- **nature** (29): flache Boden- und Flusskachel für Raster-Welten; unser Gelände ist eine Kugel. ground_grass, ground_pathBend, ground_pathBendBank, ground_pathCorner, ground_pathCornerSmall, ground_pathCross, ground_pathEnd, ground_pathEndClosed, ground_pathOpen, ground_pathRocks, ground_pathSide, ground_pathSideOpen …
- **plat** (32): Doppel: gleicher Block mit überhängender Grasdecke; für runde Planeten reicht die Grundform. block-grass-overhang-corner, block-grass-overhang-edge, block-grass-overhang-hexagon, block-grass-overhang-large, block-grass-overhang-large-slope, block-grass-overhang-large-slope-narrow, block-grass-overhang-large-slope-steep, block-grass-overhang-large-slope-steep-narrow, block-grass-overhang-large-tall, block-grass-overhang-long, block-grass-overhang-low, block-grass-overhang-low-hexagon …
- **roads** (66): flache Strassenkachel für Raster-Welten; unsere Strassen werden auf der Kugel erzeugt. road-sign-stop, road-sign-street, road-bend, road-bend-barrier, road-bend-sidewalk, road-bend-square, road-bend-square-barrier, road-bridge, road-crossing, road-crossroad, road-crossroad-barrier, road-crossroad-line …
- **space** (4): Waffe – passt nicht in ein gewaltfreies Kinderspiel. turret_double, turret_single, weapon_gun, weapon_rifle
- **spacebase** (14): Gelände- und Tunnelkachel für flache Raster-Welten; unsere Monde sind Kugeln. terrain_low, terrain_low_curved, terrain_mining, terrain_slope, terrain_slope_inner_corner, terrain_slope_outer_corner, terrain_tall, terrain_tall_curved, tunnel_diagonal_long_A, tunnel_diagonal_long_B, tunnel_diagonal_short_A, tunnel_diagonal_short_B …
- **suburban** (7): flache Weg- und Einfahrtkachel; unsere Wege werden auf der Kugel erzeugt. driveway-long, driveway-short, path-long, path-short, path-stones-long, path-stones-messy, path-stones-short
- **train** (1): Kupplungsstück ohne eigenes Aussehen. train-connector

## Bau-Teile (Stufe 2)

- **arcade** (6): Spielhallen-Innenraum
- **brick** (37): Klötzchen-Baukasten auf dem Bauklotz-Planeten
- **building** (79): Betonhäuser für Stadt-Planeten (Architektur-Generator)
- **castle** (53): Burgbaukasten (Türme, Mauern, Tore) für Bauklotz und Drachen-Mond
- **cave** (40): Höhlen-Innenräume (Gänge, Räume, Treppen)
- **dungeon** (82): Burg- und Kellerräume (Wartungstunnel, Glitch-Kern, Höhlen)
- **factory** (94): Fabrikhallen und Fliessband-Strecken (Dino-Fabrik)
- **furn** (20): Zimmer-Bausteine für Hausinnenräume
- **graveyard** (35): Mauern, Zäune und Säulen für Nachtmarkt und Ruinen
- **halloween** (16): Herbst-Zäune, Wege und Torbögen für den Nachtmarkt
- **hexa** (11): Mauern und Zäune für den Drachen-Mond
- **holiday** (34): Blockhütten auf Frost (schon im Spiel)
- **industrial** (20): Fertige Fabrikgebäude für Stadt-Planeten (Häuser-Pool)
- **kcity** (8): Fertige Stadthäuser für Metro und Kaufhaus (Häuser-Pool)
- **market** (8): Laden-Innenraum (schon im Spiel)
- **metro** (19): Stadthäuser auf Metro (schon im Spiel)
- **metro** (4): Markisen und Vordächer für Stadthäuser
- **modspace** (40): Raumstations-Gänge und Räume (Stationen, Glitch-Kern)
- **modular** (108): Stadthaus-Baukasten (schon im Spiel)
- **nature** (16): Brücken über Flüsse
- **pirate** (23): Piratenfestung und Stege auf Korallen
- **resto** (14): Küchen- und Restaurantwände für Bar und Imbiss
- **retro** (95): Fachwerk- und Steinhäuser für Drachen-Mond und Uhrwerk; Kokon-Ruinen
- **roads** (2): Brückenpfeiler für Magnetbahn-Brücken
- **ruins** (19): Dschungel-Tempel (schon im Spiel)
- **space** (74): Raumhafen- und Stationsbauten (Gänge, Plattformen, Rohre)
- **station** (59): Stations-Innenräume (schon im Spiel, Wände)
- **suburban** (21): Fertige Vorstadthäuser für Kompost und Heimatplanet (Häuser-Pool)
- **suburban** (9): Gartenzäune für Vorgärten
- **survival** (20): Hütten und Unterstände (Schrott-Planet, Wartungstunnel)
- **town** (126): Dorfhäuser (schon im Spiel)
- **train** (42): Gleisstrecken auf der Magnetbahn
