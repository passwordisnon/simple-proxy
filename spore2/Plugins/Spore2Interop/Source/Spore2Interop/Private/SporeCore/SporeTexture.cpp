// Spore 2.0 interop layer - Spore texture containers (.raster and RenderWare 4 .rw4).

#include "SporeCore/SporeTexture.h"

#include <algorithm>
#include <cmath>
#include <cstdio>
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
	return Format == FourCC_DXT1 || Format == FourCC_DXT3 || Format == FourCC_DXT5 || Format == FourCC_ATI1 || Format == FourCC_ATI2;
}

// Bits-per-pixel and RGBA masks of the uncompressed formats, for DDS headers.
struct UncompressedLayout
{
	uint32_t Bits, R, G, B, A, Flags;
};

bool GetUncompressedLayout(uint32_t Format, UncompressedLayout& Out)
{
	constexpr uint32_t Rgb = 0x40, AlphaPixels = 0x1, Alpha = 0x2, Luminance = 0x20000;
	switch (Format)
	{
	case D3DFMT_A8R8G8B8: Out = {32, 0x00FF0000, 0x0000FF00, 0x000000FF, 0xFF000000, Rgb | AlphaPixels}; return true;
	case D3DFMT_X8R8G8B8: Out = {32, 0x00FF0000, 0x0000FF00, 0x000000FF, 0, Rgb}; return true;
	case D3DFMT_R8G8B8: Out = {24, 0x00FF0000, 0x0000FF00, 0x000000FF, 0, Rgb}; return true;
	case D3DFMT_R5G6B5: Out = {16, 0xF800, 0x07E0, 0x001F, 0, Rgb}; return true;
	case D3DFMT_X1R5G5B5: Out = {16, 0x7C00, 0x03E0, 0x001F, 0, Rgb}; return true;
	case D3DFMT_A1R5G5B5: Out = {16, 0x7C00, 0x03E0, 0x001F, 0x8000, Rgb | AlphaPixels}; return true;
	case D3DFMT_A4R4G4B4: Out = {16, 0x0F00, 0x00F0, 0x000F, 0xF000, Rgb | AlphaPixels}; return true;
	case D3DFMT_A8: Out = {8, 0, 0, 0, 0xFF, Alpha}; return true;
	case D3DFMT_L8: Out = {8, 0xFF, 0, 0, 0, Luminance}; return true;
	case D3DFMT_A8L8: Out = {16, 0x00FF, 0, 0, 0xFF00, Luminance | AlphaPixels}; return true;
	default: return false;
	}
}

uint8_t Expand(uint32_t Value, int Bits)
{
	return static_cast<uint8_t>(Value * 255 / ((1u << Bits) - 1));
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

std::string TextureFormatName(uint32_t Format)
{
	switch (Format)
	{
	case FourCC_DXT1: return "DXT1";
	case FourCC_DXT3: return "DXT3";
	case FourCC_DXT5: return "DXT5";
	case FourCC_ATI1: return "ATI1";
	case FourCC_ATI2: return "ATI2";
	case D3DFMT_R8G8B8: return "R8G8B8";
	case D3DFMT_A8R8G8B8: return "A8R8G8B8";
	case D3DFMT_X8R8G8B8: return "X8R8G8B8";
	case D3DFMT_R5G6B5: return "R5G6B5";
	case D3DFMT_X1R5G5B5: return "X1R5G5B5";
	case D3DFMT_A1R5G5B5: return "A1R5G5B5";
	case D3DFMT_A4R4G4B4: return "A4R4G4B4";
	case D3DFMT_A8: return "A8";
	case D3DFMT_L8: return "L8";
	case D3DFMT_A8L8: return "A8L8";
	default: break;
	}
	// Show FourCC codes as text when they are printable, otherwise the number.
	char Text[5] = {static_cast<char>(Format & 0xFF), static_cast<char>((Format >> 8) & 0xFF), static_cast<char>((Format >> 16) & 0xFF), static_cast<char>(Format >> 24), 0};
	bool bPrintable = true;
	for (int I = 0; I < 4; ++I) bPrintable = bPrintable && Text[I] >= 32 && Text[I] < 127;
	return bPrintable ? "unknown('" + std::string(Text) + "')" : "unknown(" + std::to_string(Format) + ")";
}

size_t MipSize(uint32_t Format, uint32_t Width, uint32_t Height)
{
	const size_t BlocksW = std::max<size_t>(1, (Width + 3) / 4);
	const size_t BlocksH = std::max<size_t>(1, (Height + 3) / 4);
	const size_t Pixels = static_cast<size_t>(Width) * Height;
	switch (Format)
	{
	case FourCC_DXT1:
	case FourCC_ATI1: return BlocksW * BlocksH * 8;
	case FourCC_DXT3:
	case FourCC_DXT5:
	case FourCC_ATI2: return BlocksW * BlocksH * 16;
	case D3DFMT_R8G8B8: return Pixels * 3;
	case D3DFMT_A8R8G8B8:
	case D3DFMT_X8R8G8B8: return Pixels * 4;
	case D3DFMT_R5G6B5:
	case D3DFMT_X1R5G5B5:
	case D3DFMT_A1R5G5B5:
	case D3DFMT_A4R4G4B4:
	case D3DFMT_A8L8: return Pixels * 2;
	case D3DFMT_A8:
	case D3DFMT_L8: return Pixels;
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

namespace
{

struct Rw4Section
{
	uint64_t Offset = 0;
	uint32_t Size = 0;
	uint32_t TypeCode = 0;
};

constexpr uint32_t Rw4TypeBaseResource = 0x10030;
constexpr uint32_t Rw4TypeRaster = 0x20003;
constexpr uint32_t Rw4TypeVertexDescription = 0x20004;
constexpr uint32_t Rw4TypeVertexBuffer = 0x20005;
constexpr uint32_t Rw4TypeIndexBuffer = 0x20007;
constexpr uint32_t Rw4TypeMesh = 0x20009;
constexpr uint32_t Rw4TypeCompiledState = 0x2000B;
constexpr uint32_t Rw4TypeTextureOverride = 0x20008;
constexpr uint32_t Rw4TypeMeshStateLink = 0x2001A;

// Bounds-checked little-endian cursor over one section.
struct Rw4Cursor
{
	const uint8_t* Data;
	size_t Size;
	size_t Pos = 0;
	bool bOk = true;

	uint32_t U32()
	{
		if (!bOk || Size - Pos < 4) { bOk = false; return 0; }
		const uint32_t V = TexLE32(Data + Pos);
		Pos += 4;
		return V;
	}
	uint16_t U16()
	{
		if (!bOk || Size - Pos < 2) { bOk = false; return 0; }
		const uint16_t V = TexLE16(Data + Pos);
		Pos += 2;
		return V;
	}
	void Skip(size_t Bytes)
	{
		if (!bOk || Size - Pos < Bytes) { bOk = false; return; }
		Pos += Bytes;
	}
};

// Walks a compiled material state (layout from SporeModder-FX MaterialStateCompiler.decompile)
// far enough to read its texture slots. Each slot's raster field is an object index.
bool ReadCompiledStateSlots(const uint8_t* Data, size_t Size, std::vector<std::pair<uint32_t, uint32_t>>& OutSlots)
{
	Rw4Cursor C{Data, Size};
	C.Skip(4);              // size
	C.U32();                // primitive type
	const uint32_t Flags1 = C.U32();
	C.U32();                // flags2
	const uint32_t Flags3 = C.U32();
	const uint32_t Field14 = C.U32();
	C.U32();                // renderer id
	C.Skip(4);              // padding

	if (Flags1 & 0x1) C.Skip((Flags1 & 0x2) ? 4 : 64); // model-to-world: object index or 4x4 floats
	if (Flags1 & 0x100000)
	{
		// Embedded vertex description: 24-byte header (count at +12) + 12 bytes per element.
		const size_t Start = C.Pos;
		C.Skip(12);
		const uint16_t Count = C.U16();
		C.Pos = Start;
		C.Skip(24 + 12ull * Count);
	}
	if (Flags1 & 0x8)
	{
		// Shader data: (index i16, offset i16, length i32, [offset bytes], data) until index 0.
		int16_t Index = static_cast<int16_t>(C.U16());
		while (C.bOk && Index != 0)
		{
			if (Index > 0)
			{
				const uint16_t Offset = C.U16();
				const uint32_t Length = C.U32();
				if (Length % 4 != 0) return false;
				C.Skip(Offset);
				C.Skip(Length);
				if (Length == 0) C.Skip(4);
			}
			Index = static_cast<int16_t>(C.U16());
		}
		C.Skip(6);
	}
	if (Flags1 & 0x10) C.Skip(16); // material colour RGBA
	if (Flags1 & 0x20) C.Skip(12); // ambient colour RGB
	for (int I = 0; I < 8; ++I)
	{
		if (Flags1 & (1u << (6 + I))) C.Skip(4);
	}
	if (Flags1 & 0x8000) C.Skip(17); // 17 booleans
	if (Flags1 & 0x10000) C.Skip(4);
	if (Flags1 & 0x20000) C.Skip(12);
	if (Flags1 & 0x40000) C.Skip(4);
	if (Flags1 & 0x80000) C.Skip(4);
	if (Field14 & 0x20000) C.Skip(28);
	if (Field14 & 0x40000) C.Skip(44);
	if (Field14 & 0x80000) C.Skip(44);
	if (Flags3 & 0x20000)
	{
		// Render state groups: group id, (state, value)* -1, ... until group -1.
		while (C.bOk && C.U32() != 0xFFFFFFFFu)
		{
			while (C.bOk && C.U32() != 0xFFFFFFFFu) C.U32();
		}
	}
	C.U32(); // palette entries index (-1 when absent)
	if (Flags3 & 0x1FFFF)
	{
		uint32_t Sampler;
		while (C.bOk && (Sampler = C.U32()) != 0xFFFFFFFFu)
		{
			const uint32_t Raster = C.U32();
			OutSlots.emplace_back(Sampler, Raster);
			for (int List = 0; List < 2; ++List) // texture stage states, then sampler states
			{
				if (C.U32() != 0)
				{
					while (C.bOk && C.U32() != 0xFFFFFFFFu) C.U32();
				}
			}
		}
	}
	return C.bOk;
}

// Resolves an object index to a section of the expected type, or nullptr. Indices whose top
// bits are non-zero refer to sub-references or "no object", which are not supported here.
const Rw4Section* Rw4Get(const std::vector<Rw4Section>& Sections, uint32_t Index, uint32_t Type, size_t FileSize, size_t MinSize)
{
	if ((Index >> 22) != 0 || Index >= Sections.size())
	{
		return nullptr;
	}
	const Rw4Section& S = Sections[Index];
	if (S.TypeCode != Type || S.Offset + MinSize > FileSize || (Type == Rw4TypeBaseResource && S.Offset + S.Size > FileSize))
	{
		return nullptr;
	}
	return &S;
}

float HalfToFloat(uint16_t H)
{
	const uint32_t Sign = static_cast<uint32_t>(H & 0x8000) << 16;
	uint32_t Exp = (H >> 10) & 0x1F;
	uint32_t Mant = H & 0x3FF;
	uint32_t Bits;
	if (Exp == 0)
	{
		if (Mant == 0)
		{
			Bits = Sign;
		}
		else
		{
			// Subnormal: normalise.
			Exp = 127 - 15 + 1;
			while ((Mant & 0x400) == 0)
			{
				Mant <<= 1;
				--Exp;
			}
			Mant &= 0x3FF;
			Bits = Sign | (Exp << 23) | (Mant << 13);
		}
	}
	else if (Exp == 31)
	{
		Bits = Sign | 0x7F800000 | (Mant << 13);
	}
	else
	{
		Bits = Sign | ((Exp + 127 - 15) << 23) | (Mant << 13);
	}
	float F;
	std::memcpy(&F, &Bits, sizeof(F));
	return F;
}

float TexLEFloat(const uint8_t* P)
{
	const uint32_t Bits = TexLE32(P);
	float F;
	std::memcpy(&F, &Bits, sizeof(F));
	return F;
}

// Reads Count components of a D3DDECLTYPE element. Returns false for unsupported types.
// bNormalEncoding applies Spore's unsigned-byte normal packing ((b - 127.5) / 127.5).
bool ReadElement(const uint8_t* P, uint8_t DeclType, int Count, bool bNormalEncoding, float* Out)
{
	switch (DeclType)
	{
	case 0: case 1: case 2: case 3: // FLOAT1..FLOAT4
		for (int I = 0; I < Count; ++I) Out[I] = I <= DeclType ? TexLEFloat(P + 4 * I) : 0.0f;
		return true;
	case 4: case 5: case 8: // D3DCOLOR, UBYTE4, UBYTE4N
		for (int I = 0; I < Count && I < 4; ++I)
		{
			const float B = P[I];
			Out[I] = bNormalEncoding ? (B - 127.5f) / 127.5f : (DeclType == 5 ? B : B / 255.0f);
		}
		return true;
	case 9: // SHORT2N
	case 10: // SHORT4N
		for (int I = 0; I < Count; ++I)
		{
			const int Max = DeclType == 9 ? 2 : 4;
			Out[I] = I < Max ? static_cast<int16_t>(TexLE16(P + 2 * I)) / 32767.0f : 0.0f;
		}
		return true;
	case 15: // FLOAT16_2
	case 16: // FLOAT16_4
		for (int I = 0; I < Count; ++I)
		{
			const int Max = DeclType == 15 ? 2 : 4;
			Out[I] = I < Max ? HalfToFloat(TexLE16(P + 2 * I)) : 0.0f;
		}
		return true;
	default:
		return false;
	}
}

size_t DeclTypeSize(uint8_t DeclType)
{
	static const uint8_t Sizes[] = {4, 8, 12, 16, 4, 4, 4, 8, 4, 4, 8, 4, 8, 4, 4, 4, 8};
	return DeclType < sizeof(Sizes) ? Sizes[DeclType] : 0;
}

struct VertexElementInfo
{
	uint16_t Offset = 0;
	uint8_t DeclType = 0;
	uint32_t Usage = 0; // Spore RW usage: 0 position, 2 normal, 6 texcoord0, 14/15 blend data
};

bool DecodeMesh(const uint8_t* Data, size_t Size, const std::vector<Rw4Section>& Sections, const Rw4Section& MeshSection, MeshData& Out, std::string& Issue)
{
	const uint8_t* M = Data + MeshSection.Offset;
	const uint32_t PrimitiveType = TexLE32(M + 4);
	const uint32_t IndexBufferIndex = TexLE32(M + 8);
	const uint32_t TriangleCount = TexLE32(M + 12);
	const uint32_t BufferCount = TexLE32(M + 16);
	const uint32_t FirstIndex = TexLE32(M + 20);
	const uint32_t FirstVertex = TexLE32(M + 28);
	const uint32_t VertexCount = TexLE32(M + 32);
	if (BufferCount == 0 || MeshSection.Offset + 36 + 4ull * BufferCount > Size)
	{
		Issue = "mesh without vertex buffer";
		return false;
	}
	if (PrimitiveType != 4 && PrimitiveType != 5)
	{
		Issue = "unsupported primitive type " + std::to_string(PrimitiveType);
		return false;
	}

	const Rw4Section* VB = Rw4Get(Sections, TexLE32(M + 36), Rw4TypeVertexBuffer, Size, 28);
	const Rw4Section* IB = Rw4Get(Sections, IndexBufferIndex, Rw4TypeIndexBuffer, Size, 28);
	if (!VB || !IB)
	{
		Issue = "vertex or index buffer is a blend shape or sub-reference";
		return false;
	}
	const uint8_t* V = Data + VB->Offset;
	const uint8_t* I = Data + IB->Offset;
	const uint32_t VertexSize = TexLE32(V + 20);
	const Rw4Section* Desc = Rw4Get(Sections, TexLE32(V), Rw4TypeVertexDescription, Size, 24);
	const Rw4Section* VData = Rw4Get(Sections, TexLE32(V + 24), Rw4TypeBaseResource, Size, 0);
	const Rw4Section* IData = Rw4Get(Sections, TexLE32(I + 24), Rw4TypeBaseResource, Size, 0);
	if (!Desc || !VData || !IData || VertexSize == 0)
	{
		Issue = "missing vertex description or buffer data";
		return false;
	}

	// Vertex layout.
	const uint8_t* D = Data + Desc->Offset;
	const uint16_t ElementCount = TexLE16(D + 12);
	if (Desc->Offset + 24 + 12ull * ElementCount > Size)
	{
		Issue = "truncated vertex description";
		return false;
	}
	const VertexElementInfo* Position = nullptr;
	const VertexElementInfo* Normal = nullptr;
	const VertexElementInfo* TexCoord = nullptr;
	std::vector<VertexElementInfo> Elements(ElementCount);
	for (uint16_t E = 0; E < ElementCount; ++E)
	{
		const uint8_t* El = D + 24 + 12 * E;
		Elements[E].Offset = TexLE16(El + 2);
		Elements[E].DeclType = El[4];
		Elements[E].Usage = TexLE32(El + 8);
	}
	for (const VertexElementInfo& E : Elements)
	{
		if (E.Usage == 0 && !Position) Position = &E;
		else if (E.Usage == 2 && !Normal) Normal = &E;
		else if (E.Usage == 6 && !TexCoord) TexCoord = &E;
		else if (E.Usage == 14 || E.Usage == 15) Out.bSkinned = true;
	}
	if (!Position)
	{
		Issue = "mesh has no position element";
		return false;
	}
	for (const VertexElementInfo* E : {Position, Normal, TexCoord})
	{
		if (E && (DeclTypeSize(E->DeclType) == 0 || E->Offset + DeclTypeSize(E->DeclType) > VertexSize))
		{
			Issue = "vertex element outside vertex stride";
			return false;
		}
	}

	// Vertices FirstVertex .. FirstVertex + VertexCount (as SporeModder-FX reads them).
	if ((static_cast<uint64_t>(FirstVertex) + VertexCount) * VertexSize > VData->Size)
	{
		Issue = "vertex range outside vertex data";
		return false;
	}
	const uint8_t* VBytes = Data + VData->Offset;
	Out.Positions.resize(3ull * VertexCount);
	if (Normal) Out.Normals.resize(3ull * VertexCount);
	if (TexCoord) Out.UVs.resize(2ull * VertexCount);
	for (uint32_t Vtx = 0; Vtx < VertexCount; ++Vtx)
	{
		const uint8_t* Base = VBytes + static_cast<size_t>(FirstVertex + Vtx) * VertexSize;
		if (!ReadElement(Base + Position->Offset, Position->DeclType, 3, false, &Out.Positions[3ull * Vtx]) ||
			(Normal && !ReadElement(Base + Normal->Offset, Normal->DeclType, 3, true, &Out.Normals[3ull * Vtx])) ||
			(TexCoord && !ReadElement(Base + TexCoord->Offset, TexCoord->DeclType, 2, false, &Out.UVs[2ull * Vtx])))
		{
			Issue = "unsupported vertex element type";
			return false;
		}
	}

	// Indices: 16- or 32-bit, offset by the index buffer's start and the mesh's first vertex.
	const uint32_t IndexFormat = TexLE32(I + 16);
	const int32_t StartIndex = static_cast<int32_t>(TexLE32(I + 4));
	const size_t IndexBytes = IndexFormat == 102 ? 4 : 2;
	const size_t IndexCount = PrimitiveType == 4 ? 3ull * TriangleCount : static_cast<size_t>(TriangleCount) + 2;
	if ((static_cast<uint64_t>(FirstIndex) + IndexCount) * IndexBytes > IData->Size)
	{
		Issue = "index range outside index data";
		return false;
	}
	const uint8_t* IBytes = Data + IData->Offset + static_cast<size_t>(FirstIndex) * IndexBytes;
	std::vector<uint32_t> Raw(IndexCount);
	for (size_t Idx = 0; Idx < IndexCount; ++Idx)
	{
		const int64_t Value = (IndexBytes == 4 ? TexLE32(IBytes + 4 * Idx) : TexLE16(IBytes + 2 * Idx)) + static_cast<int64_t>(StartIndex) - FirstVertex;
		if (Value < 0 || Value >= VertexCount)
		{
			Issue = "index out of vertex range";
			return false;
		}
		Raw[Idx] = static_cast<uint32_t>(Value);
	}
	if (PrimitiveType == 4)
	{
		Out.Indices = std::move(Raw);
	}
	else
	{
		// Triangle strip -> list, alternating winding and dropping degenerate triangles.
		for (size_t T = 0; T + 2 < Raw.size(); ++T)
		{
			const uint32_t A = Raw[T], B = Raw[T + 1], C = Raw[T + 2];
			if (A == B || B == C || A == C) continue;
			if (T % 2 == 0) Out.Indices.insert(Out.Indices.end(), {A, B, C});
			else Out.Indices.insert(Out.Indices.end(), {B, A, C});
		}
	}
	return true;
}

} // namespace

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

	std::vector<Rw4Section> Sections(Out.SectionCount);
	for (uint32_t I = 0; I < Out.SectionCount; ++I)
	{
		const uint8_t* Info = Data + SectionTable + I * SectionInfoSize;
		Sections[I].Offset = TexLE32(Info);
		Sections[I].Size = TexLE32(Info + 8);
		Sections[I].TypeCode = TexLE32(Info + 20);
		// Base resources (raw buffers) are addressed relative to the buffer data block.
		if (Sections[I].TypeCode == Rw4TypeBaseResource)
		{
			Sections[I].Offset += BufferData;
		}
	}

	std::vector<int32_t> MeshOfSection(Sections.size(), -1);
	std::vector<int32_t> TextureOfSection(Sections.size(), -1);
	for (size_t SectionIndex = 0; SectionIndex < Sections.size(); ++SectionIndex)
	{
		const Rw4Section& Section = Sections[SectionIndex];
		if (Section.TypeCode == Rw4TypeMesh)
		{
			if (Section.Offset + 36 > Size)
			{
				Error = "mesh section outside file";
				return false;
			}
			MeshData Mesh;
			std::string Issue;
			if (DecodeMesh(Data, Size, Sections, Section, Mesh, Issue))
			{
				MeshOfSection[SectionIndex] = static_cast<int32_t>(Out.Meshes.size());
				Out.Meshes.push_back(std::move(Mesh));
			}
			else
			{
				++Out.SkippedMeshes;
				Out.MeshIssues.push_back(Issue);
			}
			continue;
		}
		if (Section.TypeCode != Rw4TypeRaster)
		{
			continue;
		}
		// format u32, flags u16, depth u16, dxBase u32, width u16, height u16, field_10 u8,
		// mips u8, pad u16, field_14 u32, field_18 u32, data index u32 (32 bytes).
		if (Section.Offset + 32 > Size)
		{
			Error = "raster section outside file";
			return false;
		}
		const uint8_t* R = Data + Section.Offset;
		TextureImage Image;
		Image.Format = TexLE32(R);
		const uint16_t Flags = TexLE16(R + 4);
		Image.bCube = (Flags & 0x1000) != 0;
		Image.Width = TexLE16(R + 12);
		Image.Height = TexLE16(R + 14);
		Image.MipCount = R[17];
		const Rw4Section* Buffer = Rw4Get(Sections, TexLE32(R + 28), Rw4TypeBaseResource, Size, 0);
		if (!Buffer)
		{
			++Out.SkippedTextures;
			continue;
		}
		Image.Data.assign(Data + Buffer->Offset, Data + Buffer->Offset + Buffer->Size);
		TextureOfSection[SectionIndex] = static_cast<int32_t>(Out.Textures.size());
		Out.Textures.push_back(std::move(Image));
	}

	// Materials: mesh/compiled-state links name the states whose texture slots apply to a mesh.
	for (const Rw4Section& Link : Sections)
	{
		if (Link.TypeCode != Rw4TypeMeshStateLink || Link.Offset + 8 > Size)
		{
			continue;
		}
		Rw4Cursor C{Data + Link.Offset, Size - Link.Offset};
		const uint32_t MeshIndex = C.U32();
		const uint32_t StateCount = C.U32();
		if (!C.bOk || (MeshIndex >> 22) != 0 || MeshIndex >= Sections.size() || MeshOfSection[MeshIndex] < 0)
		{
			continue;
		}
		MeshData& Mesh = Out.Meshes[MeshOfSection[MeshIndex]];
		for (uint32_t S = 0; S < StateCount && C.bOk; ++S)
		{
			const Rw4Section* State = Rw4Get(Sections, C.U32(), Rw4TypeCompiledState, Size, 0);
			std::vector<std::pair<uint32_t, uint32_t>> Slots;
			if (!State || State->Offset + State->Size > Size || !ReadCompiledStateSlots(Data + State->Offset, State->Size, Slots))
			{
				++Out.UnreadableMaterials;
				continue;
			}
			for (const auto& [Sampler, RasterIndex] : Slots)
			{
				MeshTextureSlot Slot;
				Slot.Sampler = Sampler;
				if ((RasterIndex >> 22) == 0 && RasterIndex < Sections.size())
				{
					const Rw4Section& Target = Sections[RasterIndex];
					if (Target.TypeCode == Rw4TypeRaster)
					{
						Slot.TextureIndex = TextureOfSection[RasterIndex];
					}
					else if (Target.TypeCode == Rw4TypeTextureOverride && Target.Offset + 4 <= Size && TexLE32(Data + Target.Offset) == 0xFB724FAAu)
					{
						const char* Name = reinterpret_cast<const char*>(Data + Target.Offset + 4);
						const size_t MaxLen = static_cast<size_t>(Size - Target.Offset - 4);
						Slot.OverrideName.assign(Name, strnlen(Name, MaxLen));
					}
				}
				Mesh.TextureSlots.push_back(std::move(Slot));
			}
		}
	}
	return true;
}

const MeshTextureSlot* DiffuseSlot(const MeshData& Mesh)
{
	for (const MeshTextureSlot& Slot : Mesh.TextureSlots)
	{
		if (Slot.Sampler == 0) return &Slot;
	}
	return Mesh.TextureSlots.empty() ? nullptr : &Mesh.TextureSlots.front();
}

std::string MeshToObj(const MeshData& Mesh, const std::string& Name, const std::string& MaterialLibrary, const std::string& MaterialName)
{
	std::string Out = "# Exported by spore2-scan from Spore RenderWare 4 data\n";
	if (!MaterialLibrary.empty()) Out += "mtllib " + MaterialLibrary + "\n";
	Out += "o " + Name + "\n";
	if (!MaterialName.empty()) Out += "usemtl " + MaterialName + "\n";
	char Line[128];
	const size_t Count = Mesh.VertexCount();
	for (size_t V = 0; V < Count; ++V)
	{
		std::snprintf(Line, sizeof(Line), "v %g %g %g\n", Mesh.Positions[3 * V], Mesh.Positions[3 * V + 1], Mesh.Positions[3 * V + 2]);
		Out += Line;
	}
	for (size_t V = 0; V < Count && !Mesh.UVs.empty(); ++V)
	{
		// OBJ's V axis points up, Direct3D's points down.
		std::snprintf(Line, sizeof(Line), "vt %g %g\n", Mesh.UVs[2 * V], 1.0f - Mesh.UVs[2 * V + 1]);
		Out += Line;
	}
	for (size_t V = 0; V < Count && !Mesh.Normals.empty(); ++V)
	{
		std::snprintf(Line, sizeof(Line), "vn %g %g %g\n", Mesh.Normals[3 * V], Mesh.Normals[3 * V + 1], Mesh.Normals[3 * V + 2]);
		Out += Line;
	}
	const bool bUV = !Mesh.UVs.empty();
	const bool bN = !Mesh.Normals.empty();
	for (size_t T = 0; T + 2 < Mesh.Indices.size(); T += 3)
	{
		Out += "f";
		for (size_t K = 0; K < 3; ++K)
		{
			const uint32_t Idx = Mesh.Indices[T + K] + 1;
			if (bUV && bN) std::snprintf(Line, sizeof(Line), " %u/%u/%u", Idx, Idx, Idx);
			else if (bUV) std::snprintf(Line, sizeof(Line), " %u/%u", Idx, Idx);
			else if (bN) std::snprintf(Line, sizeof(Line), " %u//%u", Idx, Idx);
			else std::snprintf(Line, sizeof(Line), " %u", Idx);
			Out += Line;
		}
		Out += "\n";
	}
	return Out;
}

void WriteDds(const TextureImage& Image, std::vector<uint8_t>& Out)
{
	Out.clear();
	const bool bCompressed = IsBlockCompressed(Image.Format);
	UncompressedLayout Layout{32, 0x00FF0000, 0x0000FF00, 0x000000FF, 0xFF000000, 0x41};
	if (!bCompressed) GetUncompressedLayout(Image.Format, Layout);
	const uint32_t BitCount = bCompressed ? 0 : Layout.Bits;
	const uint32_t PixelFlags = bCompressed ? 0x4 : Layout.Flags; // FOURCC or the layout's flags
	const uint32_t RMask = bCompressed ? 0 : Layout.R, GMask = bCompressed ? 0 : Layout.G, BMask = bCompressed ? 0 : Layout.B, AMask = bCompressed ? 0 : Layout.A;

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
		Error = "unsupported texture format " + TextureFormatName(Image.Format);
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
		const size_t BlockBytes = (Image.Format == FourCC_DXT1 || Image.Format == FourCC_ATI1) ? 8 : 16;
		const uint32_t BlocksW = std::max(1u, (W + 3) / 4);
		const uint32_t BlocksH = std::max(1u, (H + 3) / 4);
		for (uint32_t By = 0; By < BlocksH; ++By)
		{
			for (uint32_t Bx = 0; Bx < BlocksW; ++Bx)
			{
				const uint8_t* Block = Src + (static_cast<size_t>(By) * BlocksW + Bx) * BlockBytes;
				uint8_t Pixels[16][4];
				if (Image.Format == FourCC_ATI1 || Image.Format == FourCC_ATI2)
				{
					// BC4/BC5 channels use DXT5-style alpha blocks. ATI1 -> grey; ATI2 -> red, green,
					// and blue rebuilt as a unit normal's Z.
					uint8_t First[16][4], Second[16][4];
					DecodeDxt5Alpha(Block, First);
					if (Image.Format == FourCC_ATI2) DecodeDxt5Alpha(Block + 8, Second);
					for (int I = 0; I < 16; ++I)
					{
						if (Image.Format == FourCC_ATI1)
						{
							Pixels[I][0] = Pixels[I][1] = Pixels[I][2] = First[I][3];
						}
						else
						{
							Pixels[I][0] = First[I][3];
							Pixels[I][1] = Second[I][3];
							const float X = Pixels[I][0] / 127.5f - 1.0f, Y = Pixels[I][1] / 127.5f - 1.0f;
							const float Z2 = 1.0f - X * X - Y * Y;
							Pixels[I][2] = static_cast<uint8_t>((Z2 > 0.0f ? std::sqrt(Z2) : 0.0f) * 127.5f + 127.5f);
						}
						Pixels[I][3] = 255;
					}
				}
				else if (Image.Format == FourCC_DXT1)
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
		case D3DFMT_X8R8G8B8:
			Dst[0] = Src[I * 4 + 2];
			Dst[1] = Src[I * 4 + 1];
			Dst[2] = Src[I * 4 + 0];
			Dst[3] = Image.Format == D3DFMT_A8R8G8B8 ? Src[I * 4 + 3] : 255;
			break;
		case D3DFMT_R8G8B8:
			Dst[0] = Src[I * 3 + 2];
			Dst[1] = Src[I * 3 + 1];
			Dst[2] = Src[I * 3 + 0];
			Dst[3] = 255;
			break;
		case D3DFMT_R5G6B5:
		case D3DFMT_X1R5G5B5:
		case D3DFMT_A1R5G5B5:
		case D3DFMT_A4R4G4B4:
		{
			const uint32_t P = TexLE16(Src + I * 2);
			if (Image.Format == D3DFMT_R5G6B5)
			{
				Dst[0] = Expand((P >> 11) & 0x1F, 5); Dst[1] = Expand((P >> 5) & 0x3F, 6); Dst[2] = Expand(P & 0x1F, 5); Dst[3] = 255;
			}
			else if (Image.Format == D3DFMT_A4R4G4B4)
			{
				Dst[0] = Expand((P >> 8) & 0xF, 4); Dst[1] = Expand((P >> 4) & 0xF, 4); Dst[2] = Expand(P & 0xF, 4); Dst[3] = Expand(P >> 12, 4);
			}
			else
			{
				Dst[0] = Expand((P >> 10) & 0x1F, 5); Dst[1] = Expand((P >> 5) & 0x1F, 5); Dst[2] = Expand(P & 0x1F, 5);
				Dst[3] = (Image.Format == D3DFMT_A1R5G5B5 && !(P & 0x8000)) ? 0 : 255;
			}
			break;
		}
		case D3DFMT_L8:
			Dst[0] = Dst[1] = Dst[2] = Src[I];
			Dst[3] = 255;
			break;
		case D3DFMT_A8L8:
			Dst[0] = Dst[1] = Dst[2] = Src[I * 2];
			Dst[3] = Src[I * 2 + 1];
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
