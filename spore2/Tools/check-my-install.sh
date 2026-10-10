#!/bin/bash
# Runs every spore2 check against your local Spore data and writes one report.
#
#   bash ~/spore2-work/spore2/Tools/check-my-install.sh [DATA_DIR] [CARD.png ...]
#
# DATA_DIR defaults to ~/SporeData/Base (the copied game Data folder). Any creation PNGs
# given after it are decoded and assembled too. The report is saved to
# ~/SporeData/spore2-report.txt and, on macOS, copied to the clipboard.

DATA_DIR="${1:-$HOME/SporeData/Base}"
shift 2>/dev/null
CARDS=("$@")
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TOOLS="$REPO/spore2/Tools"
NAMES="$HOME/SporeData/names"
OUT="$HOME/SporeData/check"
REPORT="$HOME/SporeData/spore2-report.txt"

mkdir -p "$HOME/SporeData" "$OUT"

section() { echo; echo "===== $1 ====="; }

run_checks() {
section "versions"
date
sw_vers 2>/dev/null | tr '\n' ' '; echo
git -C "$REPO" pull --quiet && git -C "$REPO" log --oneline -1

section "build"
cmake -S "$TOOLS" -B "$TOOLS/build" > /dev/null && cmake --build "$TOOLS/build" 2>&1 | grep -E "error|warning|Built target spore2" || echo "BUILD FAILED"
SCAN="$TOOLS/build/spore2-scan"
"$TOOLS/build/spore2-tests"

if [ ! -f "$NAMES/reg_file.txt" ]; then
	section "downloading SporeModder-FX name lists"
	mkdir -p "$NAMES"
	for f in reg_file reg_type reg_property; do
		curl -sSL -o "$NAMES/$f.txt" "https://raw.githubusercontent.com/emd4600/SporeModder-FX/master/$f.txt"
	done
	ls -l "$NAMES"
fi

if [ ! -d "$DATA_DIR" ]; then
	section "data"
	echo "DATA_DIR $DATA_DIR not found - pass the folder holding the .package files"
else
	section "packages and property files"
	"$SCAN" --props --names "$NAMES" "$DATA_DIR" | sed -n '/Summary/,$p'

	section "textures"
	rm -rf "$OUT/textures"
	"$SCAN" --textures --names "$NAMES" --extract "$OUT/textures" --type raster "$DATA_DIR" | sed -n '/Summary/,$p'

	section "models, materials and rw4 textures (takes a few minutes)"
	rm -rf "$OUT/models"
	"$SCAN" --models --textures --names "$NAMES" --extract "$OUT/models" --type rw4 "$DATA_DIR" | sed -n '/Summary/,$p'
fi

for CARD in "${CARDS[@]}"; do
	section "creation card: $CARD"
	"$SCAN" --png --names "$NAMES" "$CARD" | grep -E "png |metadata"
	if [ -d "$DATA_DIR" ]; then
		"$SCAN" --assemble "$CARD" --names "$NAMES" --extract "$OUT/assembled" "$DATA_DIR" | tail -15
	fi
done

section "done"
}

run_checks 2>&1 | tee "$REPORT"
echo "Report: $REPORT"
echo "Exported files to look at: $OUT (textures/, models/, assembled/)"
if command -v pbcopy > /dev/null; then
	pbcopy < "$REPORT"
	echo "The report is in your clipboard - paste it into the chat."
fi
