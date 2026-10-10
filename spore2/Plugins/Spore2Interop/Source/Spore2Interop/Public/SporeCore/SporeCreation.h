// Spore 2.0 interop layer - decoder for Spore creation PNGs (creatures, buildings,
// vehicles, UFOs, adventures...).
//
// Spore hides a zlib-compressed payload in the low bits of the card's pixels, walked in
// a pseudo-random order. The algorithm follows emd4600's Spore PNG Decoder
// (github.com/Spore-Community/PNG-Decoder-NetCore); this is an independent C++
// implementation of it. The payload holds the "pollen" metadata (name, author,
// description, tags) followed by a <sporemodel> XML document listing every part.

#pragma once

#include "SporeCore/SporePng.h"
#include "SporeCore/SporeProp.h"
#include "SporeCore/SporeTexture.h"

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace sporecore
{

struct PngImage
{
	uint32_t Width = 0;
	uint32_t Height = 0;
	std::vector<uint8_t> Rgba; // tightly packed RGBA8, top row first
};

// Decodes 8-bit RGBA or RGB, non-interlaced PNGs (what Spore writes). Inflate is the zlib
// inflater supplied by the host.
bool DecodePngImage(const uint8_t* Data, size_t Size, const InflateFn& Inflate, PngImage& Out, std::string& Error);

// Reads the hidden byte stream from a 128x128 card's pixels, given as BGRA8 bytes
// (65536 bytes). Stops after MaxBytes or when the walk returns to its start.
std::vector<uint8_t> ExtractHiddenBytes(const uint8_t* Bgra, size_t Size, size_t MaxBytes);

struct CreationPaint
{
	uint32_t Region = 0;
	uint32_t PaintId = 0;
	float Color1[3] = {0, 0, 0};
	float Color2[3] = {0, 0, 0};
};

struct CreationBlock
{
	uint32_t Group = 0;    // part file group (e.g. a parts folder)
	uint32_t Instance = 0; // part file instance
	float Scale = 1.0f;
	float Position[3] = {0, 0, 0};
	float Rotation[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1}; // row-major orientation
	bool bSnapped = false;
	bool bAsymmetric = false;
	std::vector<int32_t> Children; // indices into SporeCreation::Blocks
	std::vector<CreationPaint> Paints;
};

struct SporeCreation
{
	std::string Metadata;  // pollen metadata text preceding the XML (name, description, tags, ...)
	std::string ModelXml;  // the <sporemodel> document
	uint32_t ModelType = 0;
	uint32_t FormatVersion = 0;
	std::vector<CreationBlock> Blocks;
	bool bUsedExtraChunk = false; // payload came from the spOr chunk (large creations)
};

// Full pipeline: PNG pixels -> hidden payload -> inflate -> metadata + XML -> parts.
bool DecodeSporeCreation(const uint8_t* Data, size_t Size, const InflateFn& Inflate, SporeCreation& Out, std::string& Error);

// Property ids (from SporeModder-FX reg_property.txt) that point a part at its model.
constexpr uint32_t PropModelMeshLOD0 = 0x00F9EFBB;
constexpr uint32_t PropModelMeshLOD1 = 0x00F9EFBC;
constexpr uint32_t PropModelMeshLOD2 = 0x00F9EFBD;
constexpr uint32_t PropModelMeshLOD3 = 0x00F9EFBE;
constexpr uint32_t PropModelMeshLowRes = 0x00F9EFBF;

// Finds the most detailed model key in a part's property list (LOD0, then LOD1..3, then
// low-res). Keys without a type get the rw4 type. Returns false when the part names no model.
bool FindPartModelKey(const PropertyList& Props, ResourceKey& OutKey);

// Moves a part's mesh into creation space: scale, then rotate, then translate, applied to
// positions (and rotation to normals). bTransposeRotation switches between treating the
// orientation rows as basis vectors (row-vector convention, the default) or as columns -
// which one Spore uses is still to be confirmed on real creations.
void PlaceMesh(MeshData& Mesh, const CreationBlock& Block, bool bTransposeRotation);

// Parses a <sporemodel> document into blocks (exposed for tests and for XML files from mods).
// The game's own creation files (.crt, .bld, .vcl, .ufo, .cll, .flr in EditorSaves.package or
// Pollination.package) are this same XML, so they can be passed in directly.
bool ParseSporeModelXml(const std::string& Xml, SporeCreation& Out, std::string& Error);

// Resource types (SporeModder-FX reg_type.txt) of saved creations and their metadata.
constexpr uint32_t TypePollenMetadata = 0x030BDEE3;
constexpr uint32_t TypeCreature = 0x2B978C46;  // crt
constexpr uint32_t TypeBuilding = 0x2399BE55;  // bld
constexpr uint32_t TypeVehicle = 0x24682294;   // vcl
constexpr uint32_t TypeUfo = 0x476A98C7;       // ufo
constexpr uint32_t TypeCell = 0x3D97A8E4;      // cll
constexpr uint32_t TypeFlora = 0x438F6347;     // flr
bool IsCreationXmlType(uint32_t Type);

// A .pollen_metadata resource: who made a creation and what it is called. Layout follows
// SporeModder-FX PollenMetadata.read (versions up to 13). Integers are big-endian, names
// UTF-16LE with a length prefix, the authors list ASCII. Strings are converted to UTF-8.
struct PollenMetadata
{
	uint32_t Version = 0;
	int64_t AssetId = -1; // Sporepedia ID, -1 for local creations
	ResourceKey AssetKey;
	ResourceKey ParentKey;
	int64_t ParentAssetId = -1;
	int64_t OriginalParentAssetId = -1;
	int64_t TimeCreated = -1;    // raw value; seconds since 0001-01-01 judging by real files (unconfirmed)
	int64_t TimeDownloaded = -1; // same unit
	bool bLocalized = false;     // names come from a locale table instead of the strings below
	uint32_t LocaleTable = 0;
	uint32_t AuthorNameLocale = 0, NameLocale = 0, DescriptionLocale = 0, TagsLocale = 0;
	int64_t AuthorId = -1;
	std::string AuthorName;
	std::string Name;
	std::string Description;
	std::vector<std::string> Authors; // in practice also holds markers like "tag:spore.com,2006:ImportedContent"
	std::vector<std::string> Tags;
	bool bShareable = false;
	std::vector<uint32_t> ConsequenceTraits;
};

bool ParsePollenMetadata(const uint8_t* Data, size_t Size, PollenMetadata& Out, std::string& Error);

// Multi-line readable dump of the metadata (one "field: value" per line).
std::string FormatPollenMetadata(const PollenMetadata& Meta);

} // namespace sporecore
