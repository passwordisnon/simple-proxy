// Unit tests for the engine-independent Spore2Interop core, on synthetic data.

#include "SporeCore/SporeCreation.h"
#include "SporeCore/SporeDbpf.h"
#include "SporeCore/SporePng.h"
#include "SporeCore/SporeProp.h"
#include "SporeCore/SporeTexture.h"
#include "SporeCore/SporeTextureGen.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <unordered_map>
#include <vector>

using namespace sporecore;

static int Failures = 0;

#define CHECK(Cond)                                                        \
	do                                                                     \
	{                                                                      \
		if (!(Cond))                                                       \
		{                                                                  \
			std::printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #Cond); \
			++Failures;                                                    \
		}                                                                  \
	} while (0)

static void PutLE32(std::vector<uint8_t>& B, size_t At, uint32_t V)
{
	for (int I = 0; I < 4; ++I) B[At + I] = static_cast<uint8_t>(V >> (8 * I));
}

static void AppendLE32(std::vector<uint8_t>& B, uint32_t V)
{
	for (int I = 0; I < 4; ++I) B.push_back(static_cast<uint8_t>(V >> (8 * I)));
}

static void AppendBE32(std::vector<uint8_t>& B, uint32_t V)
{
	for (int I = 3; I >= 0; --I) B.push_back(static_cast<uint8_t>(V >> (8 * I)));
}

// "abc" literal + copy(len 6, offset 3) -> "abcabcabc"
static const std::vector<uint8_t> RefPackAbc = {0x10, 0xFB, 0x00, 0x00, 0x09, 0x0F, 0x02, 'a', 'b', 'c', 0xFC};

static void TestRefPack()
{
	std::vector<uint8_t> Out;
	CHECK(RefPackDecompress(RefPackAbc.data(), RefPackAbc.size(), Out));
	CHECK(std::string(Out.begin(), Out.end()) == "abcabcabc");

	// Long literal block (0xE0..0xFB) followed by a terminator carrying 1 byte.
	std::vector<uint8_t> Lit = {0x10, 0xFB, 0x00, 0x00, 0x09, 0xE1};
	for (char C : std::string("12345678")) Lit.push_back(static_cast<uint8_t>(C));
	Lit.push_back(0xFD);
	Lit.push_back('9');
	CHECK(RefPackDecompress(Lit.data(), Lit.size(), Out));
	CHECK(std::string(Out.begin(), Out.end()) == "123456789");

	// Back-reference before any output must be rejected, not read out of bounds.
	const std::vector<uint8_t> Bad = {0x10, 0xFB, 0x00, 0x00, 0x05, 0x08, 0x00, 0xFC};
	CHECK(!RefPackDecompress(Bad.data(), Bad.size(), Out));

	// Declared size larger than produced data.
	std::vector<uint8_t> Short = RefPackAbc;
	Short[4] = 0x20;
	CHECK(!RefPackDecompress(Short.data(), Short.size(), Out));

	CHECK(!RefPackDecompress(RefPackAbc.data(), 3, Out));
}

static std::vector<uint8_t> BuildPackage(bool bSharedType)
{
	std::vector<uint8_t> File(DbpfHeaderSize, 0);
	File[0] = 'D'; File[1] = 'B'; File[2] = 'P'; File[3] = 'F';
	PutLE32(File, 4, 2);
	PutLE32(File, 8, 0);

	const std::string Plain = "hello spore";
	const uint32_t PlainOffset = static_cast<uint32_t>(File.size());
	File.insert(File.end(), Plain.begin(), Plain.end());
	const uint32_t PackedOffset = static_cast<uint32_t>(File.size());
	File.insert(File.end(), RefPackAbc.begin(), RefPackAbc.end());

	const uint32_t IndexOffset = static_cast<uint32_t>(File.size());
	const uint32_t Type = 0x00B1B104;
	AppendLE32(File, bSharedType ? 1u : 0u);
	if (bSharedType) AppendLE32(File, Type);

	auto AddEntry = [&](uint32_t Group, uint32_t Instance, uint32_t Offset, uint32_t CSize, uint32_t MSize, bool bCompressed)
	{
		if (!bSharedType) AppendLE32(File, Type);
		AppendLE32(File, Group);
		AppendLE32(File, 0); // unknown / instance-high
		AppendLE32(File, Instance);
		AppendLE32(File, Offset);
		AppendLE32(File, CSize | 0x80000000u);
		AppendLE32(File, MSize);
		File.push_back(bCompressed ? 0xFF : 0x00);
		File.push_back(bCompressed ? 0xFF : 0x00);
		File.push_back(0x01);
		File.push_back(0x00);
	};
	AddEntry(0x40404000, FnvHash("plain"), PlainOffset, static_cast<uint32_t>(Plain.size()), static_cast<uint32_t>(Plain.size()), false);
	AddEntry(0x40404000, FnvHash("packed"), PackedOffset, static_cast<uint32_t>(RefPackAbc.size()), 9, true);

	PutLE32(File, 36, 2);
	PutLE32(File, 44, static_cast<uint32_t>(File.size() - IndexOffset));
	PutLE32(File, 60, 3);
	PutLE32(File, 64, IndexOffset);
	return File;
}

static void TestDbpf(bool bSharedType)
{
	const std::vector<uint8_t> File = BuildPackage(bSharedType);
	DbpfHeader Header;
	CHECK(ParseHeader(File.data(), File.size(), File.size(), Header) == DbpfError::None);
	CHECK(Header.IndexEntryCount == 2);

	std::vector<IndexEntry> Entries;
	CHECK(ParseIndex(File.data() + Header.IndexOffset, Header.IndexSize, Header, File.size(), Entries) == DbpfError::None);
	CHECK(Entries.size() == 2);
	if (Entries.size() != 2) return;

	CHECK(Entries[0].Key.Type == 0x00B1B104);
	CHECK(Entries[0].Key.Instance == FnvHash("plain"));
	CHECK(!Entries[0].bCompressed);
	CHECK(Entries[1].bCompressed);
	CHECK(Entries[1].CompressedSize == RefPackAbc.size()); // high bit masked off

	std::vector<uint8_t> Out;
	CHECK(DecodeEntry(Entries[0], File.data() + Entries[0].Offset, Entries[0].CompressedSize, Out) == DbpfError::None);
	CHECK(std::string(Out.begin(), Out.end()) == "hello spore");
	CHECK(DecodeEntry(Entries[1], File.data() + Entries[1].Offset, Entries[1].CompressedSize, Out) == DbpfError::None);
	CHECK(std::string(Out.begin(), Out.end()) == "abcabcabc");

	std::vector<std::string> Issues;
	ValidateIndex(Entries, File.size(), Issues);
	CHECK(Issues.empty());

	// Truncated index, bad magic, wrong version, index past EOF.
	CHECK(ParseIndex(File.data() + Header.IndexOffset, Header.IndexSize - 1, Header, File.size(), Entries) == DbpfError::TruncatedIndex);
	std::vector<uint8_t> Broken = File;
	Broken[0] = 'X';
	CHECK(ParseHeader(Broken.data(), Broken.size(), Broken.size(), Header) == DbpfError::BadMagic);
	Broken = File;
	PutLE32(Broken, 4, 3);
	CHECK(ParseHeader(Broken.data(), Broken.size(), Broken.size(), Header) == DbpfError::UnsupportedVersion);
	Broken = File;
	PutLE32(Broken, 64, static_cast<uint32_t>(File.size()));
	CHECK(ParseHeader(Broken.data(), Broken.size(), Broken.size(), Header) == DbpfError::IndexOutOfRange);
}

static void TestValidate()
{
	std::vector<IndexEntry> Entries(2);
	Entries[0].Key = {1, 2, 3};
	Entries[0].Offset = 100;
	Entries[0].CompressedSize = Entries[0].MemSize = 50;
	Entries[1] = Entries[0];
	Entries[1].Offset = 120; // overlaps and duplicates the key
	std::vector<std::string> Issues;
	ValidateIndex(Entries, 1000, Issues);
	CHECK(Issues.size() == 2);
}

static void TestFnv()
{
	// FNV-1 32-bit reference values; hashing is case-insensitive.
	CHECK(FnvHash("") == 0x811C9DC5u);
	CHECK(FnvHash("a") == 0x050C5D7Eu);
	CHECK(FnvHash("CreatureEditor") == FnvHash("creatureeditor"));
}

static void AppendChunk(std::vector<uint8_t>& Png, const char* Type, const std::vector<uint8_t>& Body)
{
	AppendBE32(Png, static_cast<uint32_t>(Body.size()));
	std::vector<uint8_t> Crc(Type, Type + 4);
	Crc.insert(Crc.end(), Body.begin(), Body.end());
	Png.insert(Png.end(), Crc.begin(), Crc.end());
	AppendBE32(Png, Crc32(Crc.data(), Crc.size()));
}

static void TestPng()
{
	std::vector<uint8_t> Png = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
	std::vector<uint8_t> Ihdr;
	AppendBE32(Ihdr, 128);
	AppendBE32(Ihdr, 128);
	Ihdr.insert(Ihdr.end(), {8, 6, 0, 0, 0});
	AppendChunk(Png, "IHDR", Ihdr);
	const std::string Text = std::string("Comment") + '\0' + "spore card";
	AppendChunk(Png, "tEXt", std::vector<uint8_t>(Text.begin(), Text.end()));
	const std::string ZText = std::string("Packed") + '\0' + '\0' + "ZZ";
	AppendChunk(Png, "zTXt", std::vector<uint8_t>(ZText.begin(), ZText.end()));
	AppendChunk(Png, "IEND", {});

	InflateFn FakeInflate = [](const uint8_t* Data, size_t Size, std::vector<uint8_t>& Out)
	{
		Out.assign(Data, Data + Size);
		Out.push_back('!');
		return true;
	};

	PngInfo Info;
	CHECK(ReadPngChunks(Png.data(), Png.size(), FakeInflate, Info));
	CHECK(Info.LooksLikeSporeCard());
	CHECK(Info.Issues.empty());
	CHECK(Info.TextChunks.size() == 2);
	if (Info.TextChunks.size() == 2)
	{
		CHECK(Info.TextChunks[0].Keyword == "Comment");
		CHECK(std::string(Info.TextChunks[0].Value.begin(), Info.TextChunks[0].Value.end()) == "spore card");
		CHECK(Info.TextChunks[1].bInflated);
		CHECK(std::string(Info.TextChunks[1].Value.begin(), Info.TextChunks[1].Value.end()) == "ZZ!");
	}

	Png[Png.size() - 20] ^= 0xFF; // corrupt a byte inside the zTXt chunk
	PngInfo Corrupt;
	CHECK(ReadPngChunks(Png.data(), Png.size(), nullptr, Corrupt));
	CHECK(!Corrupt.Issues.empty());

	const uint8_t NotPng[8] = {0};
	PngInfo None;
	CHECK(!ReadPngChunks(NotPng, sizeof(NotPng), nullptr, None));
}

static void TestTextureGen()
{
	// Flat texture -> straight-up normals; vertical edge -> X-tilted normals.
	const int W = 4, H = 4;
	std::vector<uint8_t> Flat(W * H * 4, 128);
	std::vector<uint8_t> Normal;
	GenerateNormalMap(Flat.data(), W, H, 2.0f, Normal);
	CHECK(Normal[0] == 128 && Normal[1] == 128 && Normal[2] == 255);

	std::vector<uint8_t> Edge(W * H * 4, 0);
	for (int Y = 0; Y < H; ++Y)
		for (int X = 2; X < W; ++X)
			for (int C = 0; C < 3; ++C) Edge[(Y * W + X) * 4 + C] = 255;
	GenerateNormalMap(Edge.data(), W, H, 2.0f, Normal);
	const uint8_t* Mid = &Normal[(1 * W + 1) * 4];
	CHECK(Mid[0] < 100);   // tilted away from the brighter side
	CHECK(Mid[1] == 128);  // no vertical gradient

	std::vector<uint8_t> Rough;
	GenerateRoughnessMap(Flat.data(), W, H, 0.2f, 0.9f, Rough);
	CHECK(Rough[0] == 51);
}


static void AppendBE16(std::vector<uint8_t>& B, uint16_t V)
{
	B.push_back(static_cast<uint8_t>(V >> 8));
	B.push_back(static_cast<uint8_t>(V));
}

static void AppendLEFloat(std::vector<uint8_t>& B, float F)
{
	uint32_t Bits;
	std::memcpy(&Bits, &F, 4);
	AppendLE32(B, Bits);
}

static void AppendBEFloat(std::vector<uint8_t>& B, float F)
{
	uint32_t Bits;
	std::memcpy(&Bits, &F, 4);
	AppendBE32(B, Bits);
}

static void PropHeader(std::vector<uint8_t>& B, uint32_t Id, uint16_t Type, bool bArray, uint32_t Count = 0, uint32_t ItemSize = 0)
{
	AppendBE32(B, Id);
	AppendBE16(B, Type);
	AppendBE16(B, bArray ? 0x30 : 0x00);
	if (bArray)
	{
		AppendBE32(B, Count);
		AppendBE32(B, ItemSize);
	}
}

static void TestProp()
{
	std::vector<uint8_t> P;
	AppendBE32(P, 10); // property count

	PropHeader(P, 1, 0x0001, false); P.push_back(1);                       // bool
	PropHeader(P, 2, 0x0009, false); AppendBE32(P, static_cast<uint32_t>(-5)); // int32
	PropHeader(P, 3, 0x000D, false); AppendBEFloat(P, 1.5f);               // float
	PropHeader(P, 4, 0x0012, true, 1, 0); AppendBE32(P, 5); for (char C : std::string("hello")) P.push_back(static_cast<uint8_t>(C)); // string8[1]
	PropHeader(P, 5, 0x0013, true, 1, 0); AppendBE32(P, 2); P.insert(P.end(), {'h', 0, 'i', 0}); // string16[1]
	PropHeader(P, 6, 0x0020, false); AppendLE32(P, 0x11); AppendLE32(P, 0x22); AppendLE32(P, 0x33); AppendLE32(P, 0); // key + pad
	PropHeader(P, 7, 0x0020, true, 2, 12);
	for (uint32_t I = 0; I < 2; ++I) { AppendLE32(P, 0xA0 + I); AppendLE32(P, 0xB0); AppendLE32(P, 0xC0); } // key[2], no pad
	PropHeader(P, 8, 0x0031, false); AppendLEFloat(P, 1); AppendLEFloat(P, 2); AppendLEFloat(P, 3); AppendLE32(P, 0); // vector3 + pad
	PropHeader(P, 9, 0x0022, true, 1, 520);
	AppendLE32(P, 0xDEAD); AppendLE32(P, 0xBEEF);
	{
		std::vector<uint8_t> Slot(512, 0);
		Slot[0] = 'O'; Slot[2] = 'K';
		P.insert(P.end(), Slot.begin(), Slot.end());
	}
	PropHeader(P, 10, 0x0777, true, 2, 3); P.insert(P.end(), {1, 2, 3, 4, 5, 6}); // unknown type array, skipped by size

	PropertyList List;
	const bool bOk = ParsePropertyList(P.data(), P.size(), List);
	if (!bOk) std::printf("prop error: %s\n", List.Error.c_str());
	CHECK(bOk);
	CHECK(List.Properties.size() == 10);
	if (List.Properties.size() != 10) return;

	CHECK(List.Properties[0].Integers[0] == 1);
	CHECK(List.Properties[1].Integers[0] == -5);
	CHECK(List.Properties[2].Floats[0] == 1.5);
	CHECK(List.Properties[3].Strings[0] == "hello");
	CHECK(List.Properties[4].Strings[0] == "hi");
	CHECK(List.Properties[5].Keys[0].Instance == 0x11 && List.Properties[5].Keys[0].Type == 0x22 && List.Properties[5].Keys[0].Group == 0x33);
	CHECK(List.Properties[6].Keys.size() == 2 && List.Properties[6].Keys[1].Instance == 0xA1);
	CHECK(List.Properties[7].Floats.size() == 3 && List.Properties[7].Floats[2] == 3.0);
	CHECK(List.Properties[8].Texts[0].TableId == 0xDEAD && List.Properties[8].Texts[0].Fallback == "OK");
	CHECK(List.Properties[9].bArray && List.Properties[9].Count == 2);

	CHECK(FormatProperty(List.Properties[2], "scale") == "scale float = 1.5");
	CHECK(FormatProperty(List.Properties[6], "") == "0x00000007 key[2] = {000000C0!000000A0.000000B0, 000000C0!000000A1.000000B0}");

	IdNamer Namer = [](uint32_t Id, bool bType) -> std::string
	{
		if (bType) return Id == 0xB0 ? "prop" : "";
		return Id == 0xC0 ? "editor_setup~" : "";
	};
	CHECK(FormatProperty(List.Properties[6], "parts", Namer) == "parts key[2] = {editor_setup~!0x000000A0.prop, editor_setup~!0x000000A1.prop}");

	// Truncation and trailing garbage are reported, not read past.
	PropertyList Short;
	CHECK(!ParsePropertyList(P.data(), P.size() - 1, Short));
	CHECK(!Short.Error.empty());
	std::vector<uint8_t> Extra = P;
	Extra.push_back(0);
	PropertyList Trailing;
	CHECK(!ParsePropertyList(Extra.data(), Extra.size(), Trailing));

	// A single property of unknown type cannot be skipped safely.
	std::vector<uint8_t> Unknown;
	AppendBE32(Unknown, 1);
	PropHeader(Unknown, 1, 0x0777, false);
	PropertyList UnknownList;
	CHECK(!ParsePropertyList(Unknown.data(), Unknown.size(), UnknownList));
}

static void TestRegistry()
{
	std::unordered_map<uint32_t, std::string> Names;
	const std::string Text = "description\t0x00B2CCCA\n# comment\n\npng.dds 0xb8444447\nsoundProp\t0x2b9f662\naudioProp\t0x2b9f662\nCakeEditor\nbroken\tzz\n";
	CHECK(ParseNameRegistry(Text, Names) == 4);
	CHECK(Names[0x00B2CCCA] == "description");
	CHECK(Names[0xB8444447] == "png.dds");
	CHECK(Names[0x02B9F662] == "soundProp"); // first name wins
	CHECK(Names[FnvHash("CakeEditor")] == "CakeEditor");
}

static void TestTextures()
{
	// DXT1 block: color0 = pure red (0xF800), color1 = pure blue (0x001F), C0 > C1 -> 4-colour mode.
	// Index pattern row 0: 0,1,2,3 ; other rows all 0.
	const std::vector<uint8_t> Dxt1Block = {0x00, 0xF8, 0x1F, 0x00, 0xE4, 0x00, 0x00, 0x00};

	std::vector<uint8_t> Raster;
	AppendLE32(Raster, 1);           // version
	AppendLE32(Raster, 4);           // width
	AppendLE32(Raster, 4);           // height
	AppendLE32(Raster, 1);           // mips
	AppendLE32(Raster, 8);           // pixel width
	AppendLE32(Raster, FourCC_DXT1); // format
	AppendLE32(Raster, 8);
	Raster.insert(Raster.end(), Dxt1Block.begin(), Dxt1Block.end());

	TextureImage Image;
	std::string Error;
	CHECK(ParseRaster(Raster.data(), Raster.size(), Image, Error));
	CHECK(Image.Width == 4 && Image.Height == 4 && Image.Format == FourCC_DXT1 && Image.Data.size() == 8);
	CHECK(!ParseRaster(Raster.data(), Raster.size() - 1, Image, Error));

	CHECK(ParseRaster(Raster.data(), Raster.size(), Image, Error));
	std::vector<uint8_t> Rgba;
	CHECK(DecodeToRgba(Image, Rgba, Error));
	CHECK(Rgba.size() == 64);
	CHECK(Rgba[0] == 255 && Rgba[1] == 0 && Rgba[2] == 0 && Rgba[3] == 255);   // index 0: red
	CHECK(Rgba[4] == 0 && Rgba[5] == 0 && Rgba[6] == 255);                      // index 1: blue
	CHECK(Rgba[8] == 170 && Rgba[10] == 85);                                    // index 2: 2/3 red + 1/3 blue
	CHECK(Rgba[12] == 85 && Rgba[14] == 170);                                   // index 3

	// DXT1 3-colour mode (C0 <= C1): index 3 is transparent black.
	TextureImage Punch = Image;
	Punch.Data = {0x1F, 0x00, 0x00, 0xF8, 0xC0, 0x00, 0x00, 0x00};
	CHECK(DecodeToRgba(Punch, Rgba, Error));
	CHECK(Rgba[12] == 0 && Rgba[15] == 0);

	// DXT5: alpha endpoints 255/0, index 1 everywhere (all alpha 0) ; colour block as above.
	TextureImage Dxt5 = Image;
	Dxt5.Format = FourCC_DXT5;
	Dxt5.Data = {255, 0, 0x49, 0x92, 0x24, 0x49, 0x92, 0x24};
	Dxt5.Data.insert(Dxt5.Data.end(), Dxt1Block.begin(), Dxt1Block.end());
	CHECK(DecodeToRgba(Dxt5, Rgba, Error));
	CHECK(Rgba[3] == 0 && Rgba[0] == 255);

	// Uncompressed A8R8G8B8 is stored B,G,R,A.
	TextureImage Argb;
	Argb.Width = Argb.Height = 1;
	Argb.MipCount = 1;
	Argb.Format = D3DFMT_A8R8G8B8;
	Argb.Data = {10, 20, 30, 40};
	CHECK(DecodeToRgba(Argb, Rgba, Error));
	CHECK(Rgba[0] == 30 && Rgba[1] == 20 && Rgba[2] == 10 && Rgba[3] == 40);

	// 16-bit, luminance and BC4/BC5 formats.
	TextureImage One;
	One.Width = One.Height = 1;
	One.MipCount = 1;
	One.Format = D3DFMT_R5G6B5;
	One.Data = {0x00, 0xF8}; // pure red
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[0] == 255 && Rgba[1] == 0 && Rgba[2] == 0 && Rgba[3] == 255);
	One.Format = D3DFMT_A4R4G4B4;
	One.Data = {0xF0, 0x8F}; // A=8, R=F, G=F, B=0
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[0] == 255 && Rgba[1] == 255 && Rgba[2] == 0 && Rgba[3] == 136);
	One.Format = D3DFMT_A1R5G5B5;
	One.Data = {0x1F, 0x00}; // blue, alpha bit clear
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[2] == 255 && Rgba[3] == 0);
	One.Format = D3DFMT_L8;
	One.Data = {77};
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[0] == 77 && Rgba[2] == 77 && Rgba[3] == 255);
	One.Format = D3DFMT_A8L8;
	One.Data = {10, 200};
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[1] == 10 && Rgba[3] == 200);
	One.Format = D3DFMT_X8R8G8B8;
	One.Data = {1, 2, 3, 0};
	CHECK(DecodeToRgba(One, Rgba, Error) && Rgba[0] == 3 && Rgba[2] == 1 && Rgba[3] == 255);

	// ATI2 normal map: both channels at their midpoint (index 0 = endpoint a0 = 128) -> flat normal.
	TextureImage Ati2;
	Ati2.Width = Ati2.Height = 4;
	Ati2.MipCount = 1;
	Ati2.Format = FourCC_ATI2;
	Ati2.Data = {128, 128, 0, 0, 0, 0, 0, 0, 128, 128, 0, 0, 0, 0, 0, 0};
	CHECK(DecodeToRgba(Ati2, Rgba, Error));
	CHECK(Rgba[0] == 128 && Rgba[1] == 128 && Rgba[2] >= 254 && Rgba[3] == 255);

	// Unsupported formats name their code.
	One.Format = 0x12345;
	CHECK(!DecodeToRgba(One, Rgba, Error) && Error.find("unknown(74565)") != std::string::npos);
	CHECK(TextureFormatName(MakeFourCC('B', 'C', '7', 'X')) == "unknown('BC7X')");

	// DDS header: magic, size, dimensions, FourCC, data appended.
	std::vector<uint8_t> Dds;
	WriteDds(Image, Dds);
	CHECK(Dds.size() == 128 + 8);
	CHECK(std::memcmp(Dds.data(), "DDS ", 4) == 0);
	CHECK(Dds[4] == 124 && Dds[12] == 4 && Dds[16] == 4);
	CHECK(std::memcmp(Dds.data() + 84, "DXT1", 4) == 0);

	// Minimal RW4 texture: header, section table with a raster and a base resource.
	std::vector<uint8_t> Rw(0x320, 0);
	const uint8_t Magic[8] = {0x89, 'R', 'W', '4', 'w', '3', '2', 0x00};
	std::memcpy(Rw.data(), Magic, 8);
	PutLE32(Rw, 0x1C, 0x04000000); // texture file
	PutLE32(Rw, 0x24, 2);          // sections
	PutLE32(Rw, 0x30, 0x200);      // section table
	PutLE32(Rw, 0x44, 0x300);      // buffer data
	// Raster at 0x100: format, flags, depth, dxBase, w, h, field_10, mips, pad, f14, f18, data index 1
	PutLE32(Rw, 0x100, FourCC_DXT1);
	Rw[0x10C] = 4; Rw[0x10E] = 4; Rw[0x111] = 1;
	PutLE32(Rw, 0x11C, 1);
	// Section 0: raster ; section 1: base resource at buffer + 0x10, 8 bytes
	PutLE32(Rw, 0x200, 0x100); PutLE32(Rw, 0x208, 32); PutLE32(Rw, 0x214, 0x20003);
	PutLE32(Rw, 0x218, 0x10); PutLE32(Rw, 0x220, 8); PutLE32(Rw, 0x22C, 0x10030);
	std::memcpy(Rw.data() + 0x310, Dxt1Block.data(), 8);

	Rw4Info Info;
	CHECK(ParseRw4(Rw.data(), Rw.size(), Info, Error));
	CHECK(Info.Kind == Rw4Kind::Texture && Info.SectionCount == 2);
	CHECK(Info.Textures.size() == 1);
	if (Info.Textures.size() == 1)
	{
		CHECK(Info.Textures[0].Width == 4 && Info.Textures[0].MipCount == 1);
		CHECK(Info.Textures[0].Data == Dxt1Block);
	}
	Rw[1] = 'X';
	CHECK(!ParseRw4(Rw.data(), Rw.size(), Info, Error));
}

static void PutLE16(std::vector<uint8_t>& B, size_t At, uint16_t V)
{
	B[At] = static_cast<uint8_t>(V);
	B[At + 1] = static_cast<uint8_t>(V >> 8);
}

static void PutLEFloat(std::vector<uint8_t>& B, size_t At, float F)
{
	uint32_t Bits;
	std::memcpy(&Bits, &F, 4);
	PutLE32(B, At, Bits);
}

// Section table entry: offset, size, type code.
static void PutSection(std::vector<uint8_t>& B, size_t Table, uint32_t Index, uint32_t Offset, uint32_t Size, uint32_t Type)
{
	const size_t At = Table + 24 * Index;
	PutLE32(B, At, Offset);
	PutLE32(B, At + 8, Size);
	PutLE32(B, At + 20, Type);
}

static std::vector<uint8_t> BuildMeshRw4(uint32_t PrimitiveType, const std::vector<uint16_t>& Indices, uint32_t TriangleCount)
{
	std::vector<uint8_t> Rw(0x500, 0);
	const uint8_t Magic[8] = {0x89, 'R', 'W', '4', 'w', '3', '2', 0x00};
	std::memcpy(Rw.data(), Magic, 8);
	PutLE32(Rw, 0x1C, 1);     // model
	PutLE32(Rw, 0x24, 6);     // sections
	PutLE32(Rw, 0x30, 0x300); // section table
	PutLE32(Rw, 0x44, 0x400); // buffer data

	// 0: vertex description: position FLOAT3 @0, normal UBYTE4 @12, texcoord FLOAT2 @16, stride 24.
	PutLE16(Rw, 0x10C, 3);
	Rw[0x10F] = 24;
	const uint8_t Elements[3][4] = {{0, 2, 0, 0}, {12, 5, 3, 2}, {16, 1, 5, 6}}; // offset, decltype, d3dusage, rwusage
	for (int E = 0; E < 3; ++E)
	{
		const size_t At = 0x118 + 12 * E;
		PutLE16(Rw, At + 2, Elements[E][0]);
		Rw[At + 4] = Elements[E][1];
		Rw[At + 6] = Elements[E][2];
		PutLE32(Rw, At + 8, Elements[E][3]);
	}
	// 1: vertex buffer -> description 0, 4 vertices, stride 24, data section 3
	PutLE32(Rw, 0x180, 0);
	PutLE32(Rw, 0x18C, 4);
	PutLE32(Rw, 0x194, 24);
	PutLE32(Rw, 0x198, 3);
	// 2: index buffer -> 16-bit, data section 4
	PutLE32(Rw, 0x1D0, 101);
	PutLE32(Rw, 0x1D4, PrimitiveType);
	PutLE32(Rw, 0x1D8, 4);
	// 5: mesh
	PutLE32(Rw, 0x204, PrimitiveType);
	PutLE32(Rw, 0x208, 2);
	PutLE32(Rw, 0x20C, TriangleCount);
	PutLE32(Rw, 0x210, 1);
	PutLE32(Rw, 0x220, 4); // vertex count
	PutLE32(Rw, 0x224, 1); // vertex buffer section

	// Vertex data at buffer + 0: a unit quad in the XY plane, normals +Z, UVs at corners.
	const float Pos[4][2] = {{0, 0}, {1, 0}, {0, 1}, {1, 1}};
	for (int V = 0; V < 4; ++V)
	{
		const size_t At = 0x400 + 24 * V;
		PutLEFloat(Rw, At, Pos[V][0]);
		PutLEFloat(Rw, At + 4, Pos[V][1]);
		PutLEFloat(Rw, At + 8, 0.0f);
		Rw[At + 12] = 128; Rw[At + 13] = 128; Rw[At + 14] = 255;
		PutLEFloat(Rw, At + 16, Pos[V][0]);
		PutLEFloat(Rw, At + 20, Pos[V][1]);
	}
	for (size_t I = 0; I < Indices.size(); ++I) PutLE16(Rw, 0x480 + 2 * I, Indices[I]);

	PutSection(Rw, 0x300, 0, 0x100, 0x3C, 0x20004);
	PutSection(Rw, 0x300, 1, 0x180, 28, 0x20005);
	PutSection(Rw, 0x300, 2, 0x1C0, 28, 0x20007);
	PutSection(Rw, 0x300, 3, 0x00, 96, 0x10030);
	PutSection(Rw, 0x300, 4, 0x80, static_cast<uint32_t>(2 * Indices.size()), 0x10030);
	PutSection(Rw, 0x300, 5, 0x200, 40, 0x20009);
	return Rw;
}

static void TestMeshes()
{
	std::string Error;
	Rw4Info Info;
	std::vector<uint8_t> List = BuildMeshRw4(4, {0, 1, 2, 2, 1, 3}, 2);
	CHECK(ParseRw4(List.data(), List.size(), Info, Error));
	CHECK(Info.Kind == Rw4Kind::Model);
	CHECK(Info.Meshes.size() == 1 && Info.SkippedMeshes == 0);
	if (Info.Meshes.size() != 1) return;
	const MeshData& Mesh = Info.Meshes[0];
	CHECK(Mesh.VertexCount() == 4);
	CHECK(Mesh.Indices == std::vector<uint32_t>({0, 1, 2, 2, 1, 3}));
	CHECK(Mesh.Positions[3] == 1.0f && Mesh.Positions[10] == 1.0f);
	CHECK(Mesh.Normals.size() == 12 && Mesh.Normals[2] == 1.0f && Mesh.Normals[0] > 0.0f && Mesh.Normals[0] < 0.01f);
	CHECK(Mesh.UVs.size() == 8 && Mesh.UVs[6] == 1.0f);
	CHECK(!Mesh.bSkinned);

	const std::string Obj = MeshToObj(Mesh, "quad");
	CHECK(Obj.find("v 1 1 0\n") != std::string::npos);
	CHECK(Obj.find("vt 1 0\n") != std::string::npos); // V flipped
	CHECK(Obj.find("f 1/1/1 2/2/2 3/3/3\n") != std::string::npos);

	// Strip 0,1,2,3 -> triangles (0,1,2) and (2,1,3).
	std::vector<uint8_t> Strip = BuildMeshRw4(5, {0, 1, 2, 3}, 2);
	CHECK(ParseRw4(Strip.data(), Strip.size(), Info, Error));
	CHECK(Info.Meshes.size() == 1 && Info.Meshes[0].Indices == std::vector<uint32_t>({0, 1, 2, 2, 1, 3}));

	// Material: mesh state link -> compiled state with one texture slot -> raster in this file.
	std::vector<uint8_t> Mat = BuildMeshRw4(4, {0, 1, 2, 2, 1, 3}, 2);
	Mat.resize(0x700, 0);
	PutLE32(Mat, 0x24, 10);
	PutLE32(Mat, 0x240, FourCC_DXT1); // 6: raster -> data section 7
	Mat[0x24C] = 4; Mat[0x24E] = 4; Mat[0x251] = 1;
	PutLE32(Mat, 0x25C, 7);
	PutLE32(Mat, 0x610, 1);           // 8: compiled state, flags3 = sampler 0 used
	PutLE32(Mat, 0x620, 0xFFFFFFFF);  // no palette
	PutLE32(Mat, 0x624, 0);           // sampler 0
	PutLE32(Mat, 0x628, 6);           // raster section 6
	PutLE32(Mat, 0x634, 0xFFFFFFFF);  // end of slots
	PutLE32(Mat, 0x280, 5);           // 9: link mesh 5 -> state 8
	PutLE32(Mat, 0x284, 1);
	PutLE32(Mat, 0x288, 8);
	PutSection(Mat, 0x300, 6, 0x240, 32, 0x20003);
	PutSection(Mat, 0x300, 7, 0x100, 8, 0x10030);
	PutSection(Mat, 0x300, 8, 0x600, 56, 0x2000B);
	PutSection(Mat, 0x300, 9, 0x280, 12, 0x2001A);
	CHECK(ParseRw4(Mat.data(), Mat.size(), Info, Error));
	CHECK(Info.Textures.size() == 1 && Info.Meshes.size() == 1 && Info.UnreadableMaterials == 0);
	if (Info.Meshes.size() == 1)
	{
		CHECK(Info.Meshes[0].TextureSlots.size() == 1);
		CHECK(!Info.Meshes[0].TextureSlots.empty() && Info.Meshes[0].TextureSlots[0].TextureIndex == 0 && Info.Meshes[0].TextureSlots[0].Sampler == 0);
	}

	// Same slot pointing at a texture override (named external texture).
	PutLE32(Mat, 0x240, 0xFB724FAA);
	std::memcpy(Mat.data() + 0x244, "SkinPaint", 10);
	PutSection(Mat, 0x300, 6, 0x240, 14, 0x20008);
	CHECK(ParseRw4(Mat.data(), Mat.size(), Info, Error));
	CHECK(Info.Meshes.size() == 1 && Info.Meshes[0].TextureSlots.size() == 1);
	if (Info.Meshes.size() == 1 && !Info.Meshes[0].TextureSlots.empty())
	{
		CHECK(Info.Meshes[0].TextureSlots[0].TextureIndex == -1 && Info.Meshes[0].TextureSlots[0].OverrideName == "SkinPaint");
	}

	// Out-of-range index: the mesh is skipped with an issue, the file still parses.
	std::vector<uint8_t> Bad = BuildMeshRw4(4, {0, 1, 9}, 1);
	CHECK(ParseRw4(Bad.data(), Bad.size(), Info, Error));
	CHECK(Info.Meshes.empty() && Info.SkippedMeshes == 1 && !Info.MeshIssues.empty());
}

// Inverse of ExtractHiddenBytes: writes Payload into the low bits along the same walk.
static void HideBytes(std::vector<uint8_t>& Bgra, const std::vector<uint8_t>& Payload)
{
	uint32_t Hash = 0x811C9DC5u;
	uint32_t Next = 0x0B400;
	for (uint8_t Byte : Payload)
	{
		for (int Bit = 0; Bit < 8; ++Bit)
		{
			const uint32_t N = Next;
			const uint32_t D = Bgra[N];
			Hash = (Hash * 0x01000193u) ^ ((N & 7) | (D & 0xF8)); // independent of the low bit
			const uint32_t Wanted = (Byte >> Bit) & 1;
			const uint32_t Lsb = Wanted ^ ((Hash >> 15) & 1);
			Bgra[N] = static_cast<uint8_t>((D & 0xFE) | Lsb);
			Next = (N >> 1) ^ (0x0B400u & (0u - (N & 1)));
		}
	}
}

static void TestCreation()
{
	// Hidden-bit walk round trip over a noisy 128x128 BGRA buffer.
	std::vector<uint8_t> Bgra(0x10000);
	uint32_t Seed = 12345;
	for (uint8_t& B : Bgra) { Seed = Seed * 1103515245u + 12345u; B = static_cast<uint8_t>(Seed >> 16); }
	const std::string Message = "spore-hidden-payload";
	HideBytes(Bgra, std::vector<uint8_t>(Message.begin(), Message.end()));
	const std::vector<uint8_t> Back = ExtractHiddenBytes(Bgra.data(), Bgra.size(), Message.size());
	CHECK(std::string(Back.begin(), Back.end()) == Message);
	CHECK(ExtractHiddenBytes(Bgra.data(), 100, 4).empty());
	// The walk visits 0xFFFF positions, so at most 8191 whole bytes can be extracted.
	CHECK(ExtractHiddenBytes(Bgra.data(), Bgra.size(), 100000).size() == 0xFFFF / 8);

	// PNG decoding with every filter type; a pass-through "inflater" feeds raw scanlines.
	std::vector<uint8_t> Png = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
	std::vector<uint8_t> Ihdr;
	AppendBE32(Ihdr, 2);
	AppendBE32(Ihdr, 5);
	Ihdr.insert(Ihdr.end(), {8, 6, 0, 0, 0});
	AppendChunk(Png, "IHDR", Ihdr);
	// Target image: pixel (x, y) = (10x + y, 20, 30 + y, 255). Encode each row with filter y.
	auto PixelAt = [](int X, int Y, int C) -> uint8_t
	{
		const uint8_t Px[4] = {static_cast<uint8_t>(10 * X + Y), 20, static_cast<uint8_t>(30 + Y), 255};
		return Px[C];
	};
	std::vector<uint8_t> Raw;
	for (int Y = 0; Y < 5; ++Y)
	{
		Raw.push_back(static_cast<uint8_t>(Y));
		for (int X = 0; X < 2; ++X)
		{
			for (int C = 0; C < 4; ++C)
			{
				const int A = X > 0 ? PixelAt(X - 1, Y, C) : 0;
				const int B = Y > 0 ? PixelAt(X, Y - 1, C) : 0;
				const int Cc = (X > 0 && Y > 0) ? PixelAt(X - 1, Y - 1, C) : 0;
				int Predictor = 0;
				if (Y == 1) Predictor = A;
				else if (Y == 2) Predictor = B;
				else if (Y == 3) Predictor = (A + B) / 2;
				else if (Y == 4)
				{
					const int P = A + B - Cc, PA = std::abs(P - A), PB = std::abs(P - B), PC = std::abs(P - Cc);
					Predictor = (PA <= PB && PA <= PC) ? A : (PB <= PC ? B : Cc);
				}
				Raw.push_back(static_cast<uint8_t>(PixelAt(X, Y, C) - Predictor));
			}
		}
	}
	AppendChunk(Png, "IDAT", Raw);
	AppendChunk(Png, "IEND", {});
	InflateFn PassThrough = [](const uint8_t* D, size_t N, std::vector<uint8_t>& Out) { Out.assign(D, D + N); return true; };
	PngImage Image;
	std::string Error;
	CHECK(DecodePngImage(Png.data(), Png.size(), PassThrough, Image, Error));
	CHECK(Image.Width == 2 && Image.Height == 5 && Image.Rgba.size() == 40);
	bool bPixelsMatch = Image.Rgba.size() == 40;
	for (int Y = 0; Y < 5 && bPixelsMatch; ++Y)
		for (int X = 0; X < 2; ++X)
			for (int C = 0; C < 4; ++C)
				bPixelsMatch = bPixelsMatch && Image.Rgba[(Y * 2 + X) * 4 + C] == PixelAt(X, Y, C);
	CHECK(bPixelsMatch);

	// Model XML parsing.
	const std::string Xml =
		"<?xml version=\"1.0\"?><sporemodel>\r\n<formatversion>18</formatversion><properties><modeltype>0x47c10953</modeltype></properties>"
		"<blocks count=\"2\"><blockref><blockid>0x40636000, 0xd86e4607</blockid><transform><scale>1.5</scale>"
		"<position>1,2,3.5</position><orientation><row0>0,1,0</row0><row1>-1,0,0</row1><row2>0,0,1</row2></orientation></transform>"
		"<snapped>true</snapped><paintlist count=\"1\"><paint><paintregion>0x00000004</paintregion><paintid>0xe5210f0f</paintid>"
		"<color1>0.5,0.25,1</color1><color2>0,0,0</color2></paint></paintlist><childlist count=\"1\"><childid>1</childid></childlist>"
		"<isasymmetric>false</isasymmetric></blockref><blockref><blockid>0x12345678</blockid><isasymmetric>true</isasymmetric></blockref></blocks></sporemodel>";
	SporeCreation Creation;
	CHECK(ParseSporeModelXml(Xml, Creation, Error));
	CHECK(Creation.FormatVersion == 18 && Creation.ModelType == 0x47C10953);
	CHECK(Creation.Blocks.size() == 2);
	if (Creation.Blocks.size() == 2)
	{
		const CreationBlock& B0 = Creation.Blocks[0];
		CHECK(B0.Group == 0x40636000 && B0.Instance == 0xD86E4607);
		CHECK(B0.Scale == 1.5f && B0.Position[2] == 3.5f && B0.Rotation[1] == 1.0f && B0.Rotation[3] == -1.0f);
		CHECK(B0.bSnapped && !B0.bAsymmetric);
		CHECK(B0.Children == std::vector<int32_t>({1}));
		CHECK(B0.Paints.size() == 1 && B0.Paints[0].PaintId == 0xE5210F0F && B0.Paints[0].Color1[1] == 0.25f);
		CHECK(Creation.Blocks[1].Instance == 0x12345678 && Creation.Blocks[1].bAsymmetric && Creation.Blocks[1].Scale == 1.0f);
	}
	CHECK(!ParseSporeModelXml("<notamodel/>", Creation, Error));

	// Model lookup prefers LOD0, falls back to lower detail, defaults the type to rw4.
	PropertyList PartProps;
	Property Low;
	Low.Id = PropModelMeshLOD2;
	Low.Type = static_cast<uint16_t>(PropType::Key);
	Low.Count = 1;
	Low.Keys.push_back({0x22, 0, 0x33});
	PartProps.Properties.push_back(Low);
	ResourceKey ModelKey;
	CHECK(FindPartModelKey(PartProps, ModelKey));
	CHECK(ModelKey.Instance == 0x22 && ModelKey.Group == 0x33 && ModelKey.Type == 0x2F4E681B);
	Property High = Low;
	High.Id = PropModelMeshLOD0;
	High.Keys[0] = {0x11, 0x2F4E681B, 0x33};
	PartProps.Properties.push_back(High);
	CHECK(FindPartModelKey(PartProps, ModelKey) && ModelKey.Instance == 0x11);
	CHECK(!FindPartModelKey(PropertyList(), ModelKey));

	// Placement: scale 2, rotate 90 degrees about Z (rows (0,1,0),(-1,0,0),(0,0,1)), move by (10,0,0).
	CreationBlock Place;
	Place.Scale = 2.0f;
	const float Rot[9] = {0, 1, 0, -1, 0, 0, 0, 0, 1};
	std::memcpy(Place.Rotation, Rot, sizeof(Rot));
	Place.Position[0] = 10.0f;
	MeshData Unit;
	Unit.Positions = {1, 0, 0};
	Unit.Normals = {1, 0, 0};
	MeshData RowVec = Unit;
	PlaceMesh(RowVec, Place, false); // v * R: (1,0,0) -> first row (0,1,0)
	CHECK(RowVec.Positions == std::vector<float>({10, 2, 0}));
	CHECK(RowVec.Normals == std::vector<float>({0, 1, 0}));
	MeshData ColVec = Unit;
	PlaceMesh(ColVec, Place, true);  // R * v: (1,0,0) -> first column (0,-1,0)
	CHECK(ColVec.Positions == std::vector<float>({10, -2, 0}));
}

int main()
{
	TestRefPack();
	TestDbpf(false);
	TestDbpf(true);
	TestValidate();
	TestFnv();
	TestPng();
	TestTextureGen();
	TestProp();
	TestRegistry();
	TestTextures();
	TestMeshes();
	TestCreation();
	if (Failures == 0)
	{
		std::printf("all tests passed\n");
	}
	return Failures == 0 ? 0 : 1;
}
