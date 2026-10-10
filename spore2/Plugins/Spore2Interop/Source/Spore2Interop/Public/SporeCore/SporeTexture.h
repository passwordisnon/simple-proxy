// Spore 2.0 interop layer - Spore texture containers (.raster and RenderWare 4 .rw4).
//
// Layouts follow SporeModder-FX (file/raster/RasterTexture.java, file/rw4/RWHeader.java,
// RWSectionInfo.java, RWRaster.java). Pixel data is stored as Direct3D 9 formats:
// DXT1/DXT3/DXT5 (FourCC) or the uncompressed D3DFMT codes below.

#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace sporecore
{

constexpr uint32_t MakeFourCC(char A, char B, char C, char D)
{
	return static_cast<uint32_t>(static_cast<uint8_t>(A)) | (static_cast<uint32_t>(static_cast<uint8_t>(B)) << 8) |
		(static_cast<uint32_t>(static_cast<uint8_t>(C)) << 16) | (static_cast<uint32_t>(static_cast<uint8_t>(D)) << 24);
}

constexpr uint32_t FourCC_DXT1 = MakeFourCC('D', 'X', 'T', '1');
constexpr uint32_t FourCC_DXT3 = MakeFourCC('D', 'X', 'T', '3');
constexpr uint32_t FourCC_DXT5 = MakeFourCC('D', 'X', 'T', '5');
constexpr uint32_t D3DFMT_R8G8B8 = 20;   // memory order B, G, R
constexpr uint32_t D3DFMT_A8R8G8B8 = 21; // memory order B, G, R, A
constexpr uint32_t D3DFMT_A8 = 28;

struct TextureImage
{
	uint32_t Width = 0;
	uint32_t Height = 0;
	uint32_t MipCount = 0;
	uint32_t Format = 0; // FourCC or D3DFMT code
	bool bCube = false;
	std::vector<uint8_t> Data; // all mips (and faces) back to back, largest first
};

const char* TextureFormatName(uint32_t Format);

// Bytes for one mip level of the given format, or 0 for unsupported formats.
size_t MipSize(uint32_t Format, uint32_t Width, uint32_t Height);

// .raster: version 1 header followed by per-mip size-prefixed data.
bool ParseRaster(const uint8_t* Data, size_t Size, TextureImage& Out, std::string& Error);

enum class Rw4Kind : uint8_t
{
	Unknown,
	Model,
	Texture,
	Special,
};

struct Rw4Info
{
	Rw4Kind Kind = Rw4Kind::Unknown;
	uint32_t SectionCount = 0;
	std::vector<TextureImage> Textures;
	uint32_t SkippedTextures = 0; // rasters whose data lives in sub-references (not supported yet)
};

// Reads the RenderWare 4 header and section table and extracts every raster section.
bool ParseRw4(const uint8_t* Data, size_t Size, Rw4Info& Out, std::string& Error);

// Standard DirectDraw Surface file, readable by macOS Preview, GIMP, Photoshop and texture tools.
void WriteDds(const TextureImage& Image, std::vector<uint8_t>& Out);

// Decodes the first mip (first face for cube maps) to tightly packed RGBA8.
bool DecodeToRgba(const TextureImage& Image, std::vector<uint8_t>& OutRgba, std::string& Error);

} // namespace sporecore
