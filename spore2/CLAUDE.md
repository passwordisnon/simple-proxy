# Spore 2.0 interop – notes for AI coding assistants

Private, non-commercial project. The user owns Spore, Creepy & Cute and Galactic Adventures.
The code reads their locally installed files. Never commit game data (`*.package`, extracted
resources, creation PNGs) to this repository.

Start with `HANDOVER.md`: project history, the user's machine and paths, open tasks.

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

- Spore `.package` = DBPF 2.0 (SporeModder-FX-made mods: 3.0, same layout). Header is 96 bytes. Index count is at 36, size at 44, offset at 64.
  Index flags bits 0/1/2 mean type/group/unknown are shared by all entries.
  "DBBF" packages (SporeModder-FX isDBBF, used by some mods) have a 120-byte header (count @36,
  u64 index size @40, u64 index offset @56) and 8-byte entry offsets; both variants are read.
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
  all 13,478 rw4 textures decoded (DXT1/3/5, A8R8G8B8, L8); with blend shapes all 7,388 meshes decode
  (4,473 skinned, 1,391 blend shape, 0 skipped). A real creature (.crt) assembles 47 of 47 parts.
  Blend-shape meshes have no vertex buffer: the file's single blend shape buffer 0x200AF (u32 1,
  11 stream offsets, shape/vertex counts) holds 16-byte-per-vertex position/normal/texcoord streams,
  base shape first (SporeModder-FX RWBlendShapeBuffer / processBlendShape). Morph targets not applied.
- rw4 skeletons (SporeModder-FX RWSkeleton/RWAnimationSkin/RWSkinsInK, Blender add-on importer):
  skin-in-K 0x7000C -> skeleton 0x70002 (file-offset pointers to flags/parents/names, count, id) and
  animation skin 0x70003 (per bone 3x4 matrix + padded inverse translation; head = -R * t). Vertex
  blend indices store bone * 3 (UBYTE4 or, in blend shape buffers, u16), weights UBYTE4N or float.
  Confirmed on the user's base game: 2,756 skeletons with bind pose (17,285 bones, names such as
  joint1.. resolve via reg_file.txt, plausible positions); 4,472 meshes carry weights. 6,289 other
  skeleton sections have no bind pose (role unknown). One mesh uses SHORT2 indices + FLOAT1 weight
  (decl 6/0), not decoded - layout unconfirmed, so its weights are dropped rather than guessed.
- rw4 keyframe animations (SporeModder-FX RWKeyframeAnim 0x70001, RWKeyframe, RWAnimations 0xFF0001):
  channel names/info at file offsets, channel data relative to the section; keyframes LocRotScale
  0x601 (48 bytes: quat, loc, scale, pad, time), LocRot 0x101 (32), BlendFactor 0x100 (8). The last
  channel ends where time decreases. Creature animations are a different format (.animation,
  type 0xEE17C6AD, SporeModder-FX file/anim) - not read yet. Not yet checked on the user's files.
  UE conversion mirrors Y and flips winding; the 100x unit scale is an assumption to verify.
- rw4 materials: mesh/state link 0x2001A -> compiled states 0x2000B; texture slots sit at the end of
  the compiled state (walk per MaterialStateCompiler.decompile); a slot's raster index points at a
  raster 0x20003 or a texture override 0x20008 (0xFB724FAA + C-string name).
- Creation PNG model data is hidden in pixel low bits, not in text chunks: BGRA bytes walked by a
  16-bit LFSR from 0xB400 with a running FNV hash (see SporeCreation.cpp, after emd4600's decoder);
  8-byte header (magic, LE length), zlib payload = pollen metadata + <sporemodel> XML; large
  creations use an "spOr" chunk after IEND. Never commit sample PNGs from that repo (no license).
- Saved creations (EditorSaves.package, Pollination.package = downloaded creations): .crt/.bld/
  .vcl/.ufo/.cll/.flr are the plain <sporemodel> XML; .pollen_metadata is big-endian binary per
  SporeModder-FX PollenMetadata (name, author, tags; times look like seconds since 0001-01-01).
  Confirmed on the user's Pollination.package (DBBF, 684 creatures; the sampled cards decode).
- Assembly: block (group, instance) + type prop = part file (buildings: group building_parts~
  0x40636000); its modelMeshLOD0..3 / modelMeshLowRes key names the rw4. Orientation rows are applied
  as row vectors (v * R) by default; --flip-rotation / bFlipRotation uses columns. Unconfirmed which
  is right, and whether positions are absolute or parent-relative (treated as absolute).

- Baked game models (.gmdl, type 0xE6BCE5; SporeModder-FX file/gmdl/GameModelResource): version
  LE u32 (<= 9; the user's vehicles have 8), referenced-file count and keys BIG-endian (instance,
  group, type), then LE: mesh count, bbox, radius, index buffers (primitive, count, bits, size,
  data), vertex descriptions (rw4 12-byte elements), vertex buffers (description, vertex count,
  size, data; stride = size / count as SMFX's viewer does), mesh table (index buffer, then vertex
  buffer - SMFX reads that order, its writer the reverse), material ids. Materials follow and are
  not read (they need SMFX ShaderData's size table). Maxis-made vehicles/buildings/UFOs
  (vehiclesModelsVCL~ etc.) point modelMeshLOD0..3 at .gmdl files, not rw4. Unit-tested only.
- Base-game rw4 files without a mesh section (6,154): 5,019 plain textures (raster 0x20003 + buffer), 591 rig/animation
  files (groups editor+animation_runtimeRigblock~ etc.: skeleton 0x70002, skin, keyframes), 540 holding only a
  section of type 0x80003 (meaning not identified) and 4 with a single 0x2000B. The 540 are exactly the same-named
  files of vehiclesModelsVCL~ (285), buildingModelsBLD~ (164) and ufoModelsUFO~ (91): the geometry of those lives in
  the .gmdl files their .prop names, so "no mesh in the model" for them is not a decoding gap.
- rw4 files from mods can declare a base resource larger than the file (CamBensColourPack and others); the size is
  clamped to the end of the file (ParseRw4). 56 mod meshes remain truncated and are rejected.
- First creature in UE (user's screenshot): Pollination 0x251F774F.crt, 47 of 47 parts plus the
  approximate skin, stands upright on its feet with the default row-vector orientation; untextured.
- Creature bodies: a .crt holds only rig blocks (ce_vertebra = instance 0xD05C53A3, limb blocks with
  <limbtype>/<musclescale>/<basemusclescale>); the game wraps the skin at run time. SporeSkin.cpp
  approximates it with tubes (radii are tuned by eye, not from the game). Do not present it as exact.

## Roadmap

1. ~~`.prop` decoder~~  2. ~~textures~~, ~~rw4 meshes~~, ~~materials~~, skeletons; animations  3. ~~creation PNG decoder~~
4. skeleton → Control Rig  5. gameplay stages
Ideas from the user to keep in mind: Dark Injection (Darkspore parts) re-integrated so its war
parts fit the game's style and tie into Galactic Adventures (e.g. adventure equipment/epics).
