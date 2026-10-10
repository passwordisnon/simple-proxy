# Spore 2.0 – Unreal Engine interop layer

A private, non-commercial compatibility layer that reads **your own installed copy of Spore**
(base game, Creepy & Cute, Galactic Adventures) and community mods, and makes the data
available inside Unreal Engine 5. No game files are included in or committed to this repo.

## What works today

| Piece | Status |
|---|---|
| DBPF 2.0 `.package` header and index parsing (shared-field flags, bounds checks) | done, unit-tested |
| RefPack/QFS decompression of package entries | done, unit-tested |
| Package integrity checks (duplicate keys, overlapping or out-of-range payloads) | done |
| Mod override tracking (same key in several packages, last mounted wins) | done |
| `.prop` property-file decoder (all 24 value types, arrays, localized text; layout from SporeModder-FX) | done, unit-tested |
| Textures: `.raster` and textures inside `.rw4` (DXT1/3/5, A8R8G8B8, R8G8B8, A8) → `.dds` / `.png` / UE `UTexture2D` | done, unit-tested |
| Hash → name lookup using SporeModder-FX's `reg_*.txt` files | done, unit-tested |
| PNG chunk reader (CRC check, `tEXt`/`zTXt`/`iTXt`, creation card shape check) | done, unit-tested |
| Scharr normal map + roughness estimate from legacy diffuse textures | done, unit-tested |
| `spore2-scan` command-line checker for your Mac | done |
| UE5 plugin: `USporeInteropSubsystem` (async mount, read/export, PNG inspect, normal map texture, `-state:` routing) | written, **not yet compiled against UE** |
| UE5 Slate package browser (category tabs, search, package list, resource table, export) | written, **not yet compiled against UE** |
| Models: `.rw4` meshes (positions, normals, UVs; lists and strips) → `.obj` / UE `ProceduralMeshComponent` | done, unit-tested |
| Skeletons, skinning, animations, blend shapes, materials | not started |
| Decoding the creature data inside creation PNGs | not started (see note below) |
| Gameplay stages, editors, procedural animation | not started |

**About creation PNGs:** Spore does not store creature data in `tEXt`/`zTXt` chunks. It hides
the data in the low bits of the image's pixels. The chunk reader is useful for checking cards,
but you need a separate pixel decoder to get the creature data out.

**About `-state:CellEditor`, `-state:CakeEditor`, `-state:PlannerThumbnailGen`:** these are
state names that exist in the original executable. Here they only choose which UI workspace
opens. The content of those unfinished editors has not been recovered.

## Step by step: what you need, when, and where

### Step 1 – Check that your files can be read (now, on your Mac)

You need Xcode Command Line Tools (`xcode-select --install`) and CMake (`brew install cmake`).

```sh
cd spore2/Tools
cmake -S . -B build
cmake --build build
./build/spore2-tests          # should print "all tests passed"
./build/spore2-scan --verify  # scans the three /Volumes/Macintosh SD/... folders
```

To scan other folders, pass them as arguments: `./build/spore2-scan --verify "/path/one" "/path/two"`.

What to look for:
- `ok   <name>.package ... decode failures: 0` for each package. That means the format reading is correct.
- `no .package files found` with a list of `.iso`, `.dmg`, `.exe`, `.cab` and so on means the folder holds an
  **installer or disc image**, not an installed game. Install Spore first, then scan the installed
  location. On the Mac version the packages are inside the app bundle (the scanner searches
  subfolders, so pointing it at `Spore.app` works).
- `overridden keys` counts resources replaced by later packages. This is how expansions and mods override the base game.

Useful extras:
```sh
# decode every .prop file; --names uses SporeModder-FX's reg_*.txt so you see names, not hashes
./build/spore2-scan --props --names "/Applications/SporeModder FX"

# check whether a resource with that name really exists in your files (for "hidden content" claims)
./build/spore2-scan --names "/Applications/SporeModder FX" --find CakeEditor,CellEditor,PlannerThumbnailGen

# export every texture as .dds (original) and .png (for viewing / AI upscalers like Real-ESRGAN)
./build/spore2-scan --textures --names ~/SporeData/names --extract ~/SporeData/textures --type raster ~/SporeData/Base
./build/spore2-scan --textures --names ~/SporeData/names --extract ~/SporeData/textures --type rw4 ~/SporeData/Base

# export every model as .obj (open in Blender, or import into Unreal)
./build/spore2-scan --models --textures --names ~/SporeData/names --extract ~/SporeData/models --type rw4 ~/SporeData/Base

# export all property files plus a readable .txt next to each
./build/spore2-scan --extract ~/Desktop/SporeDump --type prop --names "/Applications/SporeModder FX"

./build/spore2-scan --png "/Users/<you>/Documents/My Spore Creations"     # inspect creation cards
./build/spore2-scan --extract ~/Desktop/SporeDump --type png              # export all PNG resources
```

### Step 2 – Look at the data by hand (optional, any time)

Use **SporeModder-FX** (github.com/emd4600/SporeModder-FX). It is the current community tool for
unpacking and editing `.package` files. SporeMaster is older and no longer maintained. Use it to
see what a resource type contains before you write a decoder for it.

### Step 3 – Create the Unreal project (once Step 1 is clean)

You need Unreal Engine 5.5+ (Epic Games Launcher) and Xcode.

1. Create a new **C++** project (Blank template), e.g. `Spore2`.
2. Copy `spore2/Plugins/Spore2Interop` into `<YourProject>/Plugins/`.
3. Regenerate project files, then build from Xcode or the editor.
4. Optionally set the scan paths in `Config/DefaultGame.ini`:
   ```ini
   [/Script/Spore2Interop.SporeInteropSubsystem]
   +InstallRoots=/Volumes/Macintosh SD/Spore.2008.EA
   +InstallRoots=/Volumes/Macintosh SD/Spore.Creepy.&.Cute.Parts.Pack.2008.EA
   +InstallRoots=/Volumes/Macintosh SD/Spore.Galactic.Adventures.Expansion.Pack.2009.EA
   ModsFolder=/Users/<you>/Documents/My Spore Creations/Mods
   NameRegistryFolder=/Applications/SporeModder FX
   ```
5. In the Level Blueprint's BeginPlay: *Get Game Instance Subsystem (SporeInteropSubsystem)* →
   *Open Package Browser* (Player Controller 0). Press Play. The browser mounts everything and lists it.

If the build reports errors, paste them into Claude Code in this repo and it will fix them.

### Step 4 – Textures (after resources can be exported)

Export textures (Step 1 `--extract` or the browser's *Export selected*). Upscale them with an
external tool (Real-ESRGAN, Topaz). The plugin's `CreateNormalMapTexture` / `CreateLegacyMaterial`
then build normal and roughness inputs for a UE material. Spore's source art is low-resolution, so
this improves it but cannot add real detail.

### Step 5 – Next pieces of code, in order

1. ~~`.prop` property-file decoder~~ (done)
2. ~~Texture decoders~~ and ~~`.rw4` mesh decoder~~ (done); next: materials (which texture goes on which mesh), skeletons and animations.
3. Creation PNG pixel decoder → creature data.
4. Creature skeleton → Control Rig / procedural locomotion.
5. Gameplay, one stage at a time.

## Layout

```
spore2/
  Plugins/Spore2Interop/          UE5 plugin
    Source/Spore2Interop/
      Public/SporeCore/           engine-independent C++20 core (headers)
      Private/SporeCore/          core implementation (also built by Tools/)
      Public/SporeInteropSubsystem.h
      Private/SporeInteropSubsystem.cpp
      Private/UI/SSporePackageBrowser.*
  Tools/                          CMake build for spore2-scan and the tests
  Tests/test_core.cpp             unit tests on synthetic data
```
