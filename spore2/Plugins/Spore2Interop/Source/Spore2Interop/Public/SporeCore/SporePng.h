// Spore 2.0 interop layer - PNG chunk reader for creation cards.
//
// Note on Spore creation PNGs: the creature/building/vehicle model data is NOT
// stored in tEXt/zTXt chunks. Spore hides it in the low bits of the pixel data
// (steganography). This reader enumerates every chunk, validates CRCs and
// extracts textual chunks; decoding the pixel-embedded payload is a separate
// step that is not implemented yet.

#pragma once

#include <cstddef>
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

namespace sporecore
{

struct PngTextChunk
{
	std::string ChunkType; // "tEXt", "zTXt" or "iTXt"
	std::string Keyword;
	std::vector<uint8_t> Value; // already inflated when an inflater was supplied
	bool bInflated = false;
};

struct PngInfo
{
	uint32_t Width = 0;
	uint32_t Height = 0;
	uint8_t BitDepth = 0;
	uint8_t ColorType = 0;
	std::vector<std::string> ChunkOrder;
	std::vector<PngTextChunk> TextChunks;
	std::vector<std::string> Issues;

	// Spore creation cards are 128x128, 8-bit RGBA. A shape match only - the
	// embedded payload itself still has to be decoded to confirm.
	bool LooksLikeSporeCard() const { return Width == 128 && Height == 128 && BitDepth == 8 && ColorType == 6; }
};

// zlib inflate callback: (compressed bytes, size, output) -> success.
// Supplied by the host (FCompression in Unreal, zlib in the CLI).
using InflateFn = std::function<bool(const uint8_t*, size_t, std::vector<uint8_t>&)>;

uint32_t Crc32(const uint8_t* Data, size_t Size, uint32_t Seed = 0);

// Returns false only when the data is not a PNG at all; recoverable problems go to Out.Issues.
bool ReadPngChunks(const uint8_t* Data, size_t Size, const InflateFn& Inflate, PngInfo& Out);

} // namespace sporecore
