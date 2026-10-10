// Unit tests for the engine-independent Spore2Interop core, on synthetic data.

#include "SporeCore/SporeDbpf.h"
#include "SporeCore/SporePng.h"
#include "SporeCore/SporeProp.h"
#include "SporeCore/SporeTextureGen.h"

#include <cstdio>
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
	if (Failures == 0)
	{
		std::printf("all tests passed\n");
	}
	return Failures == 0 ? 0 : 1;
}
