# Cyborg-Labor · Cozy-Stil für Körperteile

Das Spiel ist ein gemütliches Lebens-Sim im Stil von Animal Crossing / Mii / Spielzeug-Figuren,
auf einem kleinen Kompost-Planeten. Schüler:innen bauen Cyborgs aus Teilen (Donna Haraway, Cyborg-Manifest).
Jedes Teil muss auf einem 190-px-Vorschaubild sofort lesbar, niedlich und hochwertig wirken.

## Look
- **Chunky, rund, weich.** Dicke, gerundete Formen; überzeichnete Proportionen (grosse Köpfe, kleine Füsse, dicke Finger/Stummel).
  Keine dünnen Spiesse. Sichtbare Teile mindestens ~0.03·s dick; Ausnahmen nur für wirklich dünne Dinge (Schnurrhaare, Antennendraht, dann ≥0.012·s).
- **Wenige, klare Farben pro Teil** (2–3 Hauptfarben + 1 Akzent) aus `PAL` (core.js). Satt-pastellig, nie grau-trist, nie reines Schwarz (`PAL.ink` statt Schwarz).
- **Details als Geometrie, nicht als Rauschen:** Knöpfe, Nieten (kleine Kugeln), Nähte (dünne Tori), Streifen (Ringe), Glanz über `m.gloss`.
  Keine Noise-/Bump-Texturen, keine Realismus-Effekte.
- **Flache Formen (Flügel, Blätter, Flossen, Ohren, Kämme) mit `G.puff(shape, dicke)`** statt Plane/ShapeGeometry: sie bekommen Volumen und Outlines.
  `G.sh`/Planes nur für echte Membranen, Bildschirme, Aufkleber.
- Maschinen sehen aus wie **Spielzeug**: gerundete Kästen (`G.bx(w,h,d,radius)` mit grossem Radius), bunte Lack-Farben, Chrom sparsam als Akzent.
  Pflanzen wie **Knetfiguren/Filz**, Tiere wie **Plüschtiere** (`m.plush`) oder glänzende Vinyl-Figuren (`m.gloss`).
- Gruselige Dinge (Schädel, Spinne, Überwachung) werden **niedlich** interpretiert (runder Schädel mit grossen Augenhöhlen, Spinne mit Kulleraugen, Kamera mit Glubsch-Linse), bleiben aber erkennbar.
- Alles bekommt automatisch farbige Outlines (Inverted Hull) – ausser transparent/DoubleSide/Glow/Flat/Plane-Geometrie.
  Darum: undurchsichtige, geschlossene Volumen bevorzugen.

## Materialien (`c.m` bzw. `m`)
- `m.skin()` – Hautmaterial des Körpers (vom Spieler gewählt). Für organische Anbauteile, die zur Haut gehören.
- `m.c(farbe, {gloss, rim, opacity, map, side})` – Grund-Toon. `m.toon` = Alias.
- `m.gloss(farbe)` – Lack/Plastik mit Glanzpunkt. `m.plush(farbe)` – flauschig mit hellem Rand.
- `m.chrome() m.steel() m.gold() m.copper() m.holo() m.pearl()` – Matcap-Metalle (sparsam, auf dicken Formen).
- `m.black()` (dunkles Pflaume-Lack), `m.white()`, `m.rubber()`, `m.bone()`, `m.wood()`, `m.leaf(farbe?)` (DoubleSide – lieber `m.c(PAL.leaf)` mit puff).
- `m.glass(tint)` – durchsichtige Kuppeln/Gläser (keine Outline). `m.glow(farbe, stärke)` – leuchtende LEDs/Lichter (klein halten).
- `m.slime(farbe)`, `m.crystal(farbe)`, `m.chitin(farbe)` (glänzender Panzer), `m.eye()` (glänzendes Augenschwarz), `m.cheek()` (rosa Wange).
- `m.tex(key, canvasTexture, opts)` – bemalte Texturen (Bildschirme, Muster). Texturen mit `ctex(key,w,h,draw)` (gecacht über key).

## Geometrie-Helfer (core.js)
`G.s(r) G.hs(r) G.cy(rt,rb,h) G.co(r,h) G.bx(w,h,d,rad) G.to(R,t,arc) G.ca(r,len) G.la(pts) G.puff(shape,depth) G.tu(pts,r1,r2) G.blob(r,amp,f,seed) G.bean G.drop(r,h) G.heart(s,d) G.star(R,r,n,d) G.ex G.sh G.pl G.circ G.ring G.ico G.oct`
`P(parent, geo, mat, [x,y,z], [rx,ry,rz], scale)` – Mesh anlegen. `grp(parent,[pos],[rot])` – Gruppe. `bt(g,a,b,rad,mat,rad2)` – Zylinder von a nach b.
`limbSeg(g,a,b,rad,mat,rad2)` – Zylinder mit Kugel-Enden (weiche Gelenke). `both(f)` → f(-1), f(1). `range(n,(t,i)=>…)`. `shp(pts)` eckig, `sshp(pts)` weich gerundet.
`srand(seed)` – deterministischer Zufall (**kein Math.random beim Bauen**, Vorschaubilder müssen stabil sein; in Animationen ok).
Gesicht: `cuteEye(g,c,x,y,z,r,{iris,w,h,hl,blink,look,mat})`, `mouth(g,c,'smile'|'open'|'cat'|'o',{y,z,w})`, `cheeks(g,c,{y,sp,z})`.

## Kontext `c` beim Bauen
`s` Grösse (0.8–1.3) · `r=.6s` Rumpfradius · `n` Segmente · `ys[] rs[]` Segment-Höhen/Radien · `y0` Hüfthöhe (= Beinhöhe h·s) · `topY` Rumpfoberkante ·
`midY belly` · `shX shY` Schulter · `hipX` Hüfte · `hr=.58s` Kopfradius · `hy` Kopfmitte · `c.H` (nach dem Kopf): `{cy,r,top,front,faceY,sideX}` ·
`c.an((t, laeuft, aktion)=>…)` Animation pro Frame (t Sekunden, laeuft bool, aktion 0..1 wenn eine Fähigkeit ausgelöst wird) · `c.m` Materialien · `c.PAL`.

### Pro Slot
- **kopf**: baut den Kopf um `(0,hy,0)` mit Radius ~`hr`. **Gibt zurück** `{top, front, faceY, sideX}` – `front` = z-Abstand der Gesichtsfläche von der Kopfmitte
  (dort setzt der Augen-Slot die Augen hin!), `faceY` = Augenhöhe, `top` = höchster Punkt (dort sitzen Hüte/Extras), `sideX` = halbe Kopfbreite (Ohren/Kopfhörer).
  Organische/tierische Köpfe: Mund mit `mouth()` (+ optional `cheeks()`), **keine Augen** (die kommen aus dem Augen-Slot). Ausnahme: wenn der Kopf selbst Augen *ist*.
- **augen**: setzt Augen bei `c.H.front / c.H.faceY / c.H.r`. Standard-Augen im Tierdorf-Stil (glänzende dunkle Ovale mit weissen Lichtpunkten, blinzeln).
- **arme**: zwei Schultergelenke bei `(±shX, shY, 0)`; bestehende Helfer `limb/back/swing/wing` im Datei-Kopf dürfen umgebaut werden. Arme schwingen beim Laufen, `aktion` hebt sie.
- **beine**: `B(id,name,kind,h,builder)` – `h` = Beinhöhe relativ zu s. Füsse/Unterseite müssen genau auf **y=0** stehen, Hüfte bei `y0=h·s`.
  Laufanimation über `laeuft`. `h` darf angepasst werden, wenn das Bein dadurch stimmiger wird (Körper sitzt dann höher/tiefer).
- **extras**: Accessoires am Rumpf/Kopf (`onBody`, `front`, `backZ`, `topR` Helfer im Datei-Kopf). Bis zu 4 gleichzeitig – sie sollen sich nicht grob überlappen.

## Regeln
- **IDs, Slot und `k` (Art) jedes Teils bleiben exakt gleich** (alte Codes & Fähigkeiten hängen daran). Deutsche Namen dürfen leicht verbessert werden.
- Nur die eigene Datei `js/parts-<slot>.js` bearbeiten. Keine Änderungen an core.js (fehlende Helfer lokal in der eigenen Datei definieren).
- Pro Teil höchstens ~40 Meshes; Segmentzahlen immer über `G.*` (qualitätsabhängig).
- Keine Konsolenfehler/Warnungen. Kein `roughness/clearcoat/sheen…` (Toon-Materialien kennen das nicht).
- Animationen sanft und federnd (Squash & Stretch, wippen, blinzeln), nicht hektisch.

## Prüfen (Pflicht)
```
node tools/render.mjs <slot> /tmp/<slot>-a.png "mode=part&from=0&n=24&cols=6"     # Vorschaubilder wie im Labor
node tools/render.mjs <slot> /tmp/<slot>-f.png "mode=full&from=0&n=12&cols=6"     # am ganzen Cyborg
node tools/render.mjs kopf /tmp/x.png "ids=katze&mode=full&show=440&px=600&cols=2&with=augen=kuller;arme=mensch;beine=mensch&skin=plastik&color=9&shape=bohne"
```
PNG mit dem Read-Tool ansehen. JSON-Ausgabe: `errors` und `console` müssen leer sein (die 404 von favicon ignorieren).
Jedes Teil ansehen, schwache nachbessern, bis alle wirklich gut aussehen.
