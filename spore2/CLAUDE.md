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
- Creation PNG model data is hidden in pixel low bits, not in text chunks.

## Roadmap

1. ~~`.prop` decoder~~  2. raster/DDS + `.rw4` → UE assets  3. creation PNG pixel decoder
4. skeleton → Control Rig  5. gameplay stages
