// Spore 2.0 interop layer - engine-independent DBPF reader.
// Pure C++20, no Unreal headers, no exceptions: compiled both inside the
// Spore2Interop UE plugin and by the standalone spore2-scan tool.
//
// Format notes follow the layout used by SporeModder-FX (DatabasePackedFile):
// Spore ships DBPF 2.0 containers with a 96-byte header, an index of
// (type, group, instance) keyed entries and RefPack (QFS) compressed payloads.
// Some mods are saved as "DBBF", the same container with 64-bit index and entry offsets
// (SporeModder-FX's isDBBF option); both are read.

#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <unordered_map>
#include <vector>

namespace sporecore
{

// Spore hashes names with 32-bit FNV-1 over the lowercased ASCII string.
uint32_t FnvHash(const std::string& Name);

struct ResourceKey
{
	uint32_t Instance = 0;
	uint32_t Type = 0;
	uint32_t Group = 0;

	bool operator==(const ResourceKey& Other) const
	{
		return Instance == Other.Instance && Type == Other.Type && Group == Other.Group;
	}
};

struct ResourceKeyHash
{
	size_t operator()(const ResourceKey& Key) const
	{
		return (static_cast<size_t>(Key.Type) * 0x9E3779B1u) ^ (static_cast<size_t>(Key.Group) << 7) ^ Key.Instance;
	}
};

struct IndexEntry
{
	ResourceKey Key;
	uint64_t Offset = 0;
	uint32_t CompressedSize = 0;
	uint32_t MemSize = 0;
	bool bCompressed = false;
};

enum class DbpfError : uint8_t
{
	None,
	TooSmall,
	BadMagic,
	UnsupportedVersion,
	IndexOutOfRange,
	TruncatedIndex,
	EntryOutOfRange,
	DecompressFailed,
	SizeMismatch,
};

const char* ToString(DbpfError Error);

// Bytes to read for ParseHeader. A DBBF header is 120 bytes, but its fields all lie in the first 96.
constexpr size_t DbpfHeaderSize = 96;

struct DbpfHeader
{
	bool bBigFile = false; // "DBBF": 64-bit index offset and entry offsets
	uint32_t MajorVersion = 0;
	uint32_t MinorVersion = 0;
	uint32_t IndexEntryCount = 0;
	uint64_t IndexOffset = 0;
	uint32_t IndexSize = 0;
	uint32_t IndexMinorVersion = 0;
};

// Parses the fixed DBPF (96-byte) or DBBF (120-byte) header. FileSize is used to bounds-check the index.
DbpfError ParseHeader(const uint8_t* Data, size_t Size, uint64_t FileSize, DbpfHeader& Out);

// Parses the index block located at Header.IndexOffset (Header.IndexSize bytes).
// Entries pointing outside FileSize are rejected.
DbpfError ParseIndex(const uint8_t* Data, size_t Size, const DbpfHeader& Header, uint64_t FileSize, std::vector<IndexEntry>& Out);

// Decompresses a RefPack/QFS stream (Spore header: 0x10|flags, 0xFB, 3 or 4 byte BE size).
bool RefPackDecompress(const uint8_t* Data, size_t Size, std::vector<uint8_t>& Out);

// Turns a raw payload (Entry.CompressedSize bytes read at Entry.Offset) into the resource bytes.
DbpfError DecodeEntry(const IndexEntry& Entry, const uint8_t* Raw, size_t RawSize, std::vector<uint8_t>& Out);

// Human readable name for well-known Spore type IDs, or nullptr.
const char* KnownTypeName(uint32_t TypeId);

// Parses a SporeModder-FX registry file (reg_type.txt, reg_property.txt, ...):
// one "name<whitespace>0xID" per line; a line holding only a name maps to FnvHash(name).
// The first name seen for an ID wins. Returns the number of entries added.
size_t ParseNameRegistry(const std::string& Text, std::unordered_map<uint32_t, std::string>& Out);

// Integrity checks run over one package index (overlapping payloads, duplicate
// keys, zero-sized entries). Each issue is appended as a readable line.
void ValidateIndex(const std::vector<IndexEntry>& Entries, uint64_t FileSize, std::vector<std::string>& OutIssues);

} // namespace sporecore
