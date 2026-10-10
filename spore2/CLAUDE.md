# Spore 2.0 interop – notes for AI coding assistants

Private, non-commercial project. The user owns Spore, Creepy & Cute and Galactic Adventures.
The code reads their locally installed files. Never commit game data (`*.package`, extracted
resources, creation PNGs) to this repository.

## Rules

- `Plugins/Spore2Interop/Source/Spore2Interop/{Public,Private}/SporeCore/` is engine-independent
  C++20: no Unreal headers, no exceptions, no `.at()`. It is built both by UE and by `Tools/`
  (CMake), so every change there must pass `Tools/` tests:
  `cmake -S Tools -B build && cmake --build build && ./build/spore2-tests`.
- Format work follows SporeModder-FX (github.com/emd4600/SporeModder-FX) as the reference
  implementation. Do not invent file layouts. If a field's meaning is unknown, say so in a
  comment and keep the raw value.
- Every new decoder gets a unit test in `Tests/test_core.cpp` with synthetic data.
- UE code follows Epic's coding standard (PascalCase, `b` prefix for bools, `F/U/S/E` prefixes).
  Only the user's machine can compile it, so ask them for the build log after UE changes.
- Never present simulated or placeholder data as if it were parsed from real files.

## Known facts

- Spore `.package` = DBPF 2.0. Header is 96 bytes. Index count is at 36, size at 44, offset at 64.
  Index flags bits 0/1/2 mean type/group/unknown are shared by all entries.
- Entry payloads are RefPack/QFS when the compression flag is 0xFFFF.
- Resource names hash with 32-bit FNV-1 over lowercase ASCII. Property and type IDs are often
  explicit values instead, so name lookups use SporeModder-FX's reg_*.txt files (never copy those
  GPL files into this repo; load them from the user's SporeModder-FX folder).
- .prop: big-endian count/header/scalars; little-endian keys, vectors, colors, transforms, bboxes;
  single keys and vector2/vector3/colorRGB carry padding that arrays do not (see SporeProp.cpp).
- .raster: version 1 header (w, h, mips, pixel width, format) + size-prefixed mips.
  .rw4: magic 89 'RW4w32'; type @0x1C, section count @0x24, section table @0x30, buffer base @0x44;
  24-byte section infos; raster sections (0x20003) point at base resources (0x10030).
- rw4 meshes: mesh 0x20009 -> vertex buffer 0x20005 (-> description 0x20004, data) and index
  buffer 0x20007 (-> data). Element "typeCode" is Spore's usage (0 pos, 2 normal, 6 uv0, 14/15 blend).
  Normals are unsigned bytes: (b - 127.5) / 127.5 (SporeModder-FX's viewer reads them signed; we don't).
  Confirmed on the user's base game: 5,997 meshes, average normal length 0.990; 2,954 rasters and
  all 13,478 rw4 textures decoded (DXT1/3/5, A8R8G8B8, L8); 1,391 meshes skipped (blend shapes / sub-references, not done yet).
  UE conversion mirrors Y and flips winding; the 100x unit scale is an assumption to verify.
- rw4 materials: mesh/state link 0x2001A -> compiled states 0x2000B; texture slots sit at the end of
  the compiled state (walk per MaterialStateCompiler.decompile); a slot's raster index points at a
  raster 0x20003 or a texture override 0x20008 (0xFB724FAA + C-string name).
- Creation PNG model data is hidden in pixel low bits, not in text chunks: BGRA bytes walked by a
  16-bit LFSR from 0xB400 with a running FNV hash (see SporeCreation.cpp, after emd4600's decoder);
  8-byte header (magic, LE length), zlib payload = pollen metadata + <sporemodel> XML; large
  creations use an "spOr" chunk after IEND. Never commit sample PNGs from that repo (no license).
- Assembly: block (group, instance) + type prop = part file (buildings: group building_parts~
  0x40636000); its modelMeshLOD0..3 / modelMeshLowRes key names the rw4. Orientation rows are applied
  as row vectors (v * R) by default; --flip-rotation / bFlipRotation uses columns. Unconfirmed which
  is right, and whether positions are absolute or parent-relative (treated as absolute).

## Roadmap

1. ~~`.prop` decoder~~  2. ~~textures~~, ~~rw4 meshes~~, ~~materials~~; skeletons, animations  3. ~~creation PNG decoder~~
4. skeleton → Control Rig  5. gameplay stages
