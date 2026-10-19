#!/bin/bash
# Downloads Spore mods from a list of links you collected while browsing (DavoOnline topics,
# ModDB, Nexus, ...), unpacks them into Spore's mod folder and checks them.
#
#   bash ~/spore2-work/spore2/Tools/fetch-links.sh [LINKS_FILE]   (default ~/Downloads/davo-links.txt)
#
# One link per line, # for comments. Handled automatically:
#   github.com/owner/repo                -> via fetch-mods.sh (latest release or repo files)
#   direct links to .package/.sporemod/.zip files (incl. GitHub release assets)
#   drive.google.com/file/d/<id>/...     -> Google Drive direct download
#   mediafire.com/file/...               -> MediaFire direct download link from the page
# Anything else (sites that need a click or a login) is listed at the end to open by hand;
# save those files into ~/Downloads/spore-mods/manual and run this script again.

HERE="$(cd "$(dirname "$0")" && pwd)"
LINKS="${1:-$HOME/Downloads/davo-links.txt}"
INBOX="$HOME/Downloads/spore-mods/links"
MANUAL="$HOME/Downloads/spore-mods/manual"
MODS="$HOME/Documents/My Spore Creations/Mods/collected"
SCAN="$HERE/build/spore2-scan"
REPOS="$HOME/Downloads/spore-mods/link-repos.txt"
mkdir -p "$INBOX" "$MANUAL" "$MODS"
: > "$REPOS"
OPEN_BY_HAND=""

if [ ! -f "$LINKS" ]; then
	echo "No link list at $LINKS - put one link per line in it (or pass another file)."
	exit 1
fi

fetch() { # URL [FILENAME]
	local NAME="${2:-$(basename "${1%%\?*}")}"
	if curl -fsSL -A "Mozilla/5.0" -o "$INBOX/$NAME" "$1"; then
		echo "   saved $NAME"
	else
		echo "   download failed"
		rm -f "$INBOX/$NAME"
		OPEN_BY_HAND="$OPEN_BY_HAND\n  $1"
	fi
}

while read -r URL; do
	case "$URL" in ''|\#*) continue ;; esac
	echo "== $URL"
	case "$URL" in
		*github.com/*/releases/download/*|*.package|*.sporemod|*.zip|*.package\?*|*.sporemod\?*|*.zip\?*)
			fetch "$URL" ;;
		*github.com/*)
			REPO=$(echo "$URL" | sed -E 's#^(https?://)?(www\.)?github\.com/([^/]+/[^/#?]+).*#\3#')
			echo "$REPO" >> "$REPOS"
			echo "   queued GitHub repo $REPO" ;;
		*drive.google.com/file/d/*)
			ID=$(echo "$URL" | sed -E 's#.*/file/d/([^/?]+).*#\1#')
			fetch "https://drive.usercontent.google.com/download?id=$ID&export=download&confirm=t" "gdrive-$ID" ;;
		*mediafire.com/file/*|*mediafire.com/\?*)
			DIRECT=$(curl -fsSL -A "Mozilla/5.0" "$URL" | grep -o 'href="https://download[^"]*mediafire\.com/[^"]*"' | head -1 | sed 's/^href="//; s/"$//')
			if [ -n "$DIRECT" ]; then fetch "$DIRECT"; else echo "   no direct link found"; OPEN_BY_HAND="$OPEN_BY_HAND\n  $URL"; fi ;;
		*)
			echo "   needs a browser - open by hand"
			OPEN_BY_HAND="$OPEN_BY_HAND\n  $URL" ;;
	esac
done < "$LINKS"

[ -s "$REPOS" ] && bash "$HERE/fetch-mods.sh" --list "$REPOS"

echo
echo "== unpacking downloads into $MODS"
for FILE in "$INBOX"/* "$MANUAL"/*; do
	[ -f "$FILE" ] || continue
	BASE=$(basename "$FILE"); NAME="${BASE%.*}"
	if unzip -tq "$FILE" >/dev/null 2>&1; then
		TMP="$INBOX/.tmp"; rm -rf "$TMP"; mkdir -p "$TMP"
		unzip -oq "$FILE" -d "$TMP"
		find "$TMP" -name '*.sporemod' | while read -r INNER; do unzip -oq "$INNER" -d "$TMP/$(basename "$INNER" .sporemod)" 2>/dev/null; done
		mkdir -p "$MODS/$NAME"
		find "$TMP" \( -name '*.package' -o -name '*.dll' -o -name 'ModInfo.xml' \) -exec cp {} "$MODS/$NAME/" \;
		rm -rf "$TMP"
	elif [ "$(head -c 4 "$FILE")" = "DBPF" ] || [ "$(head -c 4 "$FILE")" = "DBBF" ]; then
		mkdir -p "$MODS/$NAME"; cp "$FILE" "$MODS/$NAME/${BASE%.package}.package"
	else
		echo "   $BASE is not a zip/.sporemod/.package (maybe .rar/.7z or a web page) - unpack it by hand"
		continue
	fi
	P=$(find "$MODS/$NAME" -name '*.package' | wc -l | tr -d ' ')
	D=$(find "$MODS/$NAME" -name '*.dll' | wc -l | tr -d ' ')
	echo "   $NAME: $P package(s), $D dll(s)"
done

if [ -x "$SCAN" ]; then
	echo
	echo "== reading the collected packages"
	"$SCAN" --verify --names "$HOME/SporeData/names" "$MODS" | grep -E 'FAIL|packages read|decode failures|index entries'
fi
if [ -n "$OPEN_BY_HAND" ]; then
	echo
	echo "Open these by hand, save the files into $MANUAL, then run this script again:"
	printf "$OPEN_BY_HAND\n"
fi
