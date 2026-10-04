#!/usr/bin/env python3
"""Fundus: decides for EVERY model of every kit in assets/kits what the game does with it.

Roles
  moebel  buyable furniture (shops, catalog, home) – needs German + English name
  deko    outdoor decoration, scattered into the biomes of the listed planets
  bau     building piece for the architecture / interior builders (stage 2)
  weg     dropped, with a written reason (duplicate variant, tile for flat grids, not kids-safe …)

A model may have several roles (a toy train as furniture AND parked trains as decoration).
Rules are (regex, role, options); the first matching rule per role-group wins.
The script fails if any model is left without a decision.

Outputs: js/fundus-data.js, docs/ASSET-INVENTAR.md
usage: python3 tools/fundus.py
"""
import json, glob, os, re, sys, collections, base64

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KITS = os.path.join(ROOT, 'assets', 'kits')

# ---------------------------------------------------------------------------
# Names for furniture: base name (variant suffix stripped) -> (de, en)
# ---------------------------------------------------------------------------
N = {}
def names(pack, table):
    for k, v in table.items(): N[(pack, k)] = v

# Variant suffixes and colour words
COL = {'blue': ('blau', 'blue'), 'red': ('rot', 'red'), 'green': ('grün', 'green'), 'yellow': ('gelb', 'yellow'),
       'white': ('weiss', 'white'), 'brown': ('braun', 'brown'), 'orange': ('orange', 'orange'), 'gold': ('gold', 'gold'),
       'dark': ('dunkel', 'dark'), 'colored': ('bunt', 'colourful')}

def strip_variant(name):
    """'boat-speed-c' -> ('boat-speed', 'C'); 'banner_patternA_blue' -> ('banner_patternA', blue)"""
    m = re.match(r'^(.*?)[-_](blue|red|green|yellow|white|brown|orange|gold|dark|colored)$', name)
    if m: return m.group(1), ('col', m.group(2))
    m = re.match(r'^(.*?)[-_]?([A-Ja-j])$', name)
    if m and len(m.group(1)) > 2 and (name[-2] in '-_'): return m.group(1), ('let', m.group(2).upper())
    m = re.match(r'^(.*?)[-_]?(\d)$', name)
    if m and len(m.group(1)) > 2: return m.group(1), ('let', m.group(2))
    return name, None

SIZE = {'large': ('gross', 'large'), 'medium': ('mittel', 'medium'), 'small': ('klein', 'small')}
def label(pack, name):
    """Strips colour, size and letter suffixes one after another until a base name is known."""
    if (pack, name) in N: return N[(pack, name)]
    cur, de_s, en_s = name, [], []
    for _ in range(3):
        m = re.match(r'^(.*?)[-_](large|medium|small)$', cur)
        if m: cur = m.group(1); de_s.insert(0, SIZE[m.group(2)][0]); en_s.insert(0, SIZE[m.group(2)][1])
        else:
            base, var = strip_variant(cur)
            if not var: break
            cur = base
            if var[0] == 'col': de_s.insert(0, COL[var[1]][0]); en_s.insert(0, COL[var[1]][1])
            else: de_s.insert(0, var[1]); en_s.insert(0, var[1])
        if (pack, cur) in N:
            de, en = N[(pack, cur)]
            return (f"{de} ({', '.join(de_s)})", f"{en} ({', '.join(en_s)})")
    return None

# Möbel, die js/kitfurn.js schon mit Namen registriert (bleiben dort)
LEGACY = set(re.findall(r"\['(\w+)','([\w-]+)','", open(os.path.join(ROOT, 'js', 'kitfurn.js')).read()))

# ---------------------------------------------------------------------------
# Rules per pack: list of (regex, role, opts)
#   moebel opts: cat, price, planet ('alle' or id), sc (scale), wall (1 = hangs on wall), orig (keep source colours)
#   deko   opts: planets [ids], w (weight), h (target height), big (obstacle), shore (only beach biomes)
#   bau    opts: use (what for)
#   weg    opts: why
# ---------------------------------------------------------------------------
R = collections.defaultdict(list)
def rule(pack, rx, role, **o): R[pack].append((re.compile('^(?:' + rx + ')$'), role, o))

URBAN = ['metro', 'kaufhaus', 'funkturm', 'rechenzentrum']
COAST = ['korallen', 'tiefsee', 'wolkenarchipel', 'metro', 'urzeit']
MOONS = ['keim', 'kassette', 'gluehwurm', 'drachen', 'pixelmond']

# ---------- arcade ----------
names('arcade', {'air-hockey': ('Airhockey-Tisch', 'Air hockey table'), 'arcade-machine': ('Spielautomat', 'Arcade cabinet'),
  'basketball-game': ('Korbwurf-Automat', 'Basketball arcade'), 'cash-register': ('Spielhallen-Kasse', 'Arcade till'),
  'claw-machine': ('Greifautomat', 'Claw machine'), 'dance-machine': ('Tanzautomat', 'Dance machine'), 'pinball': ('Flipper', 'Pinball machine'),
  'prizes': ('Preisregal', 'Prize shelf'), 'ticket-machine': ('Ticketautomat', 'Ticket machine'), 'vending-machine': ('Getränkeautomat', 'Vending machine')})
rule('arcade', 'prize-wheel|gambling-machine', 'weg', why='Glücksspiel – passt nicht zur kindgerechten Regel (kein Glücksspiel)')
rule('arcade', 'character-.*', 'weg', why='fertige Figur; im Spiel baut man Figuren selbst')
rule('arcade', 'column|floor|wall.*', 'bau', use='Spielhallen-Innenraum')
rule('arcade', '.*', 'moebel', cat='spiel', price=1600, planet='neonarkade', h=1.7, w=1.4)

# ---------- brick ----------
rule('brick', 'round-hq-.*', 'bau', use='Klötzchen-Baukasten auf dem Bauklotz-Planeten')
rule('brick', 'round-hq-brick-(1x2|2x2|2x4|1x4|2x6|slope-2x2|1x1-round|corner)', 'deko', planets=['bauklotz'], w=.5, h=1.6, big=1, tint=1)
names('brick', {'round-hq-brick-2x4': ('Riesenklotz 2×4', 'Giant brick 2×4'), 'round-hq-brick-2x2': ('Riesenklotz 2×2', 'Giant brick 2×2'),
  'round-hq-brick-1x2': ('Riesenklotz 1×2', 'Giant brick 1×2'), 'round-hq-brick-slope-2x2': ('Dachklotz', 'Slope brick'),
  'round-hq-brick-1x1-round': ('Rundklotz', 'Round brick'), 'round-hq-plate-4x4': ('Bauplatte 4×4', 'Base plate 4×4')})
rule('brick', 'round-hq-(brick-2x4|brick-2x2|brick-1x2|brick-slope-2x2|brick-1x1-round|plate-4x4)', 'moebel', cat='spiel', price=300, planet='bauklotz', sc=1.2)
rule('brick', '.*', 'weg', why='gleiche Form in anderer Kanten- oder Detailstufe (von 8 Varianten bleibt eine: round-hq)')

# ---------- building (concrete house pieces) ----------
rule('building', '.*', 'bau', use='Betonhäuser für Stadt-Planeten (Architektur-Generator)')

# ---------- cars ----------
names('cars', {'ambulance': ('Spielzeug-Krankenwagen', 'Toy ambulance'), 'firetruck': ('Spielzeug-Feuerwehr', 'Toy fire engine'),
  'police': ('Spielzeug-Polizeiauto', 'Toy police car'), 'taxi': ('Spielzeug-Taxi', 'Toy taxi'), 'race': ('Spielzeug-Rennwagen', 'Toy racing car'),
  'race-future': ('Zukunfts-Rennwagen', 'Future racer'), 'garbage-truck': ('Spielzeug-Müllwagen', 'Toy bin lorry'), 'tractor': ('Spielzeug-Traktor', 'Toy tractor'),
  'tractor-shovel': ('Spielzeug-Bagger', 'Toy digger'), 'delivery': ('Spielzeug-Lieferwagen', 'Toy delivery van'),
  'kart-oobi': ('Gokart Oobi', 'Oobi go-kart'), 'kart-oodi': ('Gokart Oodi', 'Oodi go-kart'), 'kart-ooli': ('Gokart Ooli', 'Ooli go-kart'), 'kart-oopi': ('Gokart Oopi', 'Oopi go-kart'), 'kart-oozi': ('Gokart Oozi', 'Oozi go-kart')})
rule('cars', 'ambulance|firetruck|police|taxi|race|race-future|garbage-truck|tractor|tractor-shovel|delivery', 'moebel', cat='spiel', price=450, planet='alle', sc=.35)
rule('cars', 'kart-.*', 'moebel', cat='spiel', price=900, planet='neonarkade', h=.7, w=1.4)
rule('cars', 'debris-.*|wheel-.*', 'deko', planets=['schrott'], w=.6, h=.5)
rule('cars', 'cone|cone-flat|box', 'deko', planets=URBAN + ['magnetbahn'], w=.3, h=.6)
rule('cars', 'kart-.*', 'deko', planets=['neonarkade'], w=.25, h=1, big=1)
rule('cars', '.*', 'deko', planets=URBAN + ['magnetbahn', 'kompost'], w=.15, h=1.6, big=1)

# ---------- castle ----------
rule('castle', 'ground.*', 'weg', why='flache Bodenkachel für Raster-Welten; unsere Planeten sind rund')
rule('castle', 'siege-.*', 'deko', planets=['bauklotz', 'drachen'], w=.2, h=2.4, big=1)
rule('castle', 'flag.*', 'deko', planets=['bauklotz', 'drachen'], w=.4, h=2.2)
rule('castle', 'rocks-.*|tree-.*', 'deko', planets=['bauklotz', 'drachen'], w=.5, h=2.2, big=1)
names('castle', {'flag': ('Burgfahne', 'Castle flag'), 'flag-banner-long': ('Langes Burgbanner', 'Long castle banner'), 'flag-pennant': ('Wimpelstange', 'Pennant pole'),
  'siege-catapult': ('Spielzeug-Katapult', 'Toy catapult'), 'siege-trebuchet': ('Spielzeug-Tribok', 'Toy trebuchet')})
rule('castle', 'flag|flag-banner-long|flag-pennant|siege-catapult|siege-trebuchet', 'moebel', cat='deko', price=700, planet='bauklotz', h=1.6, w=1.4)
rule('castle', '.*', 'bau', use='Burgbaukasten (Türme, Mauern, Tore) für Bauklotz und Drachen-Mond')

# ---------- cave ----------
rule('cave', '.*', 'bau', use='Höhlen-Innenräume (Gänge, Räume, Treppen)')

# ---------- dino / jungle / ruins (Quaternius, schon im Spiel) ----------
rule('dino', '.*', 'deko', planets=['urzeit'], w=.1, h=3, big=1, used=1)
rule('jungle', '.*', 'deko', planets=['dschungel'], w=1, h=2, used=1)
rule('ruins', '.*', 'bau', use='Dschungel-Tempel (schon im Spiel)', used=1)

# ---------- dungeon (KayKit) ----------
names('dungeon', {'banner': ('Wandbanner', 'Wall banner'), 'banner_patternA': ('Banner mit Streifen', 'Striped banner'), 'banner_patternB': ('Banner mit Zacken', 'Zigzag banner'),
  'banner_patternC': ('Banner mit Kreis', 'Circle banner'), 'banner_shield': ('Wappenbanner', 'Crest banner'), 'banner_thin': ('Schmales Banner', 'Thin banner'),
  'banner_triple': ('Dreifachbanner', 'Triple banner'), 'barrel_large': ('Grosses Fass', 'Large barrel'), 'barrel_large_decorated': ('Verziertes Fass', 'Decorated barrel'),
  'barrel_small': ('Kleines Fass', 'Small barrel'), 'barrel_small_stack': ('Fässerstapel', 'Barrel stack'), 'bed_decorated': ('Himmelbett', 'Canopy bed'),
  'bed_floor': ('Bodenlager', 'Floor bed'), 'bed_frame': ('Holzbett', 'Wooden bed'), 'bottle_A': ('Flasche', 'Bottle'), 'bottle_A_labeled': ('Etikettflasche', 'Labelled bottle'),
  'bottle_B': ('Bauchflasche', 'Round bottle'), 'bottle_C': ('Hohe Flasche', 'Tall bottle'), 'box_large': ('Holzkiste', 'Wooden crate'), 'box_small': ('Kistchen', 'Small box'),
  'box_small_decorated': ('Verzierte Kiste', 'Decorated box'), 'box_stacked': ('Kistenstapel', 'Box stack'), 'candle': ('Kerze', 'Candle'), 'candle_lit': ('Brennende Kerze', 'Lit candle'),
  'candle_melted': ('Geschmolzene Kerze', 'Melted candle'), 'candle_thin': ('Dünne Kerze', 'Thin candle'), 'candle_thin_lit': ('Dünne Kerze, brennend', 'Thin lit candle'),
  'candle_triple': ('Kerzentrio', 'Candle trio'), 'chair': ('Holzstuhl', 'Wooden chair'), 'chest': ('Truhe', 'Chest'), 'chest_gold': ('Goldtruhe', 'Golden chest'),
  'coin': ('Goldmünze', 'Gold coin'), 'coin_stack_large': ('Grosser Münzstapel', 'Large coin stack'), 'coin_stack_medium': ('Münzstapel', 'Coin stack'),
  'coin_stack_small': ('Kleiner Münzstapel', 'Small coin stack'), 'crates_stacked': ('Kistenturm', 'Crate tower'), 'keg': ('Fässchen', 'Keg'), 'keg_decorated': ('Verziertes Fässchen', 'Decorated keg'),
  'key': ('Alter Schlüssel', 'Old key'), 'keyring': ('Schlüsselbund', 'Key ring'), 'keyring_hanging': ('Schlüsselbrett', 'Key rack'), 'plate': ('Holzteller', 'Wooden plate'),
  'plate_food_A': ('Teller mit Essen', 'Plate of food'), 'plate_food_B': ('Festschmaus', 'Feast plate'), 'plate_small': ('Kleiner Teller', 'Small plate'), 'plate_stack': ('Tellerstapel', 'Plate stack'),
  'shelf_large': ('Grosses Holzregal', 'Large wooden shelf'), 'shelf_small': ('Holzregal', 'Wooden shelf'), 'shelf_small_candles': ('Kerzenregal', 'Candle shelf'), 'shelves': ('Wandregale', 'Wall shelves'),
  'stool': ('Schemel', 'Stool'), 'sword_shield': ('Ritterschild', 'Knight shield'), 'sword_shield_broken': ('Alter Ritterschild', 'Old knight shield'), 'sword_shield_gold': ('Goldener Schild', 'Golden shield'),
  'table_long': ('Lange Tafel', 'Long table'), 'table_long_broken': ('Wackelige Tafel', 'Wobbly table'), 'table_long_decorated_A': ('Gedeckte Tafel', 'Laid table'),
  'table_long_decorated_C': ('Festtafel', 'Banquet table'), 'table_long_tablecloth': ('Tafel mit Decke', 'Table with cloth'), 'table_long_tablecloth_decorated_A': ('Festliche Tafel', 'Festive table'),
  'table_medium': ('Holztisch', 'Wooden table'), 'table_medium_broken': ('Wackeltisch', 'Wobbly table'), 'table_medium_decorated_A': ('Gedeckter Tisch', 'Laid table'),
  'table_medium_tablecloth': ('Tisch mit Decke', 'Table with cloth'), 'table_medium_tablecloth_decorated_B': ('Teetisch', 'Tea table'), 'table_small': ('Tischchen', 'Small table'),
  'table_small_decorated_A': ('Gedecktes Tischchen', 'Laid small table'), 'table_small_decorated_B': ('Leseecke-Tisch', 'Reading table'), 'torch': ('Fackel', 'Torch'),
  'torch_lit': ('Brennende Fackel', 'Lit torch'), 'torch_mounted': ('Wandfackel', 'Wall torch'), 'trunk_large': ('Grosse Reisetruhe', 'Large trunk'), 'trunk_medium': ('Reisetruhe', 'Trunk'),
  'trunk_small': ('Kleine Truhe', 'Small trunk'), 'rubble_half': ('Steinhaufen', 'Rubble pile'), 'rubble_large': ('Grosser Steinhaufen', 'Large rubble pile')})
def dcat(n):
    if n.startswith('banner') or n in ('keyring_hanging', 'shelves', 'torch_mounted') or n.startswith('sword'): return 'wand'
    if n.startswith(('candle', 'torch')): return 'licht'
    if n.startswith('bed'): return 'bett'
    if n.startswith(('chair', 'stool')): return 'sitz'
    if n.startswith('table'): return 'tisch'
    if n.startswith(('barrel', 'box', 'crates', 'chest', 'trunk', 'shelf', 'keg')): return 'lager'
    return 'deko'
rule('dungeon', '(floor|wall|stairs|pillar|column|barrier).*', 'bau', use='Burg- und Kellerräume (Wartungstunnel, Glitch-Kern, Höhlen)')
rule('dungeon', 'floor_tile_big_spikes', 'weg', why='Falle mit Stacheln – passt nicht in ein gemütliches Spiel')
rule('dungeon', 'rubble_.*', 'deko', planets=['bernstein', 'drachen'], w=.4, h=1)
rule('dungeon', '.*', 'moebel', cat=dcat, price=400, planet=lambda n: 'bibliothek' if n.startswith(('banner', 'candle', 'shelf', 'table', 'chair', 'stool', 'bed')) else 'bauklotz', sc=1.6)

# ---------- factory ----------
names('factory', {'box': ('Fabrikkiste', 'Factory box'), 'box-large': ('Grosse Fabrikkiste', 'Large factory box'), 'box-long': ('Lange Fabrikkiste', 'Long factory box'),
  'box-small': ('Kleine Fabrikkiste', 'Small factory box'), 'box-wide': ('Breite Fabrikkiste', 'Wide factory box'), 'button-floor-round': ('Bodenknopf rund', 'Round floor button'),
  'button-floor-round-small': ('Kleiner Bodenknopf', 'Small floor button'), 'button-floor-square': ('Bodenknopf eckig', 'Square floor button'), 'button-floor-square-small': ('Kleiner Eckknopf', 'Small square button'),
  'cog': ('Riesen-Zahnrad', 'Giant cog'), 'cone': ('Warnkegel', 'Traffic cone'), 'crane': ('Werkskran', 'Factory crane'), 'crane-lift': ('Hebekran', 'Lifting crane'), 'crane-magnet': ('Magnetkran', 'Magnet crane'),
  'hopper-high-round': ('Hoher Trichter', 'Tall hopper'), 'hopper-high-square': ('Hoher Kastentrichter', 'Tall square hopper'), 'hopper-round': ('Trichter', 'Hopper'), 'hopper-square': ('Kastentrichter', 'Square hopper'),
  'lever-double': ('Doppelhebel', 'Double lever'), 'lever-single': ('Hebel', 'Lever'), 'machine': ('Fabrikmaschine', 'Factory machine'), 'machine-bed': ('Maschinenbett', 'Machine bed'),
  'machine-connection-hole': ('Maschine mit Luke', 'Machine with hatch'), 'machine-connection-pipe': ('Rohrmaschine', 'Pipe machine'), 'machine-fortified': ('Panzermaschine', 'Armoured machine'),
  'machine-window': ('Fenstermaschine', 'Window machine'), 'machine-window-bar': ('Gittermaschine', 'Barred machine'), 'oopi': ('Oopi-Roboter', 'Oopi robot'),
  'piston-round': ('Kolben rund', 'Round piston'), 'piston-square': ('Kolben eckig', 'Square piston'), 'piston-thin-round': ('Dünner Kolben', 'Thin piston'), 'piston-thin-square': ('Dünner Eckkolben', 'Thin square piston'),
  'robot-arm': ('Roboterarm', 'Robot arm'), 'scanner-high': ('Hoher Scanner', 'Tall scanner'), 'scanner-low': ('Scannerbogen', 'Scanner arch'), 'screen-flat': ('Flachbildschirm', 'Flat screen'),
  'screen-hanging-small': ('Hängebildschirm', 'Hanging screen'), 'screen-hanging-wide': ('Breiter Hängebildschirm', 'Wide hanging screen'), 'screen-panel-flat': ('Schaltpult', 'Control panel'),
  'screen-panel-small': ('Kleines Schaltpult', 'Small control panel'), 'screen-panel-wide': ('Breites Schaltpult', 'Wide control panel'), 'screen-small': ('Kleiner Monitor', 'Small monitor'), 'screen-wide': ('Breitbildmonitor', 'Widescreen monitor'),
  'warning-orange': ('Warnleuchte', 'Warning light'), 'warning-traffic': ('Ampelleuchte', 'Signal light')})
def fcat(n):
    if n.startswith('screen') or n.startswith(('machine', 'scanner', 'lever', 'button')): return 'technik'
    if n.startswith('warning'): return 'licht'
    if n.startswith(('box', 'hopper')): return 'lager'
    if n == 'oopi' or n.startswith('robot'): return 'spiel'
    return 'deko'
rule('factory', '(conveyor|catwalk|structure|floor|top|indicator|arrow|door|pipe).*', 'bau', use='Fabrikhallen und Fliessband-Strecken (Dino-Fabrik)')
rule('factory', '(machine|robot-arm|hopper|piston|crane|scanner|cog|warning|cone|box).*', 'deko', planets=['dinofabrik', 'rechenzentrum'], w=.35, h=1.8, big=1)
rule('factory', '.*', 'moebel', cat=fcat, price=700, planet=lambda n: 'rechenzentrum' if n.startswith('screen') else 'dinofabrik', sc=1.4)

# ---------- food ----------
names('food', {
 'advocado-half': ('Avocadohälfte', 'Half avocado'), 'apple': ('Apfel', 'Apple'), 'apple-half': ('Apfelhälfte', 'Half apple'), 'avocado': ('Avocado', 'Avocado'), 'bacon': ('Speck', 'Bacon'), 'bacon-raw': ('Roher Speck', 'Raw bacon'),
 'bag': ('Einkaufstüte', 'Shopping bag'), 'bag-flat': ('Papiertüte', 'Paper bag'), 'banana': ('Banane', 'Banana'), 'barrel': ('Vorratsfass', 'Storage barrel'), 'beet': ('Rote Bete', 'Beetroot'),
 'bottle-ketchup': ('Ketchupflasche', 'Ketchup bottle'), 'bottle-musterd': ('Senfflasche', 'Mustard bottle'), 'bottle-oil': ('Ölflasche', 'Oil bottle'), 'bowl': ('Schüssel', 'Bowl'), 'bowl-broth': ('Suppenschüssel', 'Broth bowl'),
 'bowl-cereal': ('Müslischale', 'Cereal bowl'), 'bowl-soup': ('Suppe', 'Soup'), 'bread': ('Brot', 'Bread'), 'broccoli': ('Brokkoli', 'Broccoli'), 'burger': ('Burger', 'Burger'), 'burger-cheese': ('Käseburger', 'Cheeseburger'),
 'burger-cheese-double': ('Doppel-Käseburger', 'Double cheeseburger'), 'burger-double': ('Doppelburger', 'Double burger'), 'cabbage': ('Kohlkopf', 'Cabbage'), 'cake': ('Kuchen', 'Cake'), 'cake-birthday': ('Geburtstagstorte', 'Birthday cake'),
 'cake-slicer': ('Tortenheber', 'Cake server'), 'can': ('Dose', 'Tin'), 'can-open': ('Offene Dose', 'Open tin'), 'can-small': ('Kleine Dose', 'Small tin'), 'candy-bar': ('Schokoriegel', 'Chocolate bar'),
 'candy-bar-wrapper': ('Riegel in Papier', 'Wrapped bar'), 'carrot': ('Karotte', 'Carrot'), 'carton': ('Milchtüte', 'Milk carton'), 'carton-small': ('Kleine Milchtüte', 'Small carton'), 'cauliflower': ('Blumenkohl', 'Cauliflower'),
 'celery-stick': ('Selleriestange', 'Celery stick'), 'cheese': ('Käselaib', 'Cheese wheel'), 'cheese-cut': ('Käsestück', 'Cheese wedge'), 'cheese-slicer': ('Käsehobel', 'Cheese slicer'), 'cherries': ('Kirschen', 'Cherries'),
 'chinese': ('Nudelbox', 'Noodle box'), 'chocolate': ('Schokolade', 'Chocolate'), 'chocolate-wrapper': ('Schokolade in Papier', 'Wrapped chocolate'), 'chopstic-decorative': ('Verzierte Stäbchen', 'Decorated chopsticks'),
 'chopstick': ('Essstäbchen', 'Chopsticks'), 'cocktail': ('Saft-Cocktail', 'Juice cocktail'), 'coconut': ('Kokosnuss', 'Coconut'), 'coconut-half': ('Kokoshälfte', 'Half coconut'), 'cookie': ('Keks', 'Cookie'),
 'cookie-chocolate': ('Schokokeks', 'Chocolate cookie'), 'cooking-fork': ('Kochgabel', 'Cooking fork'), 'cooking-knife': ('Küchenmesser', 'Kitchen knife'), 'cooking-knife-chopping': ('Hackmesser', 'Cleaver'),
 'cooking-spatula': ('Pfannenwender', 'Spatula'), 'cooking-spoon': ('Kochlöffel', 'Cooking spoon'), 'corn': ('Maiskolben', 'Corn cob'), 'corn-dog': ('Maisstange', 'Corn dog'), 'croissant': ('Gipfeli', 'Croissant'),
 'cup': ('Becher', 'Cup'), 'cup-coffee': ('Kaffeetasse', 'Coffee cup'), 'cup-saucer': ('Tasse mit Unterteller', 'Cup and saucer'), 'cup-tea': ('Teetasse', 'Teacup'), 'cupcake': ('Cupcake', 'Cupcake'),
 'cutting-board': ('Schneidebrett', 'Cutting board'), 'cutting-board-japanese': ('Japanisches Schneidebrett', 'Japanese cutting board'), 'cutting-board-round': ('Rundes Brett', 'Round board'), 'dim-sum': ('Dampfkörbchen', 'Dim sum basket'),
 'donut': ('Donut', 'Doughnut'), 'donut-chocolate': ('Schoko-Donut', 'Chocolate doughnut'), 'donut-sprinkles': ('Streusel-Donut', 'Sprinkle doughnut'), 'egg': ('Ei', 'Egg'), 'egg-cooked': ('Spiegelei', 'Fried egg'),
 'egg-cup': ('Eierbecher', 'Egg cup'), 'egg-half': ('Halbes Ei', 'Half egg'), 'eggplant': ('Aubergine', 'Aubergine'), 'fish': ('Fischplatte', 'Fish platter'), 'fish-bones': ('Fischgräte', 'Fish bones'), 'frappe': ('Eiskaffee', 'Iced coffee'),
 'fries': ('Pommes', 'Chips'), 'fries-empty': ('Leere Pommestüte', 'Empty chip bag'), 'frikandel-speciaal': ('Frikandel', 'Frikandel'), 'frying-pan': ('Bratpfanne', 'Frying pan'), 'frying-pan-lid': ('Pfannendeckel', 'Pan lid'),
 'ginger-bread': ('Lebkuchen', 'Gingerbread'), 'ginger-bread-cutter': ('Ausstechform', 'Cookie cutter'), 'glass': ('Glas', 'Glass'), 'glass-wine': ('Stielglas', 'Stemmed glass'), 'grapes': ('Trauben', 'Grapes'), 'honey': ('Honigtopf', 'Honey pot'),
 'hot-dog': ('Hotdog', 'Hot dog'), 'hot-dog-raw': ('Würstchen im Brot', 'Sausage in a bun'), 'ice-cream': ('Eiswaffel', 'Ice-cream cone'), 'ice-cream-cne': ('Softeis', 'Soft serve'), 'ice-cream-cup': ('Eisbecher', 'Ice-cream cup'),
 'ice-cream-scoop-chocolate': ('Schokokugel', 'Chocolate scoop'), 'ice-cream-scoop-mint': ('Minzkugel', 'Mint scoop'), 'knife-block': ('Messerblock', 'Knife block'), 'leek': ('Lauch', 'Leek'), 'lemon': ('Zitrone', 'Lemon'),
 'lemon-half': ('Zitronenhälfte', 'Half lemon'), 'loaf': ('Brotlaib', 'Loaf'), 'loaf-baguette': ('Baguette', 'Baguette'), 'loaf-round': ('Rundes Brot', 'Round loaf'), 'lollypop': ('Lolli', 'Lollipop'),
 'maki-roe': ('Maki mit Rogen', 'Roe maki'), 'maki-salmon': ('Lachs-Maki', 'Salmon maki'), 'maki-vegetable': ('Gemüse-Maki', 'Veggie maki'), 'meat-cooked': ('Braten', 'Roast'), 'meat-patty': ('Burger-Patty', 'Burger patty'),
 'meat-raw': ('Rohes Fleisch', 'Raw meat'), 'meat-ribs': ('Rippchen', 'Ribs'), 'meat-sausage': ('Wurst', 'Sausage'), 'meat-tenderizer': ('Fleischklopfer', 'Meat mallet'), 'mincemeat-pie': ('Pastete', 'Mince pie'),
 'mortar': ('Mörser', 'Mortar'), 'mortar-pestle': ('Mörser mit Stössel', 'Mortar and pestle'), 'muffin': ('Muffin', 'Muffin'), 'mug': ('Tasse', 'Mug'), 'mushroom': ('Champignon', 'Mushroom'), 'mushroom-half': ('Pilzhälfte', 'Half mushroom'),
 'mussel': ('Muschel', 'Mussel'), 'mussel-open': ('Offene Muschel', 'Open mussel'), 'onion': ('Zwiebel', 'Onion'), 'onion-half': ('Zwiebelhälfte', 'Half onion'), 'orange': ('Orange', 'Orange'), 'pan': ('Pfanne', 'Pan'),
 'pan-stew': ('Pfanne mit Eintopf', 'Pan of stew'), 'pancakes': ('Pfannkuchen', 'Pancakes'), 'paprika': ('Paprika', 'Pepper'), 'paprika-slice': ('Paprikaring', 'Pepper ring'), 'peanut-butter': ('Erdnussbutter', 'Peanut butter'),
 'pear': ('Birne', 'Pear'), 'pear-half': ('Birnenhälfte', 'Half pear'), 'pepper': ('Peperoni', 'Chilli'), 'pepper-mill': ('Pfeffermühle', 'Pepper mill'), 'pie': ('Wähe', 'Pie'), 'pineapple': ('Ananas', 'Pineapple'),
 'pizza': ('Pizza', 'Pizza'), 'pizza-box': ('Pizzaschachtel', 'Pizza box'), 'pizza-cutter': ('Pizzaschneider', 'Pizza cutter'), 'plate': ('Teller', 'Plate'), 'plate-broken': ('Zerbrochener Teller', 'Broken plate'),
 'plate-deep': ('Suppenteller', 'Soup plate'), 'plate-dinner': ('Abendessen', 'Dinner plate'), 'plate-rectangle': ('Servierplatte', 'Serving plate'), 'plate-sauerkraut': ('Sauerkraut-Teller', 'Sauerkraut plate'),
 'popsicle': ('Glace am Stiel', 'Ice lolly'), 'popsicle-chocolate': ('Schoko-Glace', 'Chocolate ice lolly'), 'popsicle-stick': ('Glacestiel', 'Lolly stick'), 'pot': ('Kochtopf', 'Pot'), 'pot-lid': ('Topf mit Deckel', 'Lidded pot'),
 'pot-stew': ('Eintopf', 'Stew pot'), 'pot-stew-lid': ('Eintopf mit Deckel', 'Lidded stew pot'), 'pudding': ('Pudding', 'Pudding'), 'pumpkin': ('Kürbis', 'Pumpkin'), 'pumpkin-basic': ('Kleiner Kürbis', 'Small pumpkin'),
 'radish': ('Radieschen', 'Radish'), 'rice-ball': ('Reisbällchen', 'Rice ball'), 'rollingPin': ('Wallholz', 'Rolling pin'), 'salad': ('Salat', 'Salad'), 'sandwich': ('Sandwich', 'Sandwich'), 'sausage': ('Bratwurst', 'Bratwurst'),
 'sausage-half': ('Wursthälfte', 'Half sausage'), 'shaker-pepper': ('Pfefferstreuer', 'Pepper shaker'), 'shaker-salt': ('Salzstreuer', 'Salt shaker'), 'skewer': ('Spiess', 'Skewer'), 'skewer-vegetables': ('Gemüsespiess', 'Veggie skewer'),
 'soda': ('Limo', 'Soda'), 'soda-bottle': ('Limoflasche', 'Soda bottle'), 'soda-can': ('Limodose', 'Soda can'), 'soda-can-crushed': ('Zerdrückte Dose', 'Crushed can'), 'soda-glass': ('Limoglas', 'Soda glass'), 'soy': ('Sojasauce', 'Soy sauce'),
 'steamer': ('Dampfkorb', 'Steamer'), 'strawberry': ('Erdbeere', 'Strawberry'), 'styrofoam': ('Imbissbox', 'Takeaway box'), 'styrofoam-dinner': ('Imbiss-Menü', 'Takeaway meal'), 'sub': ('Langes Sandwich', 'Sub sandwich'),
 'sundae': ('Coupe', 'Sundae'), 'sushi-egg': ('Ei-Sushi', 'Egg sushi'), 'sushi-salmon': ('Lachs-Sushi', 'Salmon sushi'), 'taco': ('Taco', 'Taco'), 'tajine': ('Tajine', 'Tagine'), 'tajine-lid': ('Tajine mit Deckel', 'Lidded tagine'),
 'tomato': ('Tomate', 'Tomato'), 'tomato-slice': ('Tomatenscheibe', 'Tomato slice'), 'turkey': ('Truthahnbraten', 'Roast turkey'), 'utensil-fork': ('Gabel', 'Fork'), 'utensil-knife': ('Messer', 'Knife'), 'utensil-spoon': ('Löffel', 'Spoon'),
 'waffle': ('Waffel', 'Waffle'), 'watermelon': ('Wassermelone', 'Watermelon'), 'whipped-cream': ('Schlagrahm', 'Whipped cream'), 'whisk': ('Schneebesen', 'Whisk'), 'whole-ham': ('Schinken', 'Ham'), 'wholer-ham': ('Grosser Schinken', 'Large ham'),
 'wine-red': ('Traubensaft rot', 'Red grape juice'), 'wine-white': ('Traubensaft hell', 'White grape juice')})
def foodplanet(n):
    if n.startswith(('sushi', 'maki', 'fish', 'mussel', 'rice', 'dim', 'chop', 'soy', 'steamer')): return 'korallen'
    if n.startswith(('honey',)): return 'honigwabe'
    if n.startswith(('cake', 'cupcake', 'donut', 'cookie', 'lolly', 'candy', 'chocolate', 'ice', 'popsicle', 'sundae', 'waffle', 'pancake', 'pudding', 'whipped', 'ginger')): return 'nachtmarkt'
    if n.startswith(('burger', 'fries', 'hot-dog', 'corn-dog', 'styrofoam', 'sub', 'soda', 'pizza', 'frikandel', 'taco', 'sandwich')): return 'kaufhaus'
    return 'alle'
rule('food', '.*', 'moebel', cat=lambda n: 'kueche' if n.startswith(('cooking', 'cutting', 'frying', 'knife', 'pot', 'pan', 'whisk', 'mortar', 'rolling', 'pepper-mill', 'shaker', 'tajine', 'steamer', 'cheese-slicer', 'cake-slicer', 'pizza-cutter', 'meat-tender', 'ginger-bread-cutter', 'utensil')) else 'deko',
     price=90, planet=foodplanet, h=.3, w=.45, orig=1)

# ---------- forest (mini forest) ----------
rule('forest', 'character-archer', 'weg', why='fertige Figur; im Spiel baut man Figuren selbst')
names('forest', {'tent': ('Waldzelt', 'Forest tent'), 'target': ('Zielscheibe', 'Target board'), 'flag': ('Waldfahne', 'Forest flag')})
rule('forest', 'tent|target|flag', 'moebel', cat='deko', price=500, planet='dschungel', sc=.8)
rule('forest', '.*', 'deko', planets=['dschungel', 'riesengarten'], w=.3, h=2.2, big=1)

# ---------- furn (Kenney furniture) ----------
rule('furn', '(floor|wall|doorway|paneling|stairs).*', 'bau', use='Zimmer-Bausteine für Hausinnenräume')
names('furn', {'bathroomCabinet': ('Badschrank', 'Bathroom cabinet'), 'bathroomCabinetDrawer': ('Badkommode', 'Bathroom drawers'), 'bathroomSinkSquare': ('Eckiges Waschbecken', 'Square basin'),
  'bench': ('Holzbank', 'Wooden bench'), 'benchCushionLow': ('Niedrige Polsterbank', 'Low cushioned bench'), 'bookcaseClosed': ('Geschlossener Schrank', 'Closed cupboard'), 'bookcaseOpenLow': ('Niedriges Regal', 'Low shelf'),
  'cabinetBed': ('Bettkasten', 'Bed cabinet'), 'cabinetBedDrawer': ('Bettkommode', 'Bedside drawers'), 'cabinetBedDrawerTable': ('Bettkommode mit Ablage', 'Bedside table'), 'cabinetTelevisionDoors': ('TV-Schrank mit Türen', 'TV cabinet with doors'),
  'cardboardBoxClosed': ('Karton', 'Cardboard box'), 'ceilingFan': ('Deckenventilator', 'Ceiling fan'), 'chair': ('Stuhl', 'Chair'), 'chairModernFrameCushion': ('Rahmenstuhl', 'Frame chair'), 'coatRack': ('Wandgarderobe', 'Coat hooks'),
  'computerKeyboard': ('Tastatur', 'Keyboard'), 'computerMouse': ('Computermaus', 'Computer mouse'), 'dryer': ('Wäschetrockner', 'Tumble dryer'), 'hoodLarge': ('Dunstabzug', 'Cooker hood'), 'hoodModern': ('Moderne Haube', 'Modern hood'),
  'kitchenBar': ('Küchentheke', 'Kitchen bar'), 'kitchenBarEnd': ('Thekenende', 'Bar end'), 'kitchenCabinetCornerInner': ('Küchen-Eckschrank', 'Corner cabinet'), 'kitchenCabinetCornerRound': ('Runder Eckschrank', 'Round corner cabinet'),
  'kitchenCabinetDrawer': ('Küchenschublade', 'Kitchen drawers'), 'kitchenCabinetUpper': ('Hängeschrank', 'Wall cabinet'), 'kitchenCabinetUpperCorner': ('Eck-Hängeschrank', 'Corner wall cabinet'),
  'kitchenCabinetUpperDouble': ('Doppel-Hängeschrank', 'Double wall cabinet'), 'kitchenCabinetUpperLow': ('Flacher Hängeschrank', 'Low wall cabinet'), 'kitchenFridgeBuiltIn': ('Einbaukühlschrank', 'Built-in fridge'),
  'kitchenFridgeLarge': ('Grosser Kühlschrank', 'Large fridge'), 'kitchenFridgeSmall': ('Minikühlschrank', 'Mini fridge'), 'kitchenStoveElectric': ('Glaskeramik-Herd', 'Electric hob'), 'lampSquareCeiling': ('Deckenlampe', 'Ceiling lamp'),
  'loungeDesignSofa': ('Designsofa', 'Design sofa'), 'loungeDesignSofaCorner': ('Design-Ecksofa', 'Design corner sofa'), 'loungeSofaOttoman': ('Fusshocker', 'Ottoman'), 'pillow': ('Kopfkissen', 'Pillow'), 'pillowBlueLong': ('Langes blaues Kissen', 'Long blue pillow'),
  'pillowLong': ('Langes Kissen', 'Long pillow'), 'rugSquare': ('Quadratischer Teppich', 'Square rug'), 'showerRound': ('Runde Dusche', 'Round shower'), 'sideTable': ('Beistelltisch', 'Side table'), 'speakerSmall': ('Kleiner Lautsprecher', 'Small speaker'),
  'stoolBarSquare': ('Eckiger Barhocker', 'Square bar stool'), 'tableCoffeeGlassSquare': ('Eckiger Glastisch', 'Square glass table'), 'tableCoffeeSquare': ('Eckiger Couchtisch', 'Square coffee table'), 'tableCross': ('Kreuztisch', 'Cross-leg table'),
  'tableCrossCloth': ('Kreuztisch mit Decke', 'Cross-leg table with cloth'), 'tableGlass': ('Glasesstisch', 'Glass dining table'), 'televisionAntenna': ('Fernseher mit Antenne', 'TV with aerial'), 'toiletSquare': ('Eckige Toilette', 'Square toilet'),
  'washerDryerStacked': ('Waschturm', 'Washer-dryer stack')})
def furncat(n):
    for pre, c in (('bathroom', 'bad'), ('shower', 'bad'), ('toilet', 'bad'), ('washer', 'bad'), ('dryer', 'bad'), ('kitchen', 'kueche'), ('hood', 'kueche'), ('lamp', 'licht'), ('ceilingFan', 'licht'),
                   ('rug', 'teppich'), ('pillow', 'deko'), ('chair', 'sitz'), ('stool', 'sitz'), ('lounge', 'sitz'), ('bench', 'sitz'), ('table', 'tisch'), ('side', 'tisch'), ('computer', 'technik'), ('television', 'technik'),
                   ('speaker', 'musik'), ('cabinet', 'lager'), ('bookcase', 'lager'), ('cardboard', 'lager'), ('coatRack', 'wand')):
        if n.startswith(pre): return c
    return 'deko'
rule('furn', '.*', 'moebel', cat=furncat, price=600, planet='alle', sc=1.8, orig=1)

# ---------- graveyard + halloween ----------
SPOOK = 'Grab-, Knochen- oder Untoten-Motiv – zu gruselig für die Altersgruppe'
rule('graveyard', 'character-(zombie|skeleton|vampire)|coffin.*|grave.*|gravestone.*|cross.*|shovel-dirt|detail-(bowl|chalice|plate)|altar-.*', 'weg', why=SPOOK)
rule('graveyard', 'character-keeper', 'weg', why='fertige Figur; im Spiel baut man Figuren selbst')
names('graveyard', {'character-ghost': ('Gespensterchen', 'Little ghost'), 'candle': ('Kerze', 'Candle'), 'candle-multiple': ('Kerzengruppe', 'Candle group'), 'fire-basket': ('Feuerkorb', 'Fire basket'),
  'lantern-candle': ('Kerzenlaterne', 'Candle lantern'), 'lantern-glass': ('Glaslaterne', 'Glass lantern'), 'pumpkin': ('Kürbis', 'Pumpkin'), 'pumpkin-carved': ('Kürbislaterne', 'Jack-o’-lantern'),
  'pumpkin-tall': ('Hoher Kürbis', 'Tall pumpkin'), 'pumpkin-tall-carved': ('Hohe Kürbislaterne', 'Tall jack-o’-lantern'), 'urn-round': ('Runde Vase', 'Round vase'), 'urn-square': ('Eckige Vase', 'Square vase'),
  'hay-bale': ('Strohballen', 'Hay bale'), 'hay-bale-bundled': ('Strohbündel', 'Hay bundle'), 'bench': ('Parkbank', 'Park bench'), 'bench-damaged': ('Alte Parkbank', 'Old park bench'), 'shovel': ('Spaten', 'Spade'),
  'lightpost-single': ('Laternenpfahl', 'Lamppost'), 'lightpost-double': ('Doppellaterne', 'Double lamppost'), 'lightpost-all': ('Vierfachlaterne', 'Four-way lamppost')})
rule('graveyard', 'character-ghost|candle.*|fire-basket|lantern-.*|pumpkin.*|urn-.*|hay-bale.*|bench.*|shovel|lightpost-.*', 'moebel',
     cat=lambda n: 'licht' if n.startswith(('candle', 'lantern', 'fire', 'light')) else 'sitz' if n.startswith('bench') else 'deko', price=350, planet='nachtmarkt', sc=1.2)
rule('graveyard', '(pine|trunk|rocks|pumpkin|hay-bale|debris|lightpost|lantern|fire-basket).*', 'deko', planets=['nachtmarkt', 'gluehwurm'], w=.35, h=2.4, big=1)
rule('graveyard', '.*', 'bau', use='Mauern, Zäune und Säulen für Nachtmarkt und Ruinen')
rule('halloween', 'bone.*|ribcage|skull.*|coffin.*|grave.*|gravestone|gravemarker.*|post_skull|floor_dirt_grave|crypt|shrine.*|plaque.*', 'weg', why=SPOOK)
names('halloween', {'bench': ('Herbstbank', 'Autumn bench'), 'bench_decorated': ('Geschmückte Bank', 'Decorated bench'), 'candle': ('Kerze', 'Candle'), 'candle_melted': ('Tropfkerze', 'Drip candle'),
  'candle_thin': ('Stabkerze', 'Taper candle'), 'candle_triple': ('Kerzentrio', 'Candle trio'), 'lantern_hanging': ('Hängelaterne', 'Hanging lantern'), 'lantern_standing': ('Stehlaterne', 'Standing lantern'),
  'pumpkin_orange': ('Orangener Kürbis', 'Orange pumpkin'), 'pumpkin_orange_jackolantern': ('Kürbisgesicht', 'Pumpkin face'), 'pumpkin_orange_small': ('Kleiner Kürbis', 'Small pumpkin'),
  'pumpkin_yellow': ('Gelber Kürbis', 'Yellow pumpkin'), 'pumpkin_yellow_jackolantern': ('Gelbes Kürbisgesicht', 'Yellow pumpkin face'), 'pumpkin_yellow_small': ('Kleiner gelber Kürbis', 'Small yellow pumpkin'),
  'post_lantern': ('Laternenpfosten', 'Lantern post')})
rule('halloween', 'bench.*|candle.*|lantern_.*|pumpkin_.*|post_lantern', 'moebel', cat=lambda n: 'licht' if n.startswith(('candle', 'lantern', 'post')) else 'sitz' if n.startswith('bench') else 'deko', price=300, planet='nachtmarkt', sc=1.4)
rule('halloween', 'tree_.*|pumpkin_.*|lantern_standing|post_lantern|post', 'deko', planets=['nachtmarkt', 'gluehwurm', 'kompost'], w=.3, h=3, big=1)
rule('halloween', '.*', 'bau', use='Herbst-Zäune, Wege und Torbögen für den Nachtmarkt')

# ---------- hexa (KayKit medieval hexagon) ----------
names('hexa', {'building_archeryrange': ('Mini-Bogenschiessplatz', 'Mini archery range'), 'building_barracks': ('Mini-Kaserne', 'Mini barracks'), 'building_blacksmith': ('Mini-Schmiede', 'Mini smithy'),
  'building_castle': ('Mini-Burg', 'Mini castle'), 'building_church': ('Mini-Kapelle', 'Mini chapel'), 'building_home': ('Mini-Haus', 'Mini house'), 'building_lumbermill': ('Mini-Sägerei', 'Mini sawmill'),
  'building_market': ('Mini-Markt', 'Mini market'), 'building_mine': ('Mini-Mine', 'Mini mine'), 'building_tavern': ('Mini-Gasthaus', 'Mini inn'), 'building_tower': ('Mini-Turm', 'Mini tower'),
  'building_tower_base': ('Mini-Turmsockel', 'Mini tower base'), 'building_tower_catapult': ('Mini-Katapultturm', 'Mini catapult tower'), 'building_watermill': ('Mini-Wassermühle', 'Mini watermill'),
  'building_well': ('Mini-Brunnen', 'Mini well'), 'building_windmill': ('Mini-Windmühle', 'Mini windmill'), 'building_bridge': ('Mini-Brücke', 'Mini bridge'), 'building_destroyed': ('Mini-Ruine', 'Mini ruin'),
  'building_dirt': ('Mini-Baustelle', 'Mini building site'), 'building_grain': ('Mini-Kornfeld', 'Mini grain field'), 'building_scaffolding': ('Mini-Gerüst', 'Mini scaffold'), 'building_stage': ('Mini-Bühne', 'Mini stage'),
  'barrel': ('Fass', 'Barrel'), 'bucket_arrows': ('Pfeilköcher', 'Arrow bucket'), 'bucket_empty': ('Eimer', 'Bucket'), 'bucket_water': ('Wassereimer', 'Water bucket'), 'crate_A_big': ('Grosse Kiste', 'Big crate'),
  'crate_A_small': ('Kiste', 'Crate'), 'crate_B_big': ('Grosse Lattenkiste', 'Big slatted crate'), 'crate_B_small': ('Lattenkiste', 'Slatted crate'), 'crate_long': ('Lange Kiste', 'Long crate'), 'crate_long_empty': ('Leere lange Kiste', 'Empty long crate'),
  'crate_open': ('Offene Kiste', 'Open crate'), 'flag': ('Wimpel', 'Pennant'), 'ladder': ('Leiter', 'Ladder'), 'pallet': ('Palette', 'Pallet'), 'resource_lumber': ('Bretterstapel', 'Lumber pile'), 'resource_stone': ('Steinstapel', 'Stone pile'),
  'sack': ('Mehlsack', 'Flour sack'), 'target': ('Strohscheibe', 'Straw target'), 'tent': ('Marktzelt', 'Market tent'), 'weaponrack': ('Ritterständer', 'Knight stand'), 'wheelbarrow': ('Schubkarre', 'Wheelbarrow')})
rule('hexa', 'building_.*', 'moebel', cat='spiel', price=1200, planet='bibliothek', h=.9, w=1.0)
rule('hexa', 'building_.*', 'deko', planets=['drachen', 'origami'], w=.12, h=2.6, big=1)
rule('hexa', 'projectile_catapult', 'deko', planets=['bauklotz'], w=.2, h=.5)
rule('hexa', '(barrel|bucket_|crate_|flag_|ladder|pallet|resource_|sack|target|tent|weaponrack|wheelbarrow).*', 'moebel', cat=lambda n: 'lager' if n.startswith(('barrel', 'crate', 'sack', 'pallet', 'resource')) else 'deko', price=250, planet='drachen', sc=1.2)
rule('hexa', '(barrel|bucket_|crate_|flag_|ladder|pallet|resource_|sack|target|tent|weaponrack|wheelbarrow).*', 'deko', planets=['drachen'], w=.25, h=1.2)
rule('hexa', 'wall_.*|fence_.*', 'bau', use='Mauern und Zäune für den Drachen-Mond')
rule('hexa', '(hill|hills|mountain).*', 'deko', planets=['origami', 'wolkenarchipel'], w=.15, h=5, big=1)
rule('hexa', 'cloud_.*', 'deko', planets=['wolkenarchipel', 'wetterwerk'], w=.3, h=2, float=4)
rule('hexa', '(tree|trees|rock|waterlily|waterplant).*', 'deko', planets=['origami', 'drachen', 'riesengarten'], w=.4, h=2.4, big=1)

# ---------- holiday ----------
rule('holiday', 'cabin-.*|floor-.*', 'bau', use='Blockhütten auf Frost (schon im Spiel)', used=1)
names('holiday', {'bench': ('Winterbank', 'Winter bench'), 'bench-short': ('Kurze Winterbank', 'Short winter bench'), 'candy-cane': ('Zuckerstange', 'Candy cane'), 'festivus-pole': ('Feststange', 'Festive pole'),
  'gingerbread-man': ('Lebkuchenmann', 'Gingerbread man'), 'gingerbread-woman': ('Lebkuchenfrau', 'Gingerbread woman'), 'hanukkah-dreidel': ('Dreidel', 'Dreidel'), 'hanukkah-menorah': ('Menora', 'Menorah'),
  'hanukkah-menorah-candles': ('Menora mit Kerzen', 'Menorah with candles'), 'kwanzaa-kikombe': ('Kikombe-Becher', 'Kikombe cup'), 'kwanzaa-kinara': ('Kinara', 'Kinara'), 'kwanzaa-kinara-alternative': ('Kinara, zweite Form', 'Kinara, second style'),
  'lantern': ('Winterlaterne', 'Winter lantern'), 'lantern-hanging': ('Hängende Winterlaterne', 'Hanging winter lantern'), 'lights-colored': ('Bunte Lichterkette', 'Coloured fairy lights'), 'lights-green': ('Grüne Lichterkette', 'Green fairy lights'),
  'lights-red': ('Rote Lichterkette', 'Red fairy lights'), 'nutcracker': ('Nussknacker', 'Nutcracker'), 'present-a-cube': ('Geschenkwürfel', 'Gift cube'), 'present-a-rectangle': ('Geschenkpaket', 'Gift parcel'), 'present-a-round': ('Rundes Geschenk', 'Round gift'),
  'present-b-cube': ('Geschenkwürfel mit Schleife', 'Bow gift cube'), 'present-b-rectangle': ('Langes Geschenk', 'Long gift'), 'present-b-round': ('Geschenkdose', 'Gift tin'), 'reindeer': ('Holzrentier', 'Wooden reindeer'),
  'sled': ('Schlitten', 'Sledge'), 'sled-long': ('Langer Schlitten', 'Long sledge'), 'snowman': ('Schneemann', 'Snowman'), 'snowman-hat': ('Schneemann mit Hut', 'Snowman with hat'), 'snowflake': ('Schneeflocke', 'Snowflake'),
  'sock-green': ('Grüner Strumpf', 'Green stocking'), 'sock-green-cane': ('Grüner Strumpf mit Zuckerstange', 'Green stocking with cane'), 'sock-red': ('Roter Strumpf', 'Red stocking'), 'sock-red-cane': ('Roter Strumpf mit Zuckerstange', 'Red stocking with cane'),
  'train-locomotive': ('Spielzeug-Dampflok', 'Toy steam engine'), 'train-tender': ('Spielzeug-Tender', 'Toy tender'), 'train-wagon': ('Spielzeugwagen', 'Toy wagon'), 'train-wagon-flat': ('Flachwagen', 'Flat wagon'),
  'train-wagon-flat-short': ('Kurzer Flachwagen', 'Short flat wagon'), 'train-wagon-logs': ('Holzwagen', 'Log wagon'), 'train-wagon-short': ('Kurzer Wagen', 'Short wagon'), 'trainset-rail-bend': ('Spielzeugschiene Bogen', 'Toy rail bend'),
  'trainset-rail-corner': ('Spielzeugschiene Ecke', 'Toy rail corner'), 'trainset-rail-detailed-bend': ('Holzschiene Bogen', 'Wooden rail bend'), 'trainset-rail-detailed-corner': ('Holzschiene Ecke', 'Wooden rail corner'),
  'trainset-rail-detailed-straight': ('Holzschiene gerade', 'Wooden rail straight'), 'trainset-rail-straight': ('Spielzeugschiene gerade', 'Toy rail straight'), 'tree': ('Tännchen', 'Little fir'), 'tree-decorated': ('Geschmückter Baum', 'Decorated tree'),
  'tree-decorated-snow': ('Verschneiter Festbaum', 'Snowy festive tree'), 'wreath': ('Kranz', 'Wreath'), 'wreath-decorated': ('Geschmückter Kranz', 'Decorated wreath'), 'rocks-small': ('Kieselhaufen', 'Pebble pile')})
rule('holiday', '(rocks|snow-|tree-snow).*', 'deko', planets=['frost'], w=.4, h=1.6, used=1)
rule('holiday', 'tree.*|snowman.*|reindeer|sled.*|present-.*|lantern', 'deko', planets=['frost'], w=.2, h=1.6, big=1)
rule('holiday', '.*', 'moebel', cat=lambda n: 'licht' if n.startswith(('lantern', 'lights', 'hanukkah-menorah', 'kwanzaa-kinara')) else 'sitz' if n.startswith('bench') else 'wand' if n.startswith(('sock', 'wreath')) else 'spiel' if n.startswith('train') else 'deko', price=350, planet='frost', sc=1.2)

# ---------- industrial ----------
rule('industrial', 'building-.*', 'bau', use='Fertige Fabrikgebäude für Stadt-Planeten (Häuser-Pool)')
rule('industrial', '.*', 'deko', planets=['rechenzentrum', 'funkturm', 'wetterwerk', 'dinofabrik'], w=.15, h=4, big=1)

# ---------- kcity ----------
rule('kcity', 'building_[A-H]', 'weg', why='Doppel: dasselbe Haus mit Sockelplatte (die Variante ohne Sockel wird verwendet)')
rule('kcity', 'building_.*', 'bau', use='Fertige Stadthäuser für Metro und Kaufhaus (Häuser-Pool)')
rule('kcity', 'road_.*|base', 'weg', why='flache Strassenkachel für Raster-Welten; unsere Strassen werden auf der Kugel erzeugt')
rule('kcity', '.*', 'deko', planets=URBAN, w=.25, h=1.6, big=1)
names('kcity', {'bench': ('Stadtbank', 'City bench'), 'firehydrant': ('Hydrant', 'Fire hydrant'), 'streetlight': ('Strassenlaterne', 'Street light'), 'trafficlight': ('Ampel', 'Traffic light'),
  'trash': ('Abfalleimer', 'Litter bin'), 'dumpster': ('Container', 'Skip bin'), 'watertower': ('Wasserturm-Modell', 'Water tower model')})
rule('kcity', 'bench|firehydrant|streetlight|trafficlight_.*|trash_.*|watertower', 'moebel', cat=lambda n: 'licht' if n.startswith(('street', 'traffic')) else 'deko', price=500, planet='metro', sc=.9)

# ---------- kfurn (KayKit furniture) ----------
names('kfurn', {'armchair': ('Ohrensessel', 'Wingback chair'), 'armchair_pillows': ('Sessel mit Kissen', 'Armchair with cushions'), 'bed_double': ('Familienbett', 'Family bed'), 'bed_single': ('Kinderbett', 'Child’s bed'),
  'book_set': ('Bücherreihe', 'Row of books'), 'book_single': ('Buch', 'Book'), 'cabinet_medium': ('Kommode', 'Chest of drawers'), 'cabinet_medium_decorated': ('Geschmückte Kommode', 'Decorated drawers'),
  'cabinet_small': ('Kleine Kommode', 'Small drawers'), 'cabinet_small_decorated': ('Geschmückte kleine Kommode', 'Decorated small drawers'), 'cactus_medium': ('Topfkaktus', 'Potted cactus'), 'cactus_small': ('Mini-Kaktus', 'Mini cactus'),
  'chair': ('Esszimmerstuhl', 'Dining chair'), 'chair_A_wood': ('Holzstuhl', 'Wooden chair'), 'chair_B_wood': ('Holzlehnstuhl', 'Wooden armchair'), 'chair_stool': ('Hocker', 'Stool'), 'chair_stool_wood': ('Holzhocker', 'Wooden stool'),
  'couch': ('Couch', 'Couch'), 'couch_pillows': ('Couch mit Kissen', 'Couch with cushions'), 'lamp_standing': ('Leselampe', 'Reading lamp'), 'lamp_table': ('Tischleuchte', 'Table lamp'),
  'pictureframe_large': ('Grosses Bild', 'Large picture'), 'pictureframe_medium': ('Bild', 'Picture'), 'pictureframe_small': ('Kleines Bild', 'Small picture'), 'pictureframe_standing': ('Bilderrahmen', 'Photo frame'),
  'pillow': ('Sofakissen', 'Sofa cushion'), 'rug_oval': ('Ovaler Webteppich', 'Oval woven rug'), 'rug_rectangle': ('Webteppich', 'Woven rug'), 'rug_rectangle_stripes': ('Streifenteppich', 'Striped rug'),
  'shelf_A_big': ('Grosses Wandregal', 'Large wall shelf'), 'shelf_A_small': ('Wandregal', 'Wall shelf'), 'shelf_B_large': ('Bücherwand', 'Bookshelf wall'), 'shelf_B_large_decorated': ('Volle Bücherwand', 'Full bookshelf'),
  'shelf_B_small': ('Kleines Regal', 'Small shelf'), 'shelf_B_small_decorated': ('Kleines volles Regal', 'Small full shelf'), 'table_low': ('Niedriger Tisch', 'Low table'), 'table_medium': ('Familientisch', 'Family table'),
  'table_medium_long': ('Langer Familientisch', 'Long family table'), 'table_small': ('Teetischchen', 'Tea table')})
rule('kfurn', '.*', 'moebel', cat=lambda n: 'sitz' if n.startswith(('armchair', 'chair', 'couch')) else 'bett' if n.startswith('bed') else 'lager' if n.startswith(('cabinet', 'shelf')) else 'pflanze' if n.startswith('cactus')
     else 'licht' if n.startswith('lamp') else 'wand' if n.startswith('pictureframe_') and 'standing' not in n else 'teppich' if n.startswith('rug') else 'tisch' if n.startswith('table') else 'deko', price=700, planet='alle', sc=1.6, orig=1)

# ---------- market ----------
rule('market', 'character-.*', 'weg', why='fertige Figur; im Spiel baut man Figuren selbst')
rule('market', 'column|floor|wall.*|fence.*', 'bau', use='Laden-Innenraum (schon im Spiel)', used=1)
names('market', {'bottle-return': ('Flaschenautomat', 'Bottle return'), 'cash-register': ('Ladenkasse', 'Shop till'), 'display-bread': ('Brotauslage', 'Bread display'), 'display-fruit': ('Obstauslage', 'Fruit display'),
  'freezer': ('Tiefkühltruhe', 'Chest freezer'), 'freezers-standing': ('Kühlregal', 'Fridge aisle'), 'shelf-bags': ('Tütenregal', 'Bag shelf'), 'shelf-boxes': ('Schachtelregal', 'Box shelf'), 'shelf-end': ('Regalende', 'Shelf end'),
  'shopping-basket': ('Einkaufskorb', 'Shopping basket'), 'shopping-cart': ('Einkaufswagen', 'Shopping trolley')})
rule('market', '.*', 'moebel', cat=lambda n: 'technik' if n in ('bottle-return', 'cash-register', 'freezer', 'freezers-standing') else 'lager', price=800, planet='kaufhaus', sc=1.4)

# ---------- metro (city commercial) ----------
rule('metro', 'building-.*', 'bau', use='Stadthäuser auf Metro (schon im Spiel)', used=1)
rule('metro', 'low-detail-building-.*', 'deko', planets=['metro', 'kaufhaus'], w=.06, h=9, big=1)
rule('metro', 'detail-parasol-.*', 'moebel', cat='deko', price=500, planet='metro', h=2.2, w=2.2, name=('Sonnenschirm', 'Parasol'))
rule('metro', '.*', 'bau', use='Markisen und Vordächer für Stadthäuser')

# ---------- modspace / modular ----------
rule('modspace', '.*', 'bau', use='Raumstations-Gänge und Räume (Stationen, Glitch-Kern)')
rule('modular', '.*', 'bau', use='Stadthaus-Baukasten (schon im Spiel)', used=1)

# ---------- nature ----------
rule('nature', 'ground_.*', 'weg', why='flache Boden- und Flusskachel für Raster-Welten; unser Gelände ist eine Kugel')
rule('nature', 'bridge_.*', 'bau', use='Brücken über Flüsse')
rule('nature', 'tree_.*_fall|tree_fat_fall', 'deko', planets=['kompost', 'riesengarten'], w=.25, h=4.5, big=1, tree=1)
rule('nature', 'tree_.*_dark|tree_fat_darkh', 'deko', planets=['pilz', 'dschungel', 'gluehwurm'], w=.25, h=4.5, big=1, tree=1)
rule('nature', 'tree_palm.*', 'deko', planets=['korallen', 'urzeit', 'wueste'], w=.3, h=5, big=1, tree=1)
rule('nature', 'tree_pine.*|tree_cone.*', 'deko', planets=['frost', 'wetterwerk', 'keim'], w=.3, h=5, big=1, tree=1)
rule('nature', 'tree_.*', 'deko', planets=['kompost', 'riesengarten', 'heim', 'keim', 'drachen'], w=.25, h=4.5, big=1, tree=1)
rule('nature', 'cactus_.*', 'deko', planets=['wueste'], w=.4, h=2.2, big=1)
rule('nature', 'cliff_.*', 'deko', planets=['urzeit', 'wueste', 'bernstein', 'drachen'], w=.08, h=4, big=1, rock=1)
rule('nature', '(rock|stone)_.*', 'deko', planets=['kompost', 'frost', 'urzeit', 'keim', 'drachen', 'pixelmond', 'riesengarten'], w=.25, h=1.2, big=1, rock=1)
rule('nature', '(flower|grass|plant|mushroom|lily|hanging).*', 'deko', planets=['kompost', 'riesengarten', 'pilz', 'keim', 'honigwabe', 'heim'], w=.6, h=.8)
rule('nature', 'crop.*', 'deko', planets=['kompost', 'keim'], w=.3, h=.9)
rule('nature', '(log|stump|fence|path|platform|statue|campfire|tent|canoe|sign|pot|bed).*', 'deko', planets=['kompost', 'riesengarten', 'dschungel', 'keim'], w=.15, h=1.2, big=1)
names('nature', {'campfire_bricks': ('Gartenfeuer mit Ziegeln', 'Brick fire pit'), 'campfire_logs': ('Lagerfeuer', 'Campfire'), 'campfire_planks': ('Bretterfeuer', 'Plank fire'), 'campfire_stones': ('Steinfeuer', 'Stone fire pit'),
  'canoe': ('Kanu', 'Canoe'), 'canoe_paddle': ('Paddel', 'Paddle'), 'pot_large': ('Grosser Pflanztopf', 'Large planter'), 'pot_small': ('Pflanztopf', 'Planter'), 'sign': ('Holzschild', 'Wooden sign'),
  'statue_block': ('Steinblock-Statue', 'Block statue'), 'statue_column': ('Säule', 'Column'), 'statue_columnDamaged': ('Alte Säule', 'Old column'), 'statue_head': ('Steinkopf', 'Stone head'), 'statue_obelisk': ('Obelisk', 'Obelisk'),
  'statue_ring': ('Steinring', 'Stone ring'), 'tent_detailedClosed': ('Zelt', 'Tent'), 'tent_detailedOpen': ('Offenes Zelt', 'Open tent'), 'tent_smallClosed': ('Kleines Zelt', 'Small tent'), 'tent_smallOpen': ('Kleines offenes Zelt', 'Small open tent'),
  'log_stack': ('Holzstapel', 'Log stack'), 'log_stackLarge': ('Grosser Holzstapel', 'Large log stack'), 'bed': ('Schlafsack', 'Sleeping bag'), 'bed_floor': ('Strohlager', 'Straw bed'), 'mushroom_redGroup': ('Fliegenpilz-Gruppe', 'Toadstool cluster'),
  'mushroom_tanGroup': ('Pilzgruppe', 'Mushroom cluster'), 'flower_purpleA': ('Lila Blume', 'Purple flower'), 'flower_redA': ('Rote Blume', 'Red flower'), 'flower_yellowA': ('Gelbe Blume', 'Yellow flower'),
  'plant_bushLarge': ('Grosser Busch', 'Large bush'), 'plant_bush': ('Busch', 'Bush'), 'fence_simple': ('Gartenzaun', 'Garden fence'), 'fence_gate': ('Gartentor', 'Garden gate'), 'fence_planks': ('Bretterzaun', 'Plank fence')})
rule('nature', 'campfire_.*|canoe.*|pot_.*|sign|statue_.*|tent_.*|log_stack.*|bed|bed_floor|mushroom_(red|tan)Group|flower_(purple|red|yellow)A|plant_bush(Large)?|fence_(simple|gate|planks)', 'moebel',
     cat=lambda n: 'pflanze' if n.startswith(('pot', 'mushroom', 'flower', 'plant')) else 'bett' if n.startswith('bed') else 'licht' if n.startswith('campfire') else 'deko', price=400, planet='alle', sc=1.2, orig=1, yard=1)
rule('nature', '.*', 'deko', planets=['kompost', 'keim'], w=.1, h=1.2)

# ---------- pirate ----------
names('pirate', {'barrel': ('Rumfass', 'Barrel'), 'bottle': ('Flaschenpost', 'Message in a bottle'), 'bottle-large': ('Grosse Flaschenpost', 'Large message bottle'), 'cannon': ('Kanone', 'Cannon'), 'cannon-ball': ('Kanonenkugel', 'Cannonball'),
  'cannon-mobile': ('Fahrbare Kanone', 'Wheeled cannon'), 'chest': ('Schatztruhe', 'Treasure chest'), 'crate': ('Hafenkiste', 'Dock crate'), 'crate-bottles': ('Flaschenkiste', 'Bottle crate'), 'flag': ('Fahne', 'Flag'), 'flag-high': ('Hohe Fahne', 'Tall flag'),
  'flag-high-pennant': ('Hoher Wimpel', 'Tall pennant'), 'flag-pennant': ('Wimpel', 'Pennant'), 'flag-pirate': ('Piratenflagge', 'Pirate flag'), 'flag-pirate-high': ('Hohe Piratenflagge', 'Tall pirate flag'),
  'flag-pirate-high-pennant': ('Hoher Piratenwimpel', 'Tall pirate pennant'), 'flag-pirate-pennant': ('Piratenwimpel', 'Pirate pennant'), 'boat-row-large': ('Grosses Ruderboot', 'Large rowing boat'), 'boat-row-small': ('Ruderboot', 'Rowing boat'),
  'ship-ghost': ('Geisterschiff-Modell', 'Ghost ship model'), 'ship-large': ('Grosses Schiffsmodell', 'Large ship model'), 'ship-medium': ('Schiffsmodell', 'Ship model'), 'ship-pirate-large': ('Grosses Piratenschiff-Modell', 'Large pirate ship model'),
  'ship-pirate-medium': ('Piratenschiff-Modell', 'Pirate ship model'), 'ship-pirate-small': ('Kleines Piratenschiff', 'Small pirate ship'), 'ship-small': ('Kleines Schiffsmodell', 'Small ship model'), 'ship-wreck': ('Wrack-Modell', 'Wreck model'),
  'tool-paddle': ('Ruder', 'Oar'), 'tool-shovel': ('Schatzschaufel', 'Treasure shovel'), 'mast': ('Mast', 'Mast'), 'mast-ropes': ('Mast mit Tauen', 'Rigged mast')})
rule('pirate', 'ship-.*|boat-.*', 'deko', planets=COAST, w=.06, h=4, big=1, shore=1)
rule('pirate', 'ship-.*', 'moebel', cat='deko', price=1500, planet='korallen', h=1.0, w=1.0)
rule('pirate', 'castle-.*|tower-.*|structure.*|platform.*', 'bau', use='Piratenfestung und Stege auf Korallen')
rule('pirate', 'grass.*|patch-.*|palm-.*|rocks-.*|hole', 'deko', planets=['korallen', 'tiefsee'], w=.4, h=1.6, used=1)
rule('pirate', '.*', 'moebel', cat=lambda n: 'lager' if n.startswith(('barrel', 'chest', 'crate')) else 'wand' if n.startswith('tool') else 'deko', price=450, planet='korallen', sc=.45, used_some=1)

# ---------- plat (platformer) ----------
rule('plat', 'block-(grass|snow)-overhang.*', 'weg', why='Doppel: gleicher Block mit überhängender Grasdecke; für runde Planeten reicht die Grundform')
rule('plat', 'block-snow-.*', 'deko', planets=['frost'], w=.05, h=1.5, big=1, float=2.5)
rule('plat', 'block-.*', 'deko', planets=['neonarkade', 'pixelmond', 'bauklotz'], w=.06, h=1.5, big=1, float=2.5)
names('plat', {'arrow': ('Pfeilschild', 'Arrow sign'), 'arrows': ('Wegweiser-Pfeile', 'Arrow signpost'), 'barrel': ('Spielfass', 'Game barrel'), 'bomb': ('Spielzeugbombe', 'Toy bomb'), 'brick': ('Steinblock', 'Brick block'),
  'button-round': ('Druckknopf', 'Push button'), 'button-square': ('Eckiger Druckknopf', 'Square push button'), 'character-oobi': ('Oobi-Figur', 'Oobi figure'), 'character-oodi': ('Oodi-Figur', 'Oodi figure'), 'character-ooli': ('Ooli-Figur', 'Ooli figure'),
  'character-oopi': ('Oopi-Figur', 'Oopi figure'), 'character-oozi': ('Oozi-Figur', 'Oozi figure'), 'chest': ('Spieltruhe', 'Game chest'), 'coin-bronze': ('Bronzemünze', 'Bronze coin'), 'coin-gold': ('Goldmünze', 'Gold coin'), 'coin-silver': ('Silbermünze', 'Silver coin'),
  'conveyor-belt': ('Laufband', 'Conveyor belt'), 'crate': ('Spielkiste', 'Game crate'), 'crate-item': ('Fragezeichen-Kiste', 'Item crate'), 'crate-item-strong': ('Starke Fragekiste', 'Strong item crate'), 'crate-strong': ('Starke Kiste', 'Strong crate'),
  'door-large-open': ('Grosser Torbogen', 'Large archway'), 'door-open': ('Torbogen', 'Archway'), 'door-rotate': ('Drehtür', 'Revolving door'), 'door-rotate-large': ('Grosse Drehtür', 'Large revolving door'), 'flag': ('Zielfahne', 'Goal flag'),
  'heart': ('Herzblock', 'Heart block'), 'jewel': ('Juwel', 'Jewel'), 'key': ('Goldschlüssel', 'Golden key'), 'lever': ('Spielhebel', 'Game lever'), 'lock': ('Vorhängeschloss', 'Padlock'), 'spring': ('Sprungfeder', 'Spring'),
  'star': ('Stern', 'Star'), 'saw': ('Kreissägen-Block', 'Saw block'), 'sign': ('Spielschild', 'Game sign'), 'pipe': ('Röhre', 'Pipe'), 'spike-block': ('Stachelblock', 'Spike block'), 'spike-block-wide': ('Breiter Stachelblock', 'Wide spike block'),
  'trap-spikes': ('Stachelfalle (Attrappe)', 'Spike trap (prop)'), 'trap-spikes-large': ('Grosse Stachelfalle (Attrappe)', 'Large spike trap (prop)'), 'platform': ('Holzplattform', 'Wooden platform'), 'platform-fortified': ('Feste Plattform', 'Sturdy platform'),
  'platform-overhang': ('Überhang-Plattform', 'Overhang platform'), 'platform-ramp': ('Rampe', 'Ramp'), 'poles': ('Pfähle', 'Poles'), 'ladder': ('Spielleiter', 'Game ladder'), 'ladder-broken': ('Kaputte Leiter', 'Broken ladder'), 'ladder-long': ('Lange Leiter', 'Long ladder')})
rule('plat', '(fence|hedge|tree|flowers|grass|plant|mushrooms|rocks|stones).*', 'deko', planets=['neonarkade', 'pixelmond'], w=.4, h=1.5, used_some=1)
rule('plat', '.*', 'moebel', cat=lambda n: 'spiel' if n.startswith(('character', 'coin', 'star', 'heart', 'jewel', 'key', 'bomb', 'spring', 'crate-item')) else 'deko', price=350, planet='neonarkade', sc=1)
rule('plat', 'coin-.*|star|heart|jewel|crate.*|chest|key|spring|platform.*|ladder.*|sign|arrow.*|pipe|barrel', 'deko', planets=['neonarkade', 'pixelmond'], w=.2, h=1.2)

# ---------- resto (KayKit restaurant) ----------
rule('resto', 'wall.*|floor_.*|door_.*|pillar_.*', 'bau', use='Küchen- und Restaurantwände für Bar und Imbiss')
names('resto', {'bowl': ('Schale', 'Bowl'), 'bowl_dirty': ('Benutzte Schale', 'Used bowl'), 'bowl_small': ('Schälchen', 'Small bowl'), 'chair_A': ('Bistrostuhl', 'Bistro chair'), 'chair_B': ('Café-Stuhl', 'Café chair'), 'chair_stool': ('Thekenhocker', 'Counter stool'),
  'crate': ('Gemüsekiste', 'Veg crate'), 'crate_buns': ('Brötchenkiste', 'Bun crate'), 'crate_carrots': ('Karottenkiste', 'Carrot crate'), 'crate_cheese': ('Käsekiste', 'Cheese crate'), 'crate_ham': ('Schinkenkiste', 'Ham crate'),
  'crate_lettuce': ('Salatkiste', 'Lettuce crate'), 'crate_lid': ('Kistendeckel', 'Crate lid'), 'crate_onions': ('Zwiebelkiste', 'Onion crate'), 'crate_potatoes': ('Kartoffelkiste', 'Potato crate'), 'crate_steak': ('Fleischkiste', 'Meat crate'),
  'crate_tomatoes': ('Tomatenkiste', 'Tomato crate'), 'cuttingboard': ('Hackbrett', 'Chopping board'), 'dishrack': ('Abtropfgestell', 'Dish rack'), 'dishrack_plates': ('Abtropfgestell mit Tellern', 'Dish rack with plates'),
  'extractorhood': ('Abzugshaube', 'Extractor hood'), 'food_burger': ('Burger-Teller', 'Burger plate'), 'food_dinner': ('Tellergericht', 'Dinner plate'), 'food_stew': ('Eintopf-Teller', 'Stew plate'), 'food_vegetableburger': ('Gemüseburger', 'Veggie burger'),
  'fridge_A': ('Restaurant-Kühlschrank', 'Restaurant fridge'), 'fridge_A_decorated': ('Beklebter Kühlschrank', 'Sticker fridge'), 'fridge_B': ('Doppelkühlschrank', 'Double fridge'), 'jar': ('Vorratsglas', 'Storage jar'), 'jar_A': ('Vorratsglas', 'Storage jar'), 'jar_B': ('Bauchiges Glas', 'Round jar'),
  'jar_C': ('Gewürzglas', 'Spice jar'), 'jar_D': ('Hohes Glas', 'Tall jar'), 'ketchup': ('Ketchup', 'Ketchup'), 'kitchencabinet': ('Restaurantschrank', 'Restaurant cabinet'), 'kitchencabinet_corner': ('Restaurant-Eckschrank', 'Restaurant corner cabinet'),
  'kitchencabinet_corner_half': ('Halber Eckschrank', 'Half corner cabinet'), 'kitchencabinet_half': ('Halber Schrank', 'Half cabinet'), 'kitchencounter_innercorner': ('Theken-Innenecke', 'Counter inner corner'),
  'kitchencounter_innercorner_backsplash': ('Theken-Innenecke mit Fliesen', 'Tiled inner corner'), 'kitchencounter_outercorner': ('Theken-Aussenecke', 'Counter outer corner'), 'kitchencounter_outercorner_backsplash': ('Theken-Aussenecke mit Fliesen', 'Tiled outer corner'),
  'kitchencounter_sink': ('Theke mit Spüle', 'Counter with sink'), 'kitchencounter_sink_backsplash': ('Spültheke mit Fliesen', 'Tiled sink counter'), 'kitchencounter_straight': ('Arbeitstheke', 'Work counter'),
  'kitchencounter_straight_A_backsplash': ('Arbeitstheke mit Fliesen', 'Tiled work counter'), 'kitchencounter_straight_A_decorated': ('Volle Arbeitstheke', 'Busy work counter'), 'kitchencounter_straight_B_backsplash': ('Zweite Theke mit Fliesen', 'Second tiled counter'),
  'kitchencounter_straight_decorated': ('Geschmückte Theke', 'Decorated counter'), 'kitchentable': ('Küchentisch', 'Kitchen table'), 'kitchentable_A_large': ('Grosser Küchentisch', 'Large kitchen table'),
  'kitchentable_A_large_decorated': ('Voller Küchentisch', 'Busy kitchen table'), 'kitchentable_B_large': ('Langer Küchentisch', 'Long kitchen table'), 'kitchentable_sink': ('Spültisch', 'Sink table'), 'kitchentable_sink_large': ('Grosser Spültisch', 'Large sink table'),
  'kitchentable_sink_large_decorated': ('Voller Spültisch', 'Busy sink table'), 'knife': ('Kochmesser', 'Chef’s knife'), 'lid': ('Topfdeckel', 'Pot lid'), 'lid_large': ('Grosser Deckel', 'Large lid'), 'menu': ('Menütafel', 'Menu board'),
  'mustard': ('Senf', 'Mustard'), 'oven': ('Backofen', 'Oven'), 'pan_006': ('Wok', 'Wok'), 'pan': ('Bratpfanne', 'Frying pan'), 'papertowel': ('Küchenrolle', 'Kitchen roll'), 'plate': ('Restaurantteller', 'Restaurant plate'),
  'plate_dirty': ('Benutzter Teller', 'Used plate'), 'plate_small': ('Dessertteller', 'Dessert plate'), 'pot': ('Kochtopf', 'Saucepan'), 'pot_A_stew': ('Topf mit Eintopf', 'Pot of stew'), 'pot_B_stew': ('Suppentopf', 'Soup pot'),
  'pot_large': ('Grosser Suppentopf', 'Large stock pot'), 'shelf_papertowel': ('Rollenhalter', 'Roll holder'), 'shelf_papertowel_decorated': ('Voller Rollenhalter', 'Full roll holder'), 'stew_bowl': ('Eintopfschale', 'Stew bowl'), 'stew_pot': ('Eintopftopf', 'Stew pot'),
  'stove_multi': ('Grossküchen-Herd', 'Range cooker'), 'stove_multi_countertop': ('Herdplatten', 'Hob'), 'stove_multi_decorated': ('Herd mit Töpfen', 'Cooker with pots'), 'stove_single': ('Einzelherd', 'Single cooker'),
  'stove_single_countertop': ('Einzelplatte', 'Single hob'), 'table_round': ('Runder Bistrotisch', 'Round bistro table'), 'table_round_A_decorated': ('Gedeckter Bistrotisch', 'Laid bistro table'),
  'table_round_A_small': ('Kleiner Bistrotisch', 'Small bistro table'), 'table_round_A_small_decorated': ('Kleiner gedeckter Tisch', 'Small laid table'), 'towelrail': ('Handtuchhalter', 'Towel rail')})
for k, (de, en) in {'bun': ('Brötchen', 'Bun'), 'bun_bottom': ('Brötchenboden', 'Bun bottom'), 'bun_top': ('Brötchendeckel', 'Bun top'), 'burger_cooked': ('Gebratenes Patty', 'Cooked patty'), 'burger_trash': ('Angebranntes Patty', 'Burnt patty'),
    'burger_uncooked': ('Rohes Patty', 'Raw patty'), 'carrot': ('Karotte', 'Carrot'), 'carrot_chopped': ('Karottenscheiben', 'Sliced carrot'), 'carrot_pieces': ('Karottenstücke', 'Carrot pieces'), 'cheese': ('Käseblock', 'Cheese block'),
    'cheese_chopped': ('Käsewürfel', 'Cheese cubes'), 'cheese_slice': ('Käsescheibe', 'Cheese slice'), 'ham': ('Schinkenstück', 'Ham piece'), 'ham_cooked': ('Gebratener Schinken', 'Cooked ham'), 'ham_trash': ('Angebrannter Schinken', 'Burnt ham'),
    'lettuce': ('Salatkopf', 'Lettuce'), 'lettuce_chopped': ('Geschnittener Salat', 'Chopped lettuce'), 'lettuce_slice': ('Salatblatt', 'Lettuce leaf'), 'onion': ('Speisezwiebel', 'Onion'), 'onion_chopped': ('Gehackte Zwiebel', 'Chopped onion'),
    'onion_rings': ('Zwiebelringe', 'Onion rings'), 'potato': ('Kartoffel', 'Potato'), 'potato_chopped': ('Kartoffelstücke', 'Potato pieces'), 'potato_mashed': ('Kartoffelstock', 'Mashed potato'), 'steak': ('Steak', 'Steak'),
    'steak_pieces': ('Steakstücke', 'Steak pieces'), 'tomato': ('Fleischtomate', 'Tomato'), 'tomato_slice': ('Tomatenscheibe', 'Tomato slice'), 'tomato_slices': ('Tomatenscheiben', 'Tomato slices'),
    'vegetableburger_cooked': ('Gebratenes Gemüsepatty', 'Cooked veggie patty'), 'vegetableburger_uncooked': ('Rohes Gemüsepatty', 'Raw veggie patty')}.items():
    N[('resto', 'food_ingredient_' + k)] = (de, en)
rule('resto', '.*', 'moebel', cat=lambda n: 'sitz' if n.startswith('chair') else 'tisch' if n.startswith(('table', 'kitchentable')) else 'lager' if n.startswith(('crate', 'jar', 'shelf', 'dishrack')) else 'deko' if n.startswith(('food', 'plate', 'bowl', 'stew_bowl', 'menu', 'ketchup', 'mustard')) else 'kueche',
     price=300, planet=lambda n: 'kaufhaus' if n.startswith(('food', 'crate')) else 'alle', sc=1.6, orig=1)

# ---------- retro (Kenney retro fantasy) ----------
rule('retro', 'tree-.*|barrels|detail-.*|bricks|pulley.*', 'deko', planets=['bernstein', 'drachen', 'uhrwerk'], w=.3, h=1.6, big=1)
rule('retro', '.*', 'bau', use='Fachwerk- und Steinhäuser für Drachen-Mond und Uhrwerk; Kokon-Ruinen')

# ---------- roads ----------
rule('roads', 'road-.*|tile-.*', 'weg', why='flache Strassenkachel für Raster-Welten; unsere Strassen werden auf der Kugel erzeugt')
rule('roads', 'bridge-pillar.*', 'bau', use='Brückenpfeiler für Magnetbahn-Brücken')
rule('roads', '.*', 'deko', planets=URBAN + ['magnetbahn'], w=.2, h=3, big=1)
names('roads', {'construction-barrier': ('Absperrgitter', 'Road barrier'), 'construction-cone': ('Baustellenkegel', 'Road cone'), 'construction-fence': ('Bauzaun', 'Site fence'), 'construction-light': ('Baustellenlampe', 'Site lamp'),
  'light-curved': ('Bogenlaterne', 'Curved street lamp'), 'light-square': ('Eckige Laterne', 'Square street lamp'), 'traffic-light': ('Verkehrsampel', 'Traffic signal'), 'road-sign-stop': ('Stoppschild', 'Stop sign'), 'road-sign-warning': ('Warnschild', 'Warning sign'), 'road-sign-street': ('Strassenschild', 'Street sign')})
rule('roads', 'construction-(barrier|cone|fence|light)|light-curved|light-square|traffic-light|road-sign-(stop|warning|street)', 'moebel', cat=lambda n: 'licht' if 'light' in n else 'deko', price=400, planet='metro', sc=.6)

# ---------- space (Kenney space kit) ----------
rule('space', 'weapon_.*|turret_.*', 'weg', why='Waffe – passt nicht in ein gewaltfreies Kinderspiel')
rule('space', 'terrain.*|corridor.*|platform_.*|stairs.*|structure.*|gate_.*|supports_.*|rail.*|pipe_.*', 'bau', use='Raumhafen- und Stationsbauten (Gänge, Plattformen, Rohre)')
rule('space', 'monorail_.*', 'deko', planets=['magnetbahn'], w=.12, h=2.2, big=1)
names('space', {'alien': ('Alien-Figur', 'Alien figure'), 'astronautA': ('Astronauten-Figur', 'Astronaut figure'), 'astronautB': ('Astronautin-Figur', 'Astronaut figure'), 'rover': ('Rover-Modell', 'Rover model'),
  'satelliteDish': ('Mini-Schüssel', 'Mini dish'), 'satelliteDish_detailed': ('Satellitenschüssel', 'Satellite dish'), 'satelliteDish_large': ('Grosse Schüssel', 'Large dish'), 'desk_chair': ('Raumschiff-Stuhl', 'Spaceship chair'),
  'desk_chairArms': ('Kommandosessel', 'Command chair'), 'desk_chairStool': ('Raumhocker', 'Space stool'), 'desk_computer': ('Raumschiff-Computer', 'Spaceship computer'), 'desk_computerCorner': ('Eck-Konsole', 'Corner console'),
  'desk_computerScreen': ('Bildschirmpult', 'Screen desk'), 'machine_barrel': ('Treibstofffass', 'Fuel drum'), 'machine_barrelLarge': ('Grosser Tank', 'Large tank'), 'machine_generator': ('Generator', 'Generator'),
  'machine_generatorLarge': ('Grosser Generator', 'Large generator'), 'machine_wireless': ('Funkmast', 'Radio mast'), 'machine_wirelessCable': ('Funkmast mit Kabel', 'Cabled radio mast'), 'craft_cargoA': ('Frachtschiff-Modell', 'Cargo ship model'),
  'craft_cargoB': ('Frachter-Modell', 'Freighter model'), 'craft_miner': ('Bergbauschiff-Modell', 'Mining ship model'), 'craft_racer': ('Rennschiff-Modell', 'Racer model'), 'craft_speederA': ('Gleiter-Modell', 'Speeder model'),
  'craft_speederB': ('Gleiter-Modell B', 'Speeder model B'), 'craft_speederC': ('Gleiter-Modell C', 'Speeder model C'), 'craft_speederD': ('Gleiter-Modell D', 'Speeder model D'), 'rocket_baseA': ('Raketensockel', 'Rocket base'), 'rocket_topA': ('Raketenspitze', 'Rocket nose'), 'barrels': ('Fässer', 'Barrels'), 'bones': ('Dino-Knochen-Modell', 'Dino bone model'), 'meteor': ('Meteorit', 'Meteorite'), 'rock_crystals': ('Kristallbrocken', 'Crystal rock')})
rule('space', 'alien|astronaut.|rover|satelliteDish.*|desk_.*|machine_.*|craft_.*|rocket_(base|top)A|barrels|bones|meteor|rock_crystals', 'moebel',
     cat=lambda n: 'sitz' if 'chair' in n or 'Stool' in n else 'technik' if n.startswith(('desk', 'machine', 'satellite')) else 'spiel', price=900, planet='schrott', sc=1, used_some=1)
rule('space', '.*', 'deko', planets=['pixelmond', 'keim', 'heim', 'schrott'], w=.12, h=2.4, big=1)

# ---------- spacebase (KayKit) ----------
rule('spacebase', 'terrain_.*|tunnel_.*', 'weg', why='Gelände- und Tunnelkachel für flache Raster-Welten; unsere Monde sind Kugeln')
rule('spacebase', '.*', 'deko', planets=MOONS + ['heim'], w=.1, h=3, big=1)
names('spacebase', {'lander': ('Landefähre-Modell', 'Lander model'), 'lander_base': ('Landefähren-Sockel', 'Lander base'), 'spacetruck': ('Mond-Laster', 'Moon truck'), 'spacetruck_large': ('Grosser Mond-Laster', 'Large moon truck'),
  'spacetruck_trailer': ('Mond-Anhänger', 'Moon trailer'), 'solarpanel': ('Solarpaneel', 'Solar panel'), 'windturbine_low': ('Kleines Windrad', 'Small wind turbine'), 'windturbine_tall': ('Windrad', 'Wind turbine'),
  'lights': ('Landelichter', 'Landing lights'), 'cargo': ('Frachtkiste', 'Cargo box'), 'cargo_A_packed': ('Volle Frachtkiste', 'Packed cargo box'), 'cargo_B_packed': ('Volle Frachtkiste B', 'Packed cargo box B'),
  'cargo_A_stacked': ('Frachtstapel', 'Cargo stack'), 'cargo_B_stacked': ('Frachtstapel B', 'Cargo stack B'), 'containers': ('Behälter', 'Containers')})
rule('spacebase', 'lander_.*|spacetruck.*|solarpanel|windturbine_.*|lights|cargo_.*|containers_.*', 'moebel', cat=lambda n: 'licht' if n == 'lights' else 'technik' if n.startswith(('solar', 'wind')) else 'spiel' if n.startswith(('lander', 'spacetruck')) else 'lager', price=800, planet='pixelmond', sc=.5)

# ---------- station (space station kit) ----------
rule('station', '(balcony|door|floor|stairs|structure|wall|rail).*', 'bau', use='Stations-Innenräume (schon im Spiel, Wände)', used=1)
names('station', {'bed-double': ('Kojenbett', 'Bunk bed'), 'bed-double-cover': ('Kojenbett mit Decke', 'Bunk bed with cover'), 'bed-single': ('Einzelkoje', 'Single bunk'), 'bed-single-cover': ('Einzelkoje mit Decke', 'Single bunk with cover'),
  'chair': ('Stationsstuhl', 'Station chair'), 'chair-armrest': ('Armlehnstuhl', 'Armchair'), 'chair-armrest-headrest': ('Pilotensessel', 'Pilot seat'), 'chair-cushion': ('Polsterstuhl', 'Cushioned chair'),
  'chair-cushion-headrest': ('Komfortsessel', 'Comfort seat'), 'chair-headrest': ('Kopfstützenstuhl', 'Headrest chair'), 'computer': ('Stationsrechner', 'Station computer'), 'computer-screen': ('Stationsmonitor', 'Station monitor'),
  'computer-system': ('Rechnerschrank', 'Computer cabinet'), 'computer-wide': ('Breiter Stationsrechner', 'Wide station computer'), 'container': ('Behälter', 'Container'), 'container-flat': ('Flacher Behälter', 'Flat container'),
  'container-flat-open': ('Offener Behälter', 'Open container'), 'container-tall': ('Tank', 'Tank'), 'container-wide': ('Vorratstonne', 'Storage drum'), 'display-wall': ('Wandbildschirm', 'Wall display'), 'display-wall-wide': ('Breiter Wandbildschirm', 'Wide wall display'),
  'pipe': ('Rohrstück', 'Pipe piece'), 'pipe-bend': ('Rohrbogen', 'Pipe bend'), 'pipe-bend-diagonal': ('Schräger Rohrbogen', 'Diagonal pipe bend'), 'pipe-end': ('Rohrende', 'Pipe end'), 'pipe-end-colored': ('Buntes Rohrende', 'Coloured pipe end'),
  'pipe-ring': ('Rohrring', 'Pipe ring'), 'pipe-ring-colored': ('Rohrsäule', 'Pipe column'), 'rocks': ('Gesteinsprobe', 'Rock sample'), 'skip': ('Schuttmulde', 'Skip'), 'skip-rocks': ('Volle Schuttmulde', 'Full skip'),
  'table': ('Stationstisch', 'Station table'), 'table-display': ('Holotisch', 'Holo table'), 'table-display-planet': ('Planeten-Holotisch', 'Planet holo table'), 'table-display-small': ('Kleiner Holotisch', 'Small holo table'),
  'table-inset': ('Einbautisch', 'Inset table'), 'table-inset-small': ('Kleiner Einbautisch', 'Small inset table'), 'table-large': ('Grosser Stationstisch', 'Large station table')})
rule('station', '.*', 'moebel', cat=lambda n: 'bett' if n.startswith('bed') else 'sitz' if n.startswith('chair') else 'technik' if n.startswith(('computer', 'display')) else 'tisch' if n.startswith('table') else 'lager', price=900, planet='schrott', sc=1.6, used_some=1)

# ---------- suburban ----------
rule('suburban', 'building-type-.*', 'bau', use='Fertige Vorstadthäuser für Kompost und Heimatplanet (Häuser-Pool)')
rule('suburban', 'driveway-.*|path-.*', 'weg', why='flache Weg- und Einfahrtkachel; unsere Wege werden auf der Kugel erzeugt')
rule('suburban', 'fence.*', 'bau', use='Gartenzäune für Vorgärten')
rule('suburban', '.*', 'deko', planets=['kompost', 'heim', 'keim'], w=.3, h=3, big=1)
names('suburban', {'planter': ('Pflanzkübel', 'Planter')})
rule('suburban', 'planter', 'moebel', cat='pflanze', price=400, planet='alle', sc=1.2)

# ---------- survival ----------
rule('survival', '(floor|structure|metal-panel|fence).*', 'bau', use='Hütten und Unterstände (Schrott-Planet, Wartungstunnel)')
names('survival', {'barrel': ('Regentonne', 'Water butt'), 'barrel-open': ('Offene Tonne', 'Open barrel'), 'bedroll': ('Isomatte', 'Sleeping mat'), 'bedroll-frame': ('Feldbett', 'Camp bed'), 'bedroll-packed': ('Gerollte Matte', 'Rolled mat'),
  'bottle': ('Feldflasche', 'Canteen'), 'bottle-large': ('Wasserkanister', 'Water jug'), 'box': ('Werkzeugkiste', 'Toolbox'), 'box-large': ('Grosse Werkzeugkiste', 'Large toolbox'), 'box-large-open': ('Offene Werkzeugkiste', 'Open toolbox'),
  'box-open': ('Offene Kiste', 'Open box'), 'bucket': ('Blecheimer', 'Tin bucket'), 'campfire-fishing-stand': ('Fischgrill', 'Fish grill'), 'campfire-pit': ('Feuerstelle', 'Fire pit'), 'campfire-stand': ('Grillgestell', 'Grill stand'),
  'chest': ('Vorratstruhe', 'Supply chest'), 'fish': ('Getrockneter Fisch', 'Dried fish'), 'fish-large': ('Grosser Trockenfisch', 'Large dried fish'), 'resource-planks': ('Bretter', 'Planks'), 'resource-stone': ('Steine', 'Stones'),
  'resource-stone-large': ('Steinhaufen', 'Stone pile'), 'resource-wood': ('Brennholz', 'Firewood'), 'signpost': ('Wegweiser', 'Signpost'), 'signpost-single': ('Einzelschild', 'Single sign'), 'tent': ('Abenteuerzelt', 'Adventure tent'),
  'tent-canvas': ('Planenzelt', 'Canvas tent'), 'tent-canvas-half': ('Sonnensegel', 'Sun canopy'), 'tool-axe': ('Axt', 'Axe'), 'tool-axe-upgraded': ('Gute Axt', 'Good axe'), 'tool-hammer': ('Hammer', 'Hammer'), 'tool-hammer-upgraded': ('Guter Hammer', 'Good hammer'),
  'tool-hoe': ('Hacke', 'Hoe'), 'tool-hoe-upgraded': ('Gute Hacke', 'Good hoe'), 'tool-pickaxe': ('Spitzhacke', 'Pickaxe'), 'tool-pickaxe-upgraded': ('Gute Spitzhacke', 'Good pickaxe'), 'tool-shovel': ('Schaufel', 'Shovel'),
  'tool-shovel-upgraded': ('Gute Schaufel', 'Good shovel'), 'workbench': ('Werkbank', 'Workbench'), 'workbench-anvil': ('Amboss', 'Anvil'), 'workbench-grind': ('Schleifbank', 'Grinding bench')})
rule('survival', '(tree|rock|grass|patch).*', 'deko', planets=['schrott', 'wetterwerk', 'kompost'], w=.3, h=2, used_some=1)
rule('survival', '.*', 'moebel', cat=lambda n: 'bett' if n.startswith('bedroll') else 'wand' if n.startswith('tool') else 'licht' if n.startswith('campfire') else 'technik' if n.startswith('workbench') else 'lager', price=350, planet='schrott', sc=1.4, used_some=1)

# ---------- town (fantasy town kit) ----------
rule('town', '(wall|roof|stairs|balcony|planks|overhang|chimney|pillar|poles|road|blade|wheel).*', 'bau', use='Dorfhäuser (schon im Spiel)', used=1)
names('town', {'cart': ('Handkarren', 'Hand cart'), 'cart-high': ('Hoher Karren', 'High cart'), 'stall': ('Marktstand', 'Market stall'), 'stall-bench': ('Marktbank', 'Market bench'), 'stall-green': ('Grüner Marktstand', 'Green market stall'),
  'stall-red': ('Roter Marktstand', 'Red market stall'), 'stall-stool': ('Markthocker', 'Market stool'), 'lantern': ('Dorflaterne', 'Village lantern'), 'banner-green': ('Grünes Banner', 'Green banner'), 'banner-red': ('Rotes Banner', 'Red banner'),
  'fountain-round': ('Runder Brunnen', 'Round fountain'), 'fountain-square': ('Eckiger Brunnen', 'Square fountain'), 'watermill': ('Wassermühle-Modell', 'Watermill model'), 'windmill': ('Windmühle-Modell', 'Windmill model')})
rule('town', 'cart.*|stall.*|lantern|banner-.*|fountain-(round|square)|watermill|windmill', 'moebel', cat=lambda n: 'licht' if n == 'lantern' else 'wand' if n.startswith('banner') else 'deko', price=600, planet='alle', sc=.6, used_some=1)
rule('town', '(tree|rock|hedge|fence|cart|stall|lantern|fountain|watermill|windmill).*', 'deko', planets=['kompost', 'heim', 'drachen'], w=.2, h=2.4, big=1, used_some=1)

# ---------- train ----------
names('train', {'train-carriage-box': ('Güterwagen', 'Boxcar'), 'train-carriage-coal': ('Kohlewagen', 'Coal wagon'), 'train-carriage-container': ('Containerwagen', 'Container wagon'), 'train-carriage-dirt': ('Erdwagen', 'Dirt wagon'),
  'train-carriage-flatbed': ('Flachwagen', 'Flatbed wagon'), 'train-carriage-flatbed-wood': ('Holz-Flachwagen', 'Timber flatbed'), 'train-carriage-lumber': ('Langholzwagen', 'Lumber wagon'), 'train-carriage-tank': ('Kesselwagen', 'Tank wagon'),
  'train-carriage-tank-large': ('Grosser Kesselwagen', 'Large tank wagon'), 'train-carriage-wood': ('Holzwagen', 'Wood wagon'), 'train-diesel': ('Diesellok', 'Diesel engine'), 'train-diesel-box': ('Rangierlok', 'Shunter'),
  'train-electric-bullet': ('Schnellzug', 'Bullet train'), 'train-electric-city': ('Stadtbahn', 'City train'), 'train-electric-double': ('Doppelstockzug', 'Double-decker train'), 'train-electric-square': ('Regionalzug', 'Regional train'),
  'train-electric-subway': ('U-Bahn', 'Underground train'), 'train-locomotive': ('Dampflok', 'Steam engine'), 'train-locomotive-passenger': ('Personenlok', 'Passenger engine'), 'train-tram-classic': ('Alte Strassenbahn', 'Classic tram'),
  'train-tram-modern': ('Moderne Strassenbahn', 'Modern tram'), 'train-tram-round': ('Runde Strassenbahn', 'Round tram')})
rule('train', 'train-connector', 'weg', why='Kupplungsstück ohne eigenes Aussehen')
rule('train', 'train-.*', 'moebel', cat='spiel', price=800, planet='magnetbahn', h=.45, w=.9, prefix=('Modell-', 'Model '))
rule('train', 'train-.*', 'deko', planets=['magnetbahn', 'metro'], w=.08, h=2.6, big=1)
rule('train', 'railroad-damaged-.*|spline-track-damaged', 'deko', planets=['schrott'], w=.15, h=.5)
rule('train', '.*', 'bau', use='Gleisstrecken auf der Magnetbahn')

# ---------- water (watercraft) ----------
names('water', {'boat-fan': ('Sumpfboot-Modell', 'Airboat model'), 'boat-fishing-small': ('Fischerboot-Modell', 'Fishing boat model'), 'boat-house': ('Hausboot-Modell', 'Houseboat model'), 'boat-row-large': ('Grosses Ruderboot-Modell', 'Large rowing boat model'),
  'boat-row-small': ('Ruderboot-Modell', 'Rowing boat model'), 'boat-sail': ('Segelboot-Modell', 'Sailing boat model'), 'boat-speed': ('Schnellboot-Modell', 'Speedboat model'), 'boat-tow': ('Schleppboot-Modell', 'Tow boat model'),
  'boat-tug': ('Schlepper-Modell', 'Tugboat model'), 'buoy': ('Boje', 'Buoy'), 'buoy-flag': ('Fahnenboje', 'Flag buoy'), 'cargo-container': ('Schiffscontainer', 'Shipping container'), 'cargo-pile': ('Frachthaufen', 'Cargo pile'),
  'ship-cargo': ('Frachtschiff-Modell', 'Cargo ship model'), 'ship-large': ('Grosses Schiffsmodell', 'Large ship model'), 'ship-ocean-liner': ('Ozeandampfer-Modell', 'Ocean liner model'), 'ship-ocean-liner-small': ('Kleiner Ozeandampfer', 'Small ocean liner'),
  'ship-small': ('Kleines Schiff', 'Small ship'), 'ship-small-ghost': ('Geisterschiffchen', 'Little ghost ship'), 'arrow': ('Wasser-Pfeil', 'Water arrow'), 'arrow-standing': ('Stehender Pfeil', 'Standing arrow'),
  'gate': ('Regatta-Tor', 'Regatta gate'), 'gate-finish': ('Ziel-Tor', 'Finish gate'), 'ramp': ('Sprungrampe', 'Jump ramp'), 'ramp-wide': ('Breite Rampe', 'Wide ramp')})
rule('water', '.*', 'moebel', cat=lambda n: 'spiel' if n.startswith(('boat', 'ship')) else 'deko', price=700, planet='korallen', h=lambda n: .6 if n.startswith(('boat', 'ship')) else .9, w=1.0)
rule('water', '(boat|ship|buoy|cargo|gate|ramp|arrow).*', 'deko', planets=COAST, w=.08, h=2.4, big=1, shore=1)

# ---------------------------------------------------------------------------
def opt(v, n): return v(n) if callable(v) else v

# Zielgrössen je Kategorie (Höhe, grösste Breite) in Spiel-Einheiten; Massstab = das Kleinere von beidem
CAT_HW = {'sitz': (.85, 1.6), 'tisch': (.75, 2.0), 'bett': (.6, 2.0), 'lager': (.85, 1.4), 'licht': (1.3, .8), 'technik': (.9, 1.2), 'deko': (.6, .8),
          'pflanze': (.7, .8), 'teppich': (.1, 1.8), 'kueche': (.95, 1.2), 'bad': (1.0, 1.4), 'wand': (.9, 1.0), 'spiel': (.55, .9), 'musik': (.9, .8)}
def fit(b, cat, o, name):
    h, w = CAT_HW.get(cat, (.6, .8))
    if o.get('h'): h = opt(o['h'], name)
    if o.get('w'): w = opt(o['w'], name)
    H = max(.01, b[4] - b[1]); W = max(.01, b[3] - b[0], b[5] - b[2])
    return round(min(h / H, w / W), 4)

def main():
    items = []; drops = []; bau = []; missing_names = []; per = collections.OrderedDict(); en = {}
    exts = []
    for f in sorted(glob.glob(os.path.join(KITS, '*.json'))):
        if f.endswith('-x.json'): continue
        pack = os.path.basename(f)[:-5]; d = json.load(open(f))
        xf = f[:-5] + '-x.json'
        if os.path.exists(xf): d.update(json.load(open(xf))); exts.append(pack)
        st = per.setdefault(pack, collections.Counter())
        for name, v in d.items():
            b = v.get('b'); roles = {}
            for rx, role, o in R.get(pack, []):
                if role in roles or not rx.match(name): continue
                if (role == 'weg' or rx.pattern == '^(?:.*)$') and roles: continue
                if roles.get('weg'): break
                roles[role] = o
            if not roles:
                print(f'UNDECIDED {pack}/{name}', file=sys.stderr); st['offen'] += 1; continue
            if 'weg' in roles and len(roles) > 1: del roles['weg']
            for role, o in roles.items():
                st[role] += 1
                if role == 'weg': drops.append((pack, name, o['why']))
                elif role == 'bau': bau.append((pack, name, o['use'], o.get('used', 0)))
                elif role == 'moebel':
                    if (pack, name) in LEGACY: st['moebel_alt'] += 1; items.append({'r': 'm', 'k': pack, 'm': name, 'leg': 1}); continue
                    nm = o.get('name') or label(pack, name)
                    if not nm: missing_names.append(f'{pack}/{name}'); continue
                    if o.get('prefix'): nm = (o['prefix'][0] + nm[0], o['prefix'][1] + nm[1])
                    en[nm[0]] = nm[1]
                    items.append({'r': 'm', 'k': pack, 'm': name, 'n': nm[0], 'cat': opt(o['cat'], name), 'p': opt(o['price'], name), 'pl': opt(o['planet'], name),
                                  'sc': fit(b, opt(o['cat'], name), o, name), **({'o': 1} if o.get('orig') else {}), **({'leg': 1} if o.get('legacy') else {}),
                                  **({'wall': 1} if opt(o['cat'], name) == 'wand' else {}), 'bb': [round(x, 3) for x in b] if b else None})
                elif role == 'deko':
                    items.append({'r': 'd', 'k': pack, 'm': name, 'pl': o['planets'], 'w': o.get('w', .3), 'h': o.get('h', 1.5), **({'big': 1} if o.get('big') else {}),
                                  **({'sh': 1} if o.get('shore') else {}), **({'u': 1} if o.get('used') else {}), **({'tr': 1} if o.get('tree') else {}), **({'rk': 1} if o.get('rock') else {}), **({'fl': o['float']} if o.get('float') else {}), **({'t': 1} if o.get('tint') else {}),
                                  'bb': [round(x, 3) for x in b] if b else None})
    if missing_names:
        print('MISSING NAMES:', len(missing_names), file=sys.stderr); print('\n'.join(missing_names[:400]), file=sys.stderr); sys.exit(1)
    if any(st['offen'] for st in per.values()): sys.exit(1)
    load = collections.Counter()
    for it in sorted((i for i in items if i['r'] == 'd'), key=lambda i: (len(i['pl']), i['k'], i['m'])):
        best = min(it['pl'], key=lambda p: (load[p], it['pl'].index(p))); load[best] += 1; it['pl'] = best
    print('deko je Planet:', dict(sorted(load.items(), key=lambda x: -x[1])))
    # legacy kitfurn items already registered in js/kitfurn.js are skipped at runtime (same pack+model)
    js = '/* Generiert von tools/fundus.py – nicht von Hand bearbeiten. Rolle: m = Möbel, d = Deko */\nconst FUNDUS_DATA=' + json.dumps({'items': items, 'en': en, 'ext': exts}, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(ROOT, 'js', 'fundus-data.js'), 'w').write(js)
    # inventory document
    tot = collections.Counter(); L = []
    L.append('# Asset-Inventar (Fundus)\n')
    L.append('Generiert von `tools/fundus.py`. Jedes Modell aus jedem Bausatz in `assets/kits` hat eine Entscheidung. '
             'Rollen: **Möbel** (kaufbar, Name auf Deutsch und Englisch), **Deko** (auf den genannten Planeten verstreut), '
             '**Bau** (Bauteil für Architektur, Innenräume, Gleise; Stufe 2), **weg** (mit Begründung).\n')
    L.append('| Bausatz | Modelle | Möbel | Deko | Bau | weg |\n|---|---|---|---|---|---|')
    for pack, st in per.items():
        n = len(json.load(open(os.path.join(KITS, pack + '.json')))) + (len(json.load(open(os.path.join(KITS, pack + '-x.json')))) if pack in exts else 0)
        L.append(f"| {pack} | {n} | {st['moebel']} | {st['deko']} | {st['bau']} | {st['weg']} |"); tot['n'] += n
        for k in ('moebel', 'deko', 'bau', 'weg'): tot[k] += st[k]
    L.append(f"| **Summe** | **{tot['n']}** | **{tot['moebel']}** | **{tot['deko']}** | **{tot['bau']}** | **{tot['weg']}** |\n")
    used = len({(i['k'], i['m']) for i in items})
    L.append(f"Im Spiel sichtbar (Möbel oder Deko): **{used}** von {tot['n']} Modellen. Bau-Teile: {len(bau)} (davon {sum(1 for x in bau if x[3])} schon im Spiel). Weggelassen: {len(drops)}.\n")
    L.append('## Weggelassen und warum\n')
    why = collections.defaultdict(list)
    for p, n, w in drops: why[(p, w)].append(n)
    for (p, w), ns in why.items(): L.append(f'- **{p}** ({len(ns)}): {w}. ' + ', '.join(ns[:12]) + (' …' if len(ns) > 12 else ''))
    L.append('\n## Bau-Teile (Stufe 2)\n')
    use = collections.defaultdict(list)
    for p, n, u, used_ in bau: use[(p, u)].append(n)
    for (p, u), ns in use.items(): L.append(f'- **{p}** ({len(ns)}): {u}')
    open(os.path.join(ROOT, 'docs', 'ASSET-INVENTAR.md'), 'w').write('\n'.join(L) + '\n')
    print(f"models {tot['n']} moebel {tot['moebel']} deko {tot['deko']} bau {tot['bau']} weg {tot['weg']} visible {used}")

if __name__ == '__main__': main()
