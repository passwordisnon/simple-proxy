// Spore 2.0 interop layer - engine-independent DBPF reader.

#include "SporeCore/SporeDbpf.h"

#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <unordered_map>

namespace sporecore
{

namespace
{

uint32_t ReadLE32(const uint8_t* P)
{
	return static_cast<uint32_t>(P[0]) | (static_cast<uint32_t>(P[1]) << 8) | (static_cast<uint32_t>(P[2]) << 16) | (static_cast<uint32_t>(P[3]) << 24);
}

uint64_t ReadLE64(const uint8_t* P)
{
	return static_cast<uint64_t>(ReadLE32(P)) | (static_cast<uint64_t>(ReadLE32(P + 4)) << 32);
}

uint16_t ReadLE16(const uint8_t* P)
{
	return static_cast<uint16_t>(P[0] | (P[1] << 8));
}

std::string FormatKey(const ResourceKey& Key)
{
	char Buffer[64];
	std::snprintf(Buffer, sizeof(Buffer), "%08X!%08X.%08X", Key.Group, Key.Instance, Key.Type);
	return Buffer;
}

} // namespace

uint32_t FnvHash(const std::string& Name)
{
	uint32_t Hash = 0x811C9DC5u;
	for (char C : Name)
	{
		const unsigned char Lower = static_cast<unsigned char>((C >= 'A' && C <= 'Z') ? C + ('a' - 'A') : C);
		Hash *= 0x01000193u;
		Hash ^= Lower;
	}
	return Hash;
}

const char* ToString(DbpfError Error)
{
	switch (Error)
	{
	case DbpfError::None: return "ok";
	case DbpfError::TooSmall: return "file too small for a DBPF header";
	case DbpfError::BadMagic: return "missing DBPF/DBBF magic";
	case DbpfError::UnsupportedVersion: return "unsupported DBPF version (expected 2.0)";
	case DbpfError::IndexOutOfRange: return "index lies outside the file";
	case DbpfError::TruncatedIndex: return "index is shorter than its entry count requires";
	case DbpfError::EntryOutOfRange: return "entry payload lies outside the file";
	case DbpfError::DecompressFailed: return "RefPack decompression failed";
	case DbpfError::SizeMismatch: return "decoded size does not match index";
	}
	return "unknown error";
}

DbpfError ParseHeader(const uint8_t* Data, size_t Size, uint64_t FileSize, DbpfHeader& Out)
{
	if (Size < DbpfHeaderSize || FileSize < DbpfHeaderSize)
	{
		return DbpfError::TooSmall;
	}
	if (Data[0] != 'D' || Data[1] != 'B' || (Data[2] != 'P' && Data[2] != 'B') || Data[3] != 'F')
	{
		return DbpfError::BadMagic;
	}
	Out.bBigFile = Data[2] == 'B';

	Out.MajorVersion = ReadLE32(Data + 4);
	Out.MinorVersion = ReadLE32(Data + 8);
	if (Out.MajorVersion != 2)
	{
		return DbpfError::UnsupportedVersion;
	}

	Out.IndexEntryCount = ReadLE32(Data + 36);
	if (Out.bBigFile)
	{
		// SporeModder-FX writeDBBF: count @36, u64 index size @40, index minor @52, u64 index offset @56.
		// The index size is stored as 64 bits but an index never exceeds 4 GB; keep the low half.
		Out.IndexSize = ReadLE32(Data + 40);
		Out.IndexMinorVersion = ReadLE32(Data + 52);
		Out.IndexOffset = ReadLE64(Data + 56);
	}
	else
	{
		Out.IndexSize = ReadLE32(Data + 44);
		Out.IndexMinorVersion = ReadLE32(Data + 60);
		Out.IndexOffset = ReadLE32(Data + 64);
	}

	if (Out.IndexOffset > FileSize || Out.IndexSize > FileSize - Out.IndexOffset)
	{
		return DbpfError::IndexOutOfRange;
	}
	return DbpfError::None;
}

DbpfError ParseIndex(const uint8_t* Data, size_t Size, const DbpfHeader& Header, uint64_t FileSize, std::vector<IndexEntry>& Out)
{
	Out.clear();
	if (Header.IndexEntryCount == 0)
	{
		return DbpfError::None;
	}
	if (Size < 4)
	{
		return DbpfError::TruncatedIndex;
	}

	size_t Pos = 0;
	const uint32_t Flags = ReadLE32(Data);
	Pos += 4;

	// Bits 0..2 mark type / group / unknown fields that are shared by every entry
	// and therefore stored once up front instead of per entry.
	uint32_t SharedType = 0;
	uint32_t SharedGroup = 0;
	const uint32_t SharedFieldCount = ((Flags & 1u) ? 1 : 0) + ((Flags & 2u) ? 1 : 0) + ((Flags & 4u) ? 1 : 0);
	if (Size < Pos + SharedFieldCount * 4)
	{
		return DbpfError::TruncatedIndex;
	}
	if (Flags & 1u) { SharedType = ReadLE32(Data + Pos); Pos += 4; }
	if (Flags & 2u) { SharedGroup = ReadLE32(Data + Pos); Pos += 4; }
	if (Flags & 4u) { Pos += 4; }

	const size_t OffsetBytes = Header.bBigFile ? 8 : 4;
	const size_t EntrySize = (3 - SharedFieldCount) * 4 + 4 + OffsetBytes + 4 * 2 + 2 * 2;
	if ((Size - Pos) / EntrySize < Header.IndexEntryCount)
	{
		return DbpfError::TruncatedIndex;
	}

	Out.reserve(Header.IndexEntryCount);
	for (uint32_t I = 0; I < Header.IndexEntryCount; ++I)
	{
		IndexEntry Entry;
		Entry.Key.Type = (Flags & 1u) ? SharedType : ReadLE32(Data + Pos);
		if (!(Flags & 1u)) Pos += 4;
		Entry.Key.Group = (Flags & 2u) ? SharedGroup : ReadLE32(Data + Pos);
		if (!(Flags & 2u)) Pos += 4;
		if (!(Flags & 4u)) Pos += 4;

		Entry.Key.Instance = ReadLE32(Data + Pos);
		Pos += 4;
		Entry.Offset = Header.bBigFile ? ReadLE64(Data + Pos) : ReadLE32(Data + Pos);
		Pos += OffsetBytes;
		Entry.CompressedSize = ReadLE32(Data + Pos) & 0x7FFFFFFFu;
		Entry.MemSize = ReadLE32(Data + Pos + 4);
		Entry.bCompressed = ReadLE16(Data + Pos + 8) == 0xFFFF;
		Pos += 12;

		if (Entry.Offset > FileSize || Entry.CompressedSize > FileSize - Entry.Offset)
		{
			return DbpfError::EntryOutOfRange;
		}
		Out.push_back(Entry);
	}
	return DbpfError::None;
}

bool RefPackDecompress(const uint8_t* Data, size_t Size, std::vector<uint8_t>& Out)
{
	Out.clear();
	if (Size < 5 || Data[1] != 0xFB || (Data[0] & 0x3E) != 0x10)
	{
		return false;
	}

	const bool bWideSizes = (Data[0] & 0x80) != 0;
	const size_t SizeBytes = bWideSizes ? 4 : 3;
	size_t Pos = 2;
	if (Data[0] & 0x01)
	{
		Pos += SizeBytes; // optional compressed-size field, not needed for decoding
	}
	if (Size < Pos + SizeBytes)
	{
		return false;
	}

	uint32_t ExpectedSize = 0;
	for (size_t I = 0; I < SizeBytes; ++I)
	{
		ExpectedSize = (ExpectedSize << 8) | Data[Pos + I];
	}
	Pos += SizeBytes;
	Out.reserve(ExpectedSize);

	while (Pos < Size)
	{
		const uint8_t B0 = Data[Pos];
		uint32_t PlainCount = 0;
		uint32_t CopyCount = 0;
		uint32_t CopyOffset = 0;
		bool bStop = false;

		if (B0 < 0x80)
		{
			if (Pos + 2 > Size) return false;
			const uint8_t B1 = Data[Pos + 1];
			PlainCount = B0 & 0x03;
			CopyCount = ((B0 & 0x1C) >> 2) + 3;
			CopyOffset = ((B0 & 0x60) << 3) + B1 + 1;
			Pos += 2;
		}
		else if (B0 < 0xC0)
		{
			if (Pos + 3 > Size) return false;
			const uint8_t B1 = Data[Pos + 1];
			const uint8_t B2 = Data[Pos + 2];
			PlainCount = (B1 >> 6) & 0x03;
			CopyCount = (B0 & 0x3F) + 4;
			CopyOffset = ((B1 & 0x3F) << 8) + B2 + 1;
			Pos += 3;
		}
		else if (B0 < 0xE0)
		{
			if (Pos + 4 > Size) return false;
			const uint8_t B1 = Data[Pos + 1];
			const uint8_t B2 = Data[Pos + 2];
			const uint8_t B3 = Data[Pos + 3];
			PlainCount = B0 & 0x03;
			CopyCount = ((B0 & 0x0C) << 6) + B3 + 5;
			CopyOffset = ((B0 & 0x10) << 12) + (B1 << 8) + B2 + 1;
			Pos += 4;
		}
		else if (B0 < 0xFC)
		{
			PlainCount = ((B0 & 0x1F) << 2) + 4;
			Pos += 1;
		}
		else
		{
			PlainCount = B0 & 0x03;
			Pos += 1;
			bStop = true;
		}

		if (Pos + PlainCount > Size || Out.size() + PlainCount + CopyCount > ExpectedSize)
		{
			return false;
		}
		Out.insert(Out.end(), Data + Pos, Data + Pos + PlainCount);
		Pos += PlainCount;

		if (CopyCount > 0)
		{
			if (CopyOffset > Out.size())
			{
				return false;
			}
			// Byte-by-byte on purpose: back-references may overlap the bytes being written.
			size_t Src = Out.size() - CopyOffset;
			for (uint32_t I = 0; I < CopyCount; ++I)
			{
				Out.push_back(Out[Src++]);
			}
		}

		if (bStop)
		{
			break;
		}
	}
	return Out.size() == ExpectedSize;
}

DbpfError DecodeEntry(const IndexEntry& Entry, const uint8_t* Raw, size_t RawSize, std::vector<uint8_t>& Out)
{
	if (RawSize < Entry.CompressedSize)
	{
		return DbpfError::EntryOutOfRange;
	}
	if (!Entry.bCompressed)
	{
		Out.assign(Raw, Raw + Entry.CompressedSize);
		return DbpfError::None;
	}
	if (!RefPackDecompress(Raw, Entry.CompressedSize, Out))
	{
		return DbpfError::DecompressFailed;
	}
	return Out.size() == Entry.MemSize ? DbpfError::None : DbpfError::SizeMismatch;
}

size_t ParseNameRegistry(const std::string& Text, std::unordered_map<uint32_t, std::string>& Out)
{
	size_t Added = 0;
	size_t LineStart = 0;
	while (LineStart < Text.size())
	{
		size_t LineEnd = Text.find('\n', LineStart);
		if (LineEnd == std::string::npos) LineEnd = Text.size();
		std::string Line = Text.substr(LineStart, LineEnd - LineStart);
		LineStart = LineEnd + 1;

		const size_t Comment = Line.find('#');
		if (Comment != std::string::npos) Line.resize(Comment);
		const char* Space = " \t\r";
		const size_t First = Line.find_first_not_of(Space);
		if (First == std::string::npos) continue;
		const size_t Last = Line.find_last_not_of(Space);
		Line = Line.substr(First, Last - First + 1);

		std::string Name = Line;
		uint32_t Id = 0;
		const size_t Split = Line.find_last_of(" \t");
		if (Split != std::string::npos)
		{
			const std::string IdText = Line.substr(Split + 1);
			char* End = nullptr;
			const unsigned long Value = std::strtoul(IdText.c_str(), &End, 16);
			if (End == IdText.c_str() || *End != '\0') continue;
			Id = static_cast<uint32_t>(Value);
			Name = Line.substr(0, Line.find_first_of(" \t"));
		}
		else
		{
			Id = FnvHash(Name);
		}
		if (Out.emplace(Id, Name).second) ++Added;
	}
	return Added;
}

const char* KnownTypeName(uint32_t TypeId)
{
	// IDs as registered by SporeModder-FX for the formats this layer cares about.
	switch (TypeId)
	{
	case 0x00B1B104: return "prop";
	case 0x2F7D0004: return "png";
	case 0x2F4E681B: return "rw4";
	case 0x2F4E681C: return "raster";
	default: return nullptr;
	}
}

void ValidateIndex(const std::vector<IndexEntry>& Entries, uint64_t FileSize, std::vector<std::string>& OutIssues)
{
	std::unordered_map<ResourceKey, size_t, ResourceKeyHash> Seen;
	Seen.reserve(Entries.size());

	std::vector<const IndexEntry*> ByOffset;
	ByOffset.reserve(Entries.size());

	for (size_t I = 0; I < Entries.size(); ++I)
	{
		const IndexEntry& Entry = Entries[I];
		auto [It, bInserted] = Seen.emplace(Entry.Key, I);
		if (!bInserted)
		{
			OutIssues.push_back("duplicate key " + FormatKey(Entry.Key) + " (entries " + std::to_string(It->second) + " and " + std::to_string(I) + ")");
		}
		if (Entry.CompressedSize == 0)
		{
			OutIssues.push_back("zero-length payload for " + FormatKey(Entry.Key));
			continue;
		}
		if (Entry.Offset < DbpfHeaderSize || static_cast<uint64_t>(Entry.Offset) + Entry.CompressedSize > FileSize)
		{
			OutIssues.push_back("payload outside file for " + FormatKey(Entry.Key));
			continue;
		}
		if (!Entry.bCompressed && Entry.CompressedSize != Entry.MemSize)
		{
			OutIssues.push_back("uncompressed entry with differing sizes " + FormatKey(Entry.Key));
		}
		ByOffset.push_back(&Entry);
	}

	std::sort(ByOffset.begin(), ByOffset.end(), [](const IndexEntry* A, const IndexEntry* B) { return A->Offset < B->Offset; });
	for (size_t I = 1; I < ByOffset.size(); ++I)
	{
		const IndexEntry* Prev = ByOffset[I - 1];
		const IndexEntry* Cur = ByOffset[I];
		if (static_cast<uint64_t>(Prev->Offset) + Prev->CompressedSize > Cur->Offset)
		{
			OutIssues.push_back("overlapping payloads " + FormatKey(Prev->Key) + " / " + FormatKey(Cur->Key));
		}
	}
}

} // namespace sporecore
