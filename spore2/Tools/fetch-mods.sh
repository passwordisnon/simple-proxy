#!/bin/bash
# Downloads the GitHub-hosted Spore mods listed in mods.txt to this Mac and unpacks them into
# Spore's mod folder, which the Unreal plugin mounts after the game data.
#
#   bash ~/spore2-work/spore2/Tools/fetch-mods.sh [LIST]
#
# For each owner/repo it takes the latest release's assets; repos without releases are
# downloaded as a whole and their .package/.sporemod files are kept. Mods that ship .dll files
# are Spore ModAPI code mods: they are reported, because their code cannot run in Unreal.

LIST="${1:-$(cd "$(dirname "$0")" && pwd)/mods.txt}"
DOWNLOADS="$HOME/Downloads/spore-mods"
MODS="$HOME/Documents/My Spore Creations/Mods"
SCAN="$(cd "$(dirname "$0")" && pwd)/build/spore2-scan"
mkdir -p "$DOWNLOADS" "$MODS"

grep -v '^\s*#' "$LIST" | grep -v '^\s*$' | while read -r REPO; do
	NAME="${REPO#*/}"
	TARGET="$MODS/$NAME"
	echo "== $REPO"
	URLS=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null \
		| grep -o '"browser_download_url": *"[^"]*"' | sed 's/.*"\(https[^"]*\)"$/\1/')
	if [ -z "$URLS" ]; then
		echo "   no release - taking the repository files"
		URLS="https://codeload.github.com/$REPO/zip/HEAD"
	fi
	mkdir -p "$TARGET"
	for URL in $URLS; do
		FILE="$DOWNLOADS/$NAME-$(basename "$URL")"
		if ! curl -fsSL -o "$FILE" "$URL"; then
			echo "   download failed: $URL"
			continue
		fi
		case "$URL" in
			*.package) cp "$FILE" "$TARGET/" ;;
			*.sporemod|*.zip|*/zip/HEAD)
				TMP="$DOWNLOADS/tmp-$NAME"
				rm -rf "$TMP" && mkdir -p "$TMP"
				unzip -oq "$FILE" -d "$TMP"
				# .sporemod files inside a zip are zips themselves.
				find "$TMP" -name '*.sporemod' | while read -r INNER; do unzip -oq "$INNER" -d "$TMP/$(basename "$INNER" .sporemod)"; done
				find "$TMP" \( -name '*.package' -o -name '*.dll' -o -name 'ModInfo.xml' \) -exec cp {} "$TARGET/" \;
				rm -rf "$TMP"
				;;
			*) echo "   kept $(basename "$URL") in $DOWNLOADS (unknown type)" ;;
		esac
	done
	PACKAGES=$(find "$TARGET" -name '*.package' | wc -l | tr -d ' ')
	DLLS=$(find "$TARGET" -name '*.dll' | wc -l | tr -d ' ')
	if [ "$DLLS" -gt 0 ]; then
		echo "   $PACKAGES package(s), $DLLS dll(s): ModAPI code mod - only its data will load in Unreal"
	elif [ "$PACKAGES" -gt 0 ]; then
		echo "   $PACKAGES package(s): data mod, usable"
	else
		echo "   nothing usable found"
		rmdir "$TARGET" 2>/dev/null
	fi
done

if [ -x "$SCAN" ]; then
	echo
	echo "== reading every mod package"
	"$SCAN" --verify --names "$HOME/SporeData/names" "$MODS" | grep -E 'ok |FAIL|Summary|packages read|decode failures'
fi
echo
echo "Mods are in: $MODS (Unreal: spore.Mount loads them after the game data)"
