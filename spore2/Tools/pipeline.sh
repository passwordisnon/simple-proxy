#!/bin/bash
# One command from your Spore files to assets in the Unreal project:
#
#   bash ~/spore2-work/spore2/Tools/pipeline.sh
#
# Steps (all on by default, each skips work that is already done):
#   build     compile spore2-scan
#   export    every model (.rw4 and .gmdl) in the game, the expansions and your mods -> .obj
#             with textures (~/SporeData/pipeline/obj)
#   assemble  every saved/downloaded creation (.crt .bld .vcl .ufo) -> one .obj each
#             (~/SporeData/pipeline/creations)
#   blender   Blender, without its window, cleans each .obj and writes an Unreal-ready .fbx with
#             embedded textures (~/SporeData/pipeline/fbx); several Blender processes in parallel.
#             Installs Blender with Homebrew if it is missing.
#   unreal    Unreal, without its window, imports every new .fbx into /Game/Spore of the Spore2
#             project (enables the Python Editor Script Plugin in the .uproject first; a backup
#             of the .uproject is kept). Close the Unreal editor before this step.
#
# Options:
#   --only STEP[,STEP]   run only these steps, e.g. --only blender,unreal
#   --skip STEP[,STEP]   leave these steps out, e.g. --skip unreal
#   --groups G1,G2       export only these groups, e.g. --groups editor_rigblocks~,vehiclesModelsVCL~
#   --creations DIR      where saved creations are (default ~/SporeData/pollination); "none" skips
#   --jobs N             parallel Blender/assembly processes (default: performance cores)
#   --force              redo every step's output instead of skipping finished files
#
# Paths can be changed with environment variables: SPORE_DATA (~/SporeData), WORK
# (~/SporeData/pipeline), BLENDER (Blender binary), UE_ROOT (/Volumes/Macintosh SD/UE_5.8),
# UPROJECT (~/Documents/Unreal Projects/Spore2/Spore2.uproject).
# A summary is written to ~/SporeData/pipeline/report.txt; logs are in ~/SporeData/pipeline/logs.

HERE="$(cd "$(dirname "$0")" && pwd)"
SPORE_DATA="${SPORE_DATA:-$HOME/SporeData}"
WORK="${WORK:-$SPORE_DATA/pipeline}"
NAMES="$SPORE_DATA/names"
UE_ROOT="${UE_ROOT:-/Volumes/Macintosh SD/UE_5.8}"
UPROJECT="${UPROJECT:-$HOME/Documents/Unreal Projects/Spore2/Spore2.uproject}"
CREATIONS="$SPORE_DATA/pollination"
GROUP_LIST=""
STEPS="build,export,assemble,blender,unreal"
SKIP=""
FORCE=0
JOBS="$(sysctl -n hw.perflevel0.physicalcpu 2>/dev/null || nproc 2>/dev/null || echo 4)"
while [ $# -gt 0 ]; do
	case "$1" in
		--only) STEPS="$2"; shift ;;
		--skip) SKIP="$2"; shift ;;
		--groups) GROUP_LIST="$2"; shift ;;
		--creations) CREATIONS="$2"; shift ;;
		--jobs) JOBS="$2"; shift ;;
		--force) FORCE=1 ;;
		-h|--help) sed -n '2,32p' "$0"; exit 0 ;;
		*) echo "unknown option $1 (see --help)"; exit 2 ;;
	esac
	shift
done
wants() { case ",$STEPS," in *",$1,"*) case ",$SKIP," in *",$1,"*) return 1 ;; esac; return 0 ;; esac; return 1; }

SCAN="$HERE/build/spore2-scan"
LOGS="$WORK/logs"
REPORT="$WORK/report.txt"
mkdir -p "$LOGS"
: > "$REPORT"
note() { echo "$*"; echo "$*" >> "$REPORT"; }

# Game data first, then expansions, then mods (later packages override earlier ones).
ROOTS=()
for DIR in "$SPORE_DATA/Base" "$SPORE_DATA/CreepyCute" "$SPORE_DATA/GalacticAdventures" "$HOME/Documents/My Spore Creations/Mods"; do
	[ -d "$DIR" ] && ROOTS+=("$DIR")
done
if [ ${#ROOTS[@]} -eq 0 ]; then
	echo "No Spore data found under $SPORE_DATA (see spore2/HANDOVER.md)."; exit 1
fi
NAME_ARGS=()
[ -f "$NAMES/reg_file.txt" ] && NAME_ARGS=(--names "$NAMES")
note "== Spore -> Unreal pipeline ($(date '+%Y-%m-%d %H:%M')), data: ${ROOTS[*]}"

if wants build; then
	note "== build"
	if ! { cmake -S "$HERE" -B "$HERE/build" > "$LOGS/build.log" 2>&1 && cmake --build "$HERE/build" -j "$JOBS" >> "$LOGS/build.log" 2>&1; }; then
		note "BUILD FAILED - see $LOGS/build.log"; exit 1
	fi
fi

if wants export; then
	note "== export models"
	[ "$FORCE" = 1 ] && rm -rf "$WORK/obj"
	GROUP_ARGS=()
	[ -n "$GROUP_LIST" ] && GROUP_ARGS=(--groups "$GROUP_LIST")
	"$SCAN" --models --textures "${NAME_ARGS[@]}" --extract "$WORK/obj" --derived-only --type rw4,gmdl "${GROUP_ARGS[@]}" "${ROOTS[@]}" > "$LOGS/export.log" 2>&1
	grep -E "meshes:|baked models:" "$LOGS/export.log" | tee -a "$REPORT"
	note "  $(find "$WORK/obj" -name '*.obj' 2>/dev/null | wc -l | tr -d ' ') .obj files in $WORK/obj"
fi

if wants assemble && [ "$CREATIONS" != "none" ] && [ -d "$CREATIONS" ]; then
	note "== assemble creations from $CREATIONS"
	mkdir -p "$WORK/creations"
	export SCAN WORK FORCE
	export NAME_ARG="${NAME_ARGS[*]}"
	export ROOT_LIST="$(printf '%s\n' "${ROOTS[@]}")"
	find "$CREATIONS" -type f \( -name '*.crt' -o -name '*.bld' -o -name '*.vcl' -o -name '*.ufo' \) -print0 |
		xargs -0 -P "$JOBS" -I{} bash -c '
			F="$1"; STEM="$(basename "${F%.*}")"
			[ "$FORCE" != 1 ] && [ -f "$WORK/creations/$STEM/$STEM.obj" ] && exit 0
			ROOTS=(); while IFS= read -r R; do ROOTS+=("$R"); done <<< "$ROOT_LIST"
			"$SCAN" --assemble "$F" $NAME_ARG --extract "$WORK/creations" "${ROOTS[@]}" > "$WORK/logs/assemble-$STEM.log" 2>&1 || true
		' _ {}
	BUILT=$(find "$WORK/creations" -name '*.obj' | wc -l | tr -d ' ')
	note "  $BUILT creations assembled (logs: $LOGS/assemble-*.log)"
fi

if wants blender; then
	note "== blender"
	if [ -z "${BLENDER:-}" ]; then
		for CANDIDATE in "$(command -v blender 2>/dev/null)" /Applications/Blender.app/Contents/MacOS/Blender; do
			[ -n "$CANDIDATE" ] && [ -x "$CANDIDATE" ] && BLENDER="$CANDIDATE" && break
		done
	fi
	if [ -z "${BLENDER:-}" ] && command -v brew > /dev/null; then
		note "  Blender not found - installing it with Homebrew (brew install --cask blender)"
		brew install --cask blender > "$LOGS/blender-install.log" 2>&1
		[ -x /Applications/Blender.app/Contents/MacOS/Blender ] && BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
	fi
	if [ -z "${BLENDER:-}" ]; then
		note "  Blender not found. Install it from blender.org or set BLENDER=/path/to/Blender."
	else
		FORCE_ARG=()
		[ "$FORCE" = 1 ] && FORCE_ARG=(--force)
		rm -f "$WORK"/fbx/manifest-*.json
		# Parts keep their own origin (assembly places them by it); whole creations sit on the ground.
		for SET in "obj:keep" "creations:bottom"; do
			IN="$WORK/${SET%%:*}"; ORIGIN="${SET##*:}"
			[ -d "$IN" ] || continue
			I=0
			while [ "$I" -lt "$JOBS" ]; do
				"$BLENDER" -b --factory-startup -P "$HERE/blender/spore_to_unreal.py" -- \
					--out "$WORK/fbx" --origin "$ORIGIN" --shard "$I/$JOBS" "${FORCE_ARG[@]}" "$IN" \
					> "$LOGS/blender-${SET%%:*}-$I.log" 2>&1 &
				I=$((I + 1))
			done
			wait
			python3 - "$WORK/fbx" "${SET%%:*}" <<'EOF' | tee -a "$REPORT"
import glob, json, os, sys
converted = up_to_date = 0
failed = []
for path in glob.glob(os.path.join(sys.argv[1], "manifest-*.json")):
    m = json.load(open(path))
    converted += len(m["converted"]); up_to_date += m["skipped_up_to_date"]; failed += m["failed"]
    os.rename(path, path.replace("manifest-", "done-" + sys.argv[2] + "-"))
print(f"  {sys.argv[2]}: {converted} converted, {up_to_date} already up to date, {len(failed)} failed")
reasons = {}
for f in failed:
    reasons[f["error"]] = reasons.get(f["error"], 0) + 1
for reason, count in sorted(reasons.items(), key=lambda r: -r[1])[:5]:
    print(f"    ! {count} x {reason}")
EOF
		done
	fi
fi

if wants unreal; then
	note "== unreal"
	UE_BIN=""
	for CANDIDATE in "$UE_ROOT/Engine/Binaries/Mac/UnrealEditor-Cmd" "$UE_ROOT/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor"; do
		[ -x "$CANDIDATE" ] && UE_BIN="$CANDIDATE" && break
	done
	if [ -z "$UE_BIN" ] || [ ! -f "$UPROJECT" ]; then
		note "  Unreal ($UE_ROOT) or the project ($UPROJECT) not found - set UE_ROOT / UPROJECT."
	elif pgrep -x UnrealEditor > /dev/null; then
		note "  The Unreal editor is open - close it and run: bash $0 --only unreal"
	elif [ ! -d "$WORK/fbx" ]; then
		note "  Nothing to import yet (run the blender step first)."
	else
		# The import script needs the Python Editor Script Plugin; switch it on in the .uproject.
		python3 - "$UPROJECT" <<'EOF' | tee -a "$REPORT"
import json, shutil, sys
path = sys.argv[1]
project = json.load(open(path))
plugins = project.setdefault("Plugins", [])
entry = next((p for p in plugins if p.get("Name") == "PythonScriptPlugin"), None)
if entry and entry.get("Enabled"):
    sys.exit(0)
shutil.copy(path, path + ".bak")
if entry:
    entry["Enabled"] = True
else:
    plugins.append({"Name": "PythonScriptPlugin", "Enabled": True})
json.dump(project, open(path, "w"), indent="\t")
print(f"  enabled the Python Editor Script Plugin in {path} (backup: {path}.bak)")
EOF
		rm -f "$WORK/fbx/unreal-import.json"
		SPORE_FBX_DIR="$WORK/fbx" SPORE_UE_DEST="/Game/Spore" SPORE_UE_FORCE="$FORCE" \
			"$UE_BIN" "$UPROJECT" -run=pythonscript -script="$HERE/unreal/import_spore_fbx.py" \
			-unattended -nosplash -nop4 -stdout > "$LOGS/unreal.log" 2>&1
		if [ -f "$WORK/fbx/unreal-import.json" ]; then
			python3 -c "import json,sys; s=json.load(open(sys.argv[1])); print(f\"  imported {s['imported']} into {s['destination']}, {s['already_present']} already there, {len(s['failed'])} failed\")" "$WORK/fbx/unreal-import.json" | tee -a "$REPORT"
		else
			note "  Unreal did not finish the import - see $LOGS/unreal.log"
		fi
	fi
fi

note "== done. Summary: $REPORT"
