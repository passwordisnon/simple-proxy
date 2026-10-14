#!/bin/bash
# Downloads GitHub-hosted Spore mods to this Mac and unpacks them into Spore's mod folder,
# which the Unreal plugin mounts after the game data.
#
#   bash ~/spore2-work/spore2/Tools/fetch-mods.sh            # the curated list in mods.txt
#   bash ~/spore2-work/spore2/Tools/fetch-mods.sh --discover # plus every repo tagged as a Spore mod
#   bash ~/spore2-work/spore2/Tools/fetch-mods.sh --list FILE # owner/repo lines from another file
#
# --discover runs the same GitHub search the Spore Community ModBrowser uses (topics spore-mod
# and sporemod). For each repo the latest release's assets are downloaded ("all" after a repo in
# mods.txt takes every release); repos without releases are downloaded as a whole and their
# .package/.sporemod files kept. Repos that only contain .dll files are Spore ModAPI code mods:
# their code cannot run in Unreal, so they are listed and removed again. Mods with both keep
# their .package data.

HERE="$(cd "$(dirname "$0")" && pwd)"
LIST="$HERE/mods.txt"
DISCOVER=0
while [ $# -gt 0 ]; do
	case "$1" in
		--discover) DISCOVER=1 ;;
		--list) LIST="$2"; shift ;;
	esac
	shift
done
DOWNLOADS="$HOME/Downloads/spore-mods"
MODS="$HOME/Documents/My Spore Creations/Mods"
SCAN="$HERE/build/spore2-scan"
REPORT="$DOWNLOADS/report.txt"
WORKLIST="$DOWNLOADS/repos.txt"
mkdir -p "$DOWNLOADS" "$MODS"
: > "$REPORT"

# Curated list first (keeps its "all" markers), then discovered repos not already listed.
grep -v '^\s*#' "$LIST" | grep -v '^\s*$' > "$WORKLIST"
if [ "$DISCOVER" = 1 ]; then
	echo "== searching GitHub for Spore mods"
	for TOPIC in spore-mod sporemod; do
		for PAGE in 1 2 3; do
			curl -fsSL "https://api.github.com/search/repositories?q=topic:$TOPIC&per_page=100&page=$PAGE" 2>/dev/null \
				| grep -o '"full_name": *"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/'
			sleep 2 # unauthenticated search allows 10 requests a minute
		done
	done | sort -u | while read -r FOUND; do
		grep -qi "^$FOUND\( \|$\)" "$WORKLIST" || echo "$FOUND" >> "$WORKLIST"
	done
	echo "   $(wc -l < "$WORKLIST" | tr -d ' ') repositories to check"
fi

# Asset links of a release page, via github.com pages (not the rate-limited API).
release_assets() { # REPO TAG
	curl -fsSL "https://github.com/$1/releases/expanded_assets/$2" 2>/dev/null \
		| grep -o 'href="/[^"]*/releases/download/[^"]*"' | sed 's/^href="/https:\/\/github.com/; s/"$//'
}

while read -r REPO MODE; do
	NAME="${REPO#*/}"
	# Only plain owner/name entries; anything else could make TARGET point at the mod folder itself.
	case "$REPO" in
		*/*/*|/*|*/) echo "== skipping malformed entry '$REPO'"; continue ;;
		*/*) ;;
		*) echo "== skipping malformed entry '$REPO'"; continue ;;
	esac
	[ -n "$NAME" ] || continue
	TARGET="$MODS/$NAME"
	echo "== $REPO"
	URLS=""
	if [ "$MODE" = "all" ]; then
		TAGS=$(curl -fsSL "https://github.com/$REPO/tags" 2>/dev/null | grep -o "href=\"/$REPO/releases/tag/[^\"]*\"" | sed 's/.*\/tag\///; s/"$//' | sort -u)
		for TAG in $TAGS; do URLS="$URLS $(release_assets "$REPO" "$TAG")"; done
	else
		LATEST=$(curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/$REPO/releases/latest" 2>/dev/null)
		case "$LATEST" in
			*/releases/tag/*) URLS=$(release_assets "$REPO" "${LATEST##*/tag/}") ;;
		esac
	fi
	URLS=$(echo $URLS | tr ' ' '\n' | grep -v '^$' | sort -u)
	if [ -z "$URLS" ]; then
		echo "   no release - taking the repository files"
		URLS="https://codeload.github.com/$REPO/zip/HEAD"
	fi
	rm -rf "$TARGET" && mkdir -p "$TARGET"
	for URL in $URLS; do
		FILE="$DOWNLOADS/$NAME-$(basename "$URL")"
		if ! curl -fsSL -o "$FILE" "$URL"; then
			echo "   download failed: $URL"
			continue
		fi
		case "$URL" in
			*.package) cp "$FILE" "$TARGET/" ;;
			*.dll) cp "$FILE" "$TARGET/" ;;
			*.sporemod|*.zip|*/zip/HEAD)
				TMP="$DOWNLOADS/tmp-$NAME"
				rm -rf "$TMP" && mkdir -p "$TMP"
				unzip -oq "$FILE" -d "$TMP" 2>/dev/null
				# .sporemod files inside a zip are zips themselves.
				find "$TMP" -name '*.sporemod' | while read -r INNER; do unzip -oq "$INNER" -d "$TMP/$(basename "$INNER" .sporemod)" 2>/dev/null; done
				find "$TMP" \( -name '*.package' -o -name '*.dll' -o -name 'ModInfo.xml' \) -exec cp {} "$TARGET/" \;
				rm -rf "$TMP"
				;;
		esac
		rm -f "$FILE"
	done
	PACKAGES=$(find "$TARGET" -name '*.package' | wc -l | tr -d ' ')
	DLLS=$(find "$TARGET" -name '*.dll' | wc -l | tr -d ' ')
	if [ "$PACKAGES" -gt 0 ] && [ "$DLLS" -gt 0 ]; then
		echo "   $PACKAGES package(s) + $DLLS dll(s): mixed - data kept, code will not run in Unreal"
		echo "mixed	$REPO	$PACKAGES" >> "$REPORT"
	elif [ "$PACKAGES" -gt 0 ]; then
		echo "   $PACKAGES package(s): data mod, usable"
		echo "data	$REPO	$PACKAGES" >> "$REPORT"
	elif [ "$DLLS" -gt 0 ]; then
		echo "   code-only ModAPI mod - removed"
		echo "code	$REPO	0" >> "$REPORT"
		rm -rf "$TARGET"
	else
		echo "   nothing usable found"
		echo "empty	$REPO	0" >> "$REPORT"
		rm -rf "$TARGET"
	fi
done < "$WORKLIST"

echo
echo "== summary"
for KIND in data mixed code empty; do
	printf "   %-6s %s\n" "$KIND" "$(grep -c "^$KIND	" "$REPORT")"
done
if [ -x "$SCAN" ]; then
	echo
	echo "== reading every mod package"
	"$SCAN" --verify --names "$HOME/SporeData/names" "$MODS" | grep -E 'FAIL|packages read|decode failures|index entries'
fi
echo
echo "Mods: $MODS   Report: $REPORT"
