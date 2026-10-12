# Cyborg-Labor als eigenes Spiel mit Mehrspieler-Modus

Das Spiel läuft auf jedem PC selbst, im Browser oder als installierte App. Die PCs verbinden sich direkt miteinander über das Internet. Es gibt keinen Spiel-Server, den jemand betreiben oder bezahlen muss.

## So funktioniert es

1. Jeder PC lädt das Spiel einmal von einer Webadresse (zum Beispiel GitHub Pages). Danach liegt es auf dem PC und startet auch ohne Internet.
2. Für den Mehrspieler-Modus suchen sich die PCs über öffentliche Vermittler (Nostr-Relays). Das ist nur das erste Hallo, verschlüsselt mit dem Mehrspieler-Code.
3. Danach gehen alle Spieldaten (Position, Aussehen, Chat, Emotes, Rennen) direkt von PC zu PC (WebRTC, wie bei Videoanrufen).
4. Wer denselben Mehrspieler-Code eingibt, ist in derselben Welt. Andere finden euch ohne den Code nicht.

In claude.ai läuft das Spiel wie bisher über die eingebaute Live-Verbindung. Der Code und die App-Installation gibt es nur in der eigenen Version.

## Einmal einrichten (GitHub Pages, kostenlos)

1. Im Repository auf GitHub: **Settings → Pages → Source: GitHub Actions** wählen.
2. **Actions → "Cyborg-Labor auf GitHub Pages" → Run workflow**.
3. Nach ein bis zwei Minuten steht die Adresse im Workflow, zum Beispiel `https://NAME.github.io/simple-proxy/`.

Jeder andere Webspeicher geht auch: Inhalt von `cyborg-labor/` hochladen (ohne `tools/`, `old/`, `docs/`). Wichtig ist nur `https://` (für die App-Installation) und dass die Dateien als UTF-8 ausgeliefert werden.

Die Datei `index.html` direkt vom Desktop öffnen (`file://`) geht nicht, weil Browser dort keine Modelle nachladen.

## Auf den PCs

1. Adresse öffnen.
2. **Menü → Einstellungen → Als App auf diesem PC installieren** (Chrome, Edge). Danach startet Cyborg-Labor wie ein normales Programm.
3. In den Einstellungen den **Mehrspieler-Code** eingeben, für die ganze Klasse derselbe, zum Beispiel `klasse-5b-tiger`.

Ohne eigenen Code sind alle im offenen Raum `offen`. Für eine Klasse lieber einen eigenen Code nehmen.

## Grenzen, ehrlich

- **Internet nötig** für den Mehrspieler-Modus. Allein spielen geht auch offline (nach dem ersten Laden).
- **Schul-Netzwerke** sperren manchmal direkte Verbindungen oder die Vermittler. Dann sieht man nur die KI-Mitspielenden. Abhilfe: einen TURN-Server eintragen lassen (Informatik-Verantwortliche), oder im Heimnetz spielen.
- **Gruppengrösse:** Jeder PC verbindet sich mit jedem anderen. Bis etwa 15 Leute pro Code läuft das flüssig, bei einer ganzen Klasse auf langsamen PCs besser zwei Codes verwenden.
- **Internet-Adresse:** Wie bei Videoanrufen sehen verbundene PCs gegenseitig ihre Internet-Adresse. Darum nur mit Leuten spielen, die man kennt (eigener Code).
- **Chat** ist freier Text, wie bisher. Es gibt keine Moderation durch einen Server.
- **Spielstände** liegen nur im Browser des jeweiligen PCs. Browserdaten löschen löscht auch den Spielstand. Die Cyborgs selbst lassen sich als Codes sichern (Menü → Welt sichern).

## Technik

- `js/net.js`: liefert dieselbe Schnittstelle wie die room-Fähigkeit von claude.ai (`presence`, `onPeers`, `peers`, `onConnection`, `join`, `leave`), darum laufen `social.js` und `race.js` auf beiden Wegen.
- `js/vendor/trystero-nostr.js`: Trystero 0.26 (MIT) mit @noble/secp256k1 (MIT), lokal gebündelt. Lizenzen liegen daneben.
- `sw.js`, `manifest.webmanifest`, `js/pwa.js`, `icons/`: App-Installation und Offline-Speicher. Der Service Worker speichert beim Installieren alle Skripte (gut 4 MB), Modelle und Musik beim ersten Gebrauch.
- `tools/mp-test.mjs`: startet zwei getrennte Browser mit demselben Code und prüft, ob sie sich sehen.
