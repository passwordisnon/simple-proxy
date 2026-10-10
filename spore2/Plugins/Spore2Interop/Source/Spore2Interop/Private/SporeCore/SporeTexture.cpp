// Spore 2.0 interop layer - Spore texture containers (.raster and RenderWare 4 .rw4).

#include "SporeCore/SporeTexture.h"

#include <algorithm>
#include <cstring>

namespace sporecore
{

namespace
{

uint32_t TexLE32(const uint8_t* P)
{
	return static_cast<uint32_t>(P[0]) | (static_cast<uint32_t>(P[1]) << 8) | (static_cast<uint32_t>(P[2]) << 16) | (static_cast<uint32_t>(P[3]) << 24);
}

uint16_t TexLE16(const uint8_t* P)
{
	return static_cast<uint16_t>(P[0] | (P[1] << 8));
}

void PutTexLE32(std::vector<uint8_t>& Out, uint32_t V)
{
	for (int I = 0; I < 4; ++I) Out.push_back(static_cast<uint8_t>(V >> (8 * I)));
}

bool IsBlockCompressed(uint32_t Format)
{
	return Format == FourCC_DXT1 || Format == FourCC_DXT3 || Format == FourCC_DXT5;
}

void Rgb565(uint16_t C, uint8_t Out[3])
{
	const uint32_t R = (C >> 11) & 0x1F;
	const uint32_t G = (C >> 5) & 0x3F;
	const uint32_t B = C & 0x1F;
	Out[0] = static_cast<uint8_t>((R << 3) | (R >> 2));
	Out[1] = static_cast<uint8_t>((G << 2) | (G >> 4));
	Out[2] = static_cast<uint8_t>((B << 3) | (B >> 2));
}

// Decodes one 4x4 DXT colour block into Pixels (RGBA, 16 entries). bAllowAlpha enables
// DXT1's 3-colour + transparent mode; DXT3/5 colour blocks always use 4 colours.
void DecodeColorBlock(const uint8_t* Block, bool bAllowAlpha, uint8_t Pixels[16][4])
{
	const uint16_t C0 = TexLE16(Block);
	const uint16_t C1 = TexLE16(Block + 2);
	uint8_t Palette[4][4];
	Rgb565(C0, Palette[0]);
	Rgb565(C1, Palette[1]);
	Palette[0][3] = Palette[1][3] = 255;
	if (C0 > C1 || !bAllowAlpha)
	{
		for (int Ch = 0; Ch < 3; ++Ch)
		{
			Palette[2][Ch] = static_cast<uint8_t>((2 * Palette[0][Ch] + Palette[1][Ch] + 1) / 3);
			Palette[3][Ch] = static_cast<uint8_t>((Palette[0][Ch] + 2 * Palette[1][Ch] + 1) / 3);
		}
		Palette[2][3] = Palette[3][3] = 255;
	}
	else
	{
		for (int Ch = 0; Ch < 3; ++Ch)
		{
			Palette[2][Ch] = static_cast<uint8_t>((Palette[0][Ch] + Palette[1][Ch]) / 2);
			Palette[3][Ch] = 0;
		}
		Palette[2][3] = 255;
		Palette[3][3] = 0;
	}
	const uint32_t Indices = TexLE32(Block + 4);
	for (int I = 0; I < 16; ++I)
	{
		std::memcpy(Pixels[I], Palette[(Indices >> (2 * I)) & 3], 4);
	}
}

void DecodeDxt5Alpha(const uint8_t* Block, uint8_t Pixels[16][4])
{
	const uint32_t A0 = Block[0];
	const uint32_t A1 = Block[1];
	uint8_t Table[8];
	Table[0] = static_cast<uint8_t>(A0);
	Table[1] = static_cast<uint8_t>(A1);
	if (A0 > A1)
	{
		for (uint32_t I = 1; I < 7; ++I) Table[I + 1] = static_cast<uint8_t>(((7 - I) * A0 + I * A1 + 3) / 7);
	}
	else
	{
		for (uint32_t I = 1; I < 5; ++I) Table[I + 1] = static_cast<uint8_t>(((5 - I) * A0 + I * A1 + 2) / 5);
		Table[6] = 0;
		Table[7] = 255;
	}
	uint64_t Bits = 0;
	for (int I = 0; I < 6; ++I) Bits |= static_cast<uint64_t>(Block[2 + I]) << (8 * I);
	for (int I = 0; I < 16; ++I)
	{
		Pixels[I][3] = Table[(Bits >> (3 * I)) & 7];
	}
}

} // namespace

const char* TextureFormatName(uint32_t Format)
{
	switch (Format)
	{
	case FourCC_DXT1: return "DXT1";
	case FourCC_DXT3: return "DXT3";
	case FourCC_DXT5: return "DXT5";
	case D3DFMT_R8G8B8: return "R8G8B8";
	case D3DFMT_A8R8G8B8: return "A8R8G8B8";
	case D3DFMT_A8: return "A8";
	default: return "unknown";
	}
}

size_t MipSize(uint32_t Format, uint32_t Width, uint32_t Height)
{
	const size_t BlocksW = std::max<size_t>(1, (Width + 3) / 4);
	const size_t BlocksH = std::max<size_t>(1, (Height + 3) / 4);
	switch (Format)
	{
	case FourCC_DXT1: return BlocksW * BlocksH * 8;
	case FourCC_DXT3:
	case FourCC_DXT5: return BlocksW * BlocksH * 16;
	case D3DFMT_R8G8B8: return static_cast<size_t>(Width) * Height * 3;
	case D3DFMT_A8R8G8B8: return static_cast<size_t>(Width) * Height * 4;
	case D3DFMT_A8: return static_cast<size_t>(Width) * Height;
	default: return 0;
	}
}

bool ParseRaster(const uint8_t* Data, size_t Size, TextureImage& Out, std::string& Error)
{
	Out = TextureImage();
	if (Size < 24 || TexLE32(Data) != 1)
	{
		Error = "not a version 1 raster";
		return false;
	}
	Out.Width = TexLE32(Data + 4);
	Out.Height = TexLE32(Data + 8);
	Out.MipCount = TexLE32(Data + 12);
	// Data + 16 is the pixel width field; SporeModder-FX keeps it but it does not affect decoding.
	Out.Format = TexLE32(Data + 20);
	if (Out.Width == 0 || Out.Height == 0 || Out.MipCount == 0 || Out.MipCount > 16)
	{
		Error = "implausible raster dimensions";
		return false;
	}

	size_t Pos = 24;
	for (uint32_t Mip = 0; Mip < Out.MipCount; ++Mip)
	{
		if (Size - Pos < 4)
		{
			Error = "truncated raster mip header";
			return false;
		}
		const uint32_t MipBytes = TexLE32(Data + Pos);
		Pos += 4;
		if (MipBytes > Size - Pos)
		{
			Error = "truncated raster mip data";
			return false;
		}
		Out.Data.insert(Out.Data.end(), Data + Pos, Data + Pos + MipBytes);
		Pos += MipBytes;
	}
	return true;
}

bool ParseRw4(const uint8_t* Data, size_t Size, Rw4Info& Out, std::string& Error)
{
	Out = Rw4Info();
	static const uint8_t Magic[8] = {0x89, 'R', 'W', '4', 'w', '3', '2', 0x00};
	if (Size < 0x48 || std::memcmp(Data, Magic, sizeof(Magic)) != 0)
	{
		Error = "missing RW4 magic";
		return false;
	}

	switch (TexLE32(Data + 0x1C))
	{
	case 1: Out.Kind = Rw4Kind::Model; break;
	case 0x04000000: Out.Kind = Rw4Kind::Texture; break;
	case 0xCAFED00D: Out.Kind = Rw4Kind::Special; break;
	default: Out.Kind = Rw4Kind::Unknown; break;
	}
	Out.SectionCount = TexLE32(Data + 0x24);
	const uint32_t SectionTable = TexLE32(Data + 0x30);
	const uint32_t BufferData = TexLE32(Data + 0x44);

	constexpr size_t SectionInfoSize = 24;
	if (SectionTable > Size || (Size - SectionTable) / SectionInfoSize < Out.SectionCount)
	{
		Error = "section table outside file";
		return false;
	}

	struct Section
	{
		uint64_t Offset;
		uint32_t Size;
		uint32_t TypeCode;
	};
	constexpr uint32_t TypeBaseResource = 0x10030;
	constexpr uint32_t TypeRaster = 0x20003;

	std::vector<Section> Sections(Out.SectionCount);
	for (uint32_t I = 0; I < Out.SectionCount; ++I)
	{
		const uint8_t* Info = Data + SectionTable + I * SectionInfoSize;
		Sections[I].Offset = TexLE32(Info);
		Sections[I].Size = TexLE32(Info + 8);
		Sections[I].TypeCode = TexLE32(Info + 20);
		// Base resources (raw buffers) are addressed relative to the buffer data block.
		if (Sections[I].TypeCode == TypeBaseResource)
		{
			Sections[I].Offset += BufferData;
		}
	}

	for (const Section& Raster : Sections)
	{
		if (Raster.TypeCode != TypeRaster)
		{
			continue;
		}
		// format u32, flags u16, depth u16, dxBase u32, width u16, height u16, field_10 u8,
		// mips u8, pad u16, field_14 u32, field_18 u32, data index u32 (32 bytes).
		if (Raster.Offset + 32 > Size)
		{
			Error = "raster section outside file";
			return false;
		}
		const uint8_t* R = Data + Raster.Offset;
		TextureImage Image;
		Image.Format = TexLE32(R);
		const uint16_t Flags = TexLE16(R + 4);
		Image.bCube = (Flags & 0x1000) != 0;
		Image.Width = TexLE16(R + 12);
		Image.Height = TexLE16(R + 14);
		Image.MipCount = R[17];
		const uint32_t DataIndex = TexLE32(R + 28);

		// Indices with a non-zero top section type refer to sub-references or "no object".
		if ((DataIndex >> 22) != 0 || DataIndex >= Sections.size())
		{
			++Out.SkippedTextures;
			continue;
		}
		const Section& Buffer = Sections[DataIndex];
		if (Buffer.Offset + Buffer.Size > Size)
		{
			Error = "texture data outside file";
			return false;
		}
		Image.Data.assign(Data + Buffer.Offset, Data + Buffer.Offset + Buffer.Size);
		Out.Textures.push_back(std::move(Image));
	}
	return true;
}

void WriteDds(const TextureImage& Image, std::vector<uint8_t>& Out)
{
	Out.clear();
	const bool bCompressed = IsBlockCompressed(Image.Format);
	uint32_t BitCount = 32;
	uint32_t PixelFlags = 0;
	uint32_t RMask = 0x00FF0000, GMask = 0x0000FF00, BMask = 0x000000FF, AMask = 0xFF000000;
	if (bCompressed)
	{
		PixelFlags = 0x4; // FOURCC
		BitCount = 0;
		RMask = GMask = BMask = AMask = 0;
	}
	else if (Image.Format == D3DFMT_A8)
	{
		PixelFlags = 0x2; // ALPHA
		BitCount = 8;
		RMask = GMask = BMask = 0;
		AMask = 0xFF;
	}
	else if (Image.Format == D3DFMT_R8G8B8)
	{
		PixelFlags = 0x40; // RGB
		BitCount = 24;
		AMask = 0;
	}
	else
	{
		PixelFlags = 0x40 | 0x1; // RGB | ALPHAPIXELS
	}

	const uint32_t Mips = std::max(1u, Image.MipCount);
	const uint32_t HeaderFlags = 0x1 | 0x2 | 0x4 | 0x1000 | 0x20000 | (bCompressed ? 0x80000 : 0x8);
	const uint32_t PitchOrLinearSize = bCompressed ? static_cast<uint32_t>(MipSize(Image.Format, Image.Width, Image.Height))
	                                               : Image.Width * BitCount / 8;
	uint32_t Caps = 0x1000; // TEXTURE
	if (Mips > 1) Caps |= 0x400000 | 0x8; // MIPMAP | COMPLEX
	uint32_t Caps2 = 0;
	if (Image.bCube)
	{
		Caps |= 0x8;
		Caps2 = 0x200 | 0xFC00; // CUBEMAP and all six faces
	}

	Out.reserve(128 + Image.Data.size());
	PutTexLE32(Out, MakeFourCC('D', 'D', 'S', ' '));
	PutTexLE32(Out, 124);
	PutTexLE32(Out, HeaderFlags);
	PutTexLE32(Out, Image.Height);
	PutTexLE32(Out, Image.Width);
	PutTexLE32(Out, PitchOrLinearSize);
	PutTexLE32(Out, 0); // depth
	PutTexLE32(Out, Mips);
	for (int I = 0; I < 11; ++I) PutTexLE32(Out, 0);
	PutTexLE32(Out, 32);
	PutTexLE32(Out, PixelFlags);
	PutTexLE32(Out, bCompressed ? Image.Format : 0);
	PutTexLE32(Out, BitCount);
	PutTexLE32(Out, RMask);
	PutTexLE32(Out, GMask);
	PutTexLE32(Out, BMask);
	PutTexLE32(Out, AMask);
	PutTexLE32(Out, Caps);
	PutTexLE32(Out, Caps2);
	PutTexLE32(Out, 0);
	PutTexLE32(Out, 0);
	PutTexLE32(Out, 0);
	Out.insert(Out.end(), Image.Data.begin(), Image.Data.end());
}

bool DecodeToRgba(const TextureImage& Image, std::vector<uint8_t>& OutRgba, std::string& Error)
{
	const size_t Needed = MipSize(Image.Format, Image.Width, Image.Height);
	if (Needed == 0)
	{
		Error = std::string("unsupported texture format ") + TextureFormatName(Image.Format);
		return false;
	}
	if (Image.Data.size() < Needed)
	{
		Error = "texture data shorter than its first mip";
		return false;
	}

	const uint32_t W = Image.Width;
	const uint32_t H = Image.Height;
	OutRgba.assign(static_cast<size_t>(W) * H * 4, 0);
	const uint8_t* Src = Image.Data.data();

	if (IsBlockCompressed(Image.Format))
	{
		const size_t BlockBytes = Image.Format == FourCC_DXT1 ? 8 : 16;
		const uint32_t BlocksW = std::max(1u, (W + 3) / 4);
		const uint32_t BlocksH = std::max(1u, (H + 3) / 4);
		for (uint32_t By = 0; By < BlocksH; ++By)
		{
			for (uint32_t Bx = 0; Bx < BlocksW; ++Bx)
			{
				const uint8_t* Block = Src + (static_cast<size_t>(By) * BlocksW + Bx) * BlockBytes;
				uint8_t Pixels[16][4];
				if (Image.Format == FourCC_DXT1)
				{
					DecodeColorBlock(Block, true, Pixels);
				}
				else
				{
					DecodeColorBlock(Block + 8, false, Pixels);
					if (Image.Format == FourCC_DXT3)
					{
						for (int I = 0; I < 16; ++I)
						{
							const uint8_t Nibble = static_cast<uint8_t>((Block[I / 2] >> ((I % 2) * 4)) & 0xF);
							Pixels[I][3] = static_cast<uint8_t>(Nibble * 17);
						}
					}
					else
					{
						DecodeDxt5Alpha(Block, Pixels);
					}
				}
				for (uint32_t Py = 0; Py < 4; ++Py)
				{
					for (uint32_t Px = 0; Px < 4; ++Px)
					{
						const uint32_t X = Bx * 4 + Px;
						const uint32_t Y = By * 4 + Py;
						if (X < W && Y < H)
						{
							std::memcpy(&OutRgba[(static_cast<size_t>(Y) * W + X) * 4], Pixels[Py * 4 + Px], 4);
						}
					}
				}
			}
		}
		return true;
	}

	for (size_t I = 0; I < static_cast<size_t>(W) * H; ++I)
	{
		uint8_t* Dst = &OutRgba[I * 4];
		switch (Image.Format)
		{
		case D3DFMT_A8R8G8B8:
			Dst[0] = Src[I * 4 + 2];
			Dst[1] = Src[I * 4 + 1];
			Dst[2] = Src[I * 4 + 0];
			Dst[3] = Src[I * 4 + 3];
			break;
		case D3DFMT_R8G8B8:
			Dst[0] = Src[I * 3 + 2];
			Dst[1] = Src[I * 3 + 1];
			Dst[2] = Src[I * 3 + 0];
			Dst[3] = 255;
			break;
		default: // D3DFMT_A8: white with alpha
			Dst[0] = Dst[1] = Dst[2] = 255;
			Dst[3] = Src[I];
			break;
		}
	}
	return true;
}

} // namespace sporecore
