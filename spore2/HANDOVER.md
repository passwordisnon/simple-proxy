# Spore 2.0 – project history and handover

Read this together with `CLAUDE.md` (rules and confirmed file-format facts) and `README.md`
(status table and commands). This file covers what those don't: how we got here, what the
user's machine looks like, what is still open, and how to work with the user. It was written
from a long cloud Claude Code session (Oct 2026) for the user's local Claude Code.

## The goal

The user (Anton) owns Spore, Creepy & Cute and Galactic Adventures and wants a private,
non-commercial "Spore 2.0" in Unreal Engine 5 that reads their own installed game files and mods
directly: parts, creatures, buildings, vehicles, planets. Long term: restored cut stages (a
9-stage loop including the cut aquatic stage), AAA visuals (weather, fur), and the Dark Injection
idea (Darkspore war parts re-made to fit Spore's style and tied into Galactic Adventures, e.g. as
adventure equipment). The user mostly says "go on" and expects steady progress; explain results in
plain language and give copy-paste commands when the user has to do something.

Before this project the user had another chatbot produce "hive command" prompts full of made-up
facts (fake links, wrong file layouts, simulated code). That is why `CLAUDE.md` insists on
SporeModder-FX as the reference and on never presenting placeholder data as real.

## Hard rules (do not break)

- Never commit game data: `.package` files, extracted resources, creation PNGs, rendered previews
  of game assets. `.gitignore` covers the usual paths.
- Never commit SporeModder-FX `reg_*.txt` name lists (GPL). They are loaded at runtime from
  `~/SporeData/names`.
- Never copy GPL code from SporeModder-FX; read it to learn layouts and write our own code, with a
  comment naming the SMFX class it follows.
- DavoOnline (davoonline.com, including its /sporemodder pages): its robots.txt blocks ClaudeBot,
  so do not fetch or crawl it. The user once pasted their DavoOnline login in chat: never use it,
  and remind them to change that password if it comes up. Links the user collects by hand go
  through `Tools/fetch-links.sh`.
- Reddit and Nexus Mods also block automated access; ask the user to paste text or download by hand.
- No model names in commits or pull requests.

## The user's machine

- MacBook (M4 Pro), macOS 27, Xcode 27, Homebrew, CMake. Unreal Engine 5.8.3 at
  `/Volumes/Macintosh SD/UE_5.8` (external SD card, for space). UE project:
  `/Users/fertighaus/Documents/Unreal Projects/Spore2`, with the plugin from this repo.
  UnrealClaude (github.com/Natfii/UnrealClaude) is installed in the editor, not tested yet.
- Repo checkout: `~/spore2-work` (branch `claude/spore-2-ue5-frontend-4730t5`,
  PR passwordisnon/simple-proxy#2). The scanner builds in `spore2/Tools/build`.
- Game discs (ISO images) on the SD card:
  - `/Volumes/Macintosh SD/Spore.2008.EA/Disc01/Disc01.iso` - base game; its `Spore/Data` was
    copied to `~/SporeData/Base/Data` (58 packages, 86,286 entries).
  - `.../Spore.Creepy.&.Cute.Parts.Pack.2008.EA/Disc01/Disc01.iso` - mounts as `/Volumes/SPORE`,
    holds `BoosterPack_01.package` at its root.
  - `.../Spore.Galactic.Adventures.Expansion.Pack.2009.EA/Disc01/Disc01.iso` - mounts as
    `/Volumes/SPORE 1` (name depends on mount order), holds `Spore/Data/Spore_EP1_*.package`.
  - Not yet copied: the expansions should go to `~/SporeData/CreepyCute` and
    `~/SporeData/GalacticAdventures`, which the UE plugin and scanner use by default.
- Other data: `~/SporeData/names` (SMFX reg files), `~/SporeData/pollination` (extracted
  `Pollination.package`: 684 downloaded creations, DBBF format), `~/SporeData/assembled`.
- Mods: `~/Documents/My Spore Creations/Mods` (where `fetch-mods.sh` puts them and the UE plugin
  reads them), work files in `~/Downloads/spore-mods`.

## Shell pitfalls the user ran into

- Paste only commands into zsh, not earlier output.
- `!` inside double quotes breaks zsh (`dquote>`); use single quotes.
- Paths with `&` or spaces need quotes; globs like `*.iso` must stay outside the quotes and fail
  when the files sit in subfolders - prefer `find ... -iname`.
- New terminal windows start in `~`; always `cd ~/spore2-work` first.
- Console commands `spore.*` only work while Play (PIE) runs, because the subsystem is a
  GameInstanceSubsystem; run `spore.Mount` again after each Play.

## What works (and how sure we are)

Confirmed on the user's real files:
- DBPF 2.0/3.0 and DBBF packages, RefPack, FNV names + registry names.
- `.prop`, `.raster`, all rw4 textures, all 7,388 rw4 meshes (incl. blend-shape base shapes),
  materials/texture slots, 2,756 skeletons with bind pose and per-vertex weights.
- Creation PNG decoding, saved creations (.crt etc. XML), pollen metadata.
- Assembly: a real creature assembles 47 of 47 parts. In UE (user screenshot, 14 Oct) that
  creature stands upright with the approximate body skin, untextured.
- UE plugin compiles with UE 5.8 + Xcode 27 and mounts the packages (`spore.Mount`).

Unit-tested only (not yet checked on real files): rw4 keyframe animations, `.gmdl` baked models
(Maxis-made vehicles/buildings/UFOs), the `--unused` reference report logic after its latest fix.

Approximations / assumptions to remember: the creature body skin (SporeSkin, tubes - Spore builds
the real skin at run time), the 100x unit scale in UE, part positions treated as absolute.

## Cut / unused content

`spore2-scan --unused [--render --groups ...]` lists `.prop`/`.rw4`/`.gmdl` files no other `.prop`
points at and draws them into `unused_previews/index.html`. First real run (base game only, before
the same-name fix): 11,615 of 22,243 files, mostly UI/config noise. Interesting finds:
`editor_rigblocks~` holds unused editor backgrounds (`ce_beach_ground_plane-scifi_background`,
`-doom_background`, `be_editor_background_night`, Sporepedia background), display pedestals
(`ce_dias_*`), sockets; `creature_editorModel~` / `vehiclesModelsVCL~` / `buildingModelsBLD~` /
`ufoModelsUFO~` hold Maxis-made creations; `StoryBookCrabl` (CreatureAbilities) and
`toolhappyray2/3` (spacetrading~) may be cut features. Earlier `--find` checks confirmed hidden
editor setups in Spore_Game.package (Cake editor, VehicleHarvester, FloraEditorSetup,
PlannerThumbnailGen). Re-run with the expansions included, since Galactic Adventures may use
files that look unused in the base game.

## Mods

- `Tools/mods.txt`: ~53 GitHub-hosted content mods (planets, parts, paints, cut-content
  restorations such as 0KepOnline's Cake Editor / Unused Planet Themes, Gemini-HUN's 2008 beta
  planets, A-xesey's Flora Editor reconstruction). `Tools/fetch-mods.sh [--discover]` downloads
  them (plus every GitHub repo tagged spore-mod/sporemod), unpacks `.sporemod`, removes code-only
  ModAPI mods (`.dll`, unusable in UE), writes a report and scans them.
- `Tools/fetch-links.sh`: downloads links the user collected by hand (one per line in
  `~/Downloads/davo-links.txt`): GitHub, Google Drive, MediaFire, direct files.
- Status: the user has run the earlier version; the latest `--discover` run and the hand-collected
  DavoOnline links are still to do.

## Open tasks, roughly in order

1. Copy the expansion packages (see machine section), re-run `--unused --render` with all three
   roots, and look at the vehicle/building/UFO previews now that `.gmdl` is read.
2. Run `spore2-scan --models` on the base game to confirm `.gmdl` decoding on real files
   (look for the "baked models" line).
3. Finish mod sourcing (`fetch-mods.sh --discover`, then `fetch-links.sh`) and check the report.
4. UE: textures/colours on assembled creations (creation paint data is parsed), auto-mount on
   Play, `.gmdl` models in UE, UE skeletal meshes from the decoded skeletons, creature
   `.animation` files (type 0xEE17C6AD, SMFX file/anim - not read yet).
5. `.gmdl` materials (needs SMFX ShaderData size table), `.sporemod` read directly.
6. Later: gameplay stages, Dark Injection rework, cut-content restoration in UE.

## How to work in this repo

- `git pull` before starting and before pushing - the cloud session and the local session both
  pushed to the same branch.
- Core code (`SporeCore/`) is engine-independent C++20; after every change run
  `cmake -S spore2/Tools -B spore2/Tools/build && cmake --build spore2/Tools/build && spore2/Tools/build/spore2-tests`.
- Every new decoder gets a synthetic unit test in `Tests/test_core.cpp`.
- UE changes: build the plugin and read the log; UE treats shadowed variables as errors.
- When a result can only be checked by eye (a model, a creature in UE), ask the user for a
  screenshot, or take one yourself now that you run on the Mac.
