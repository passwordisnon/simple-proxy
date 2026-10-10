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
bool ParseSporeModelXml(const std::string& Xml, SporeCreation& Out, std::string& Error);

} // namespace sporecore
