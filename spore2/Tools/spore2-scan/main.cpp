// spore2-scan: verifies that the Spore2Interop core can read a local Spore install.
//
// Usage:
//   spore2-scan [--verify] [--png] [--extract DIR] [--type HEX|png|prop|rw4] [ROOT...]
//
// With no ROOT arguments it scans the default install locations listed below.
// Nothing is modified; --extract only writes into DIR.

#include "SporeCore/SporeDbpf.h"
#include "SporeCore/SporePng.h"

#include <zlib.h>

#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <map>
#include <string>
#include <unordered_map>
#include <vector>

namespace fs = std::filesystem;
using namespace sporecore;

namespace
{

const char* DefaultRoots[] = {
	"/Volumes/Macintosh SD/Spore.2008.EA",
	"/Volumes/Macintosh SD/Spore.Creepy.&.Cute.Parts.Pack.2008.EA",
	"/Volumes/Macintosh SD/Spore.Galactic.Adventures.Expansion.Pack.2009.EA",
};

struct Options
{
	bool bVerify = false;
	bool bPng = false;
	std::string ExtractDir;
	bool bHasTypeFilter = false;
	uint32_t TypeFilter = 0;
	std::vector<std::string> Roots;
};

bool ZlibInflate(const uint8_t* Data, size_t Size, std::vector<uint8_t>& Out)
{
	z_stream Stream{};
	if (inflateInit(&Stream) != Z_OK)
	{
		return false;
	}
	Stream.next_in = const_cast<Bytef*>(Data);
	Stream.avail_in = static_cast<uInt>(Size);
	Out.clear();
	uint8_t Buffer[16384];
	int Result = Z_OK;
	while (Result == Z_OK)
	{
		Stream.next_out = Buffer;
		Stream.avail_out = sizeof(Buffer);
		Result = inflate(&Stream, Z_NO_FLUSH);
		Out.insert(Out.end(), Buffer, Buffer + (sizeof(Buffer) - Stream.avail_out));
	}
	inflateEnd(&Stream);
	return Result == Z_STREAM_END;
}

bool ReadRange(std::ifstream& File, uint64_t Offset, size_t Size, std::vector<uint8_t>& Out)
{
	Out.resize(Size);
	File.clear();
	File.seekg(static_cast<std::streamoff>(Offset));
	File.read(reinterpret_cast<char*>(Out.data()), static_cast<std::streamsize>(Size));
	return static_cast<size_t>(File.gcount()) == Size;
}

std::string TypeLabel(uint32_t Type)
{
	if (const char* Name = KnownTypeName(Type))
	{
		return Name;
	}
	char Buffer[16];
	std::snprintf(Buffer, sizeof(Buffer), "0x%08X", Type);
	return Buffer;
}

bool ParseType(const std::string& Text, uint32_t& Out)
{
	for (uint32_t Known : {0x00B1B104u, 0x2F7D0004u, 0x2F4E681Bu, 0x2F4E681Cu})
	{
		if (Text == KnownTypeName(Known))
		{
			Out = Known;
			return true;
		}
	}
	char* End = nullptr;
	const unsigned long Value = std::strtoul(Text.c_str(), &End, 16);
	if (End == Text.c_str() || *End != '\0')
	{
		return false;
	}
	Out = static_cast<uint32_t>(Value);
	return true;
}

struct ScanTotals
{
	size_t Packages = 0;
	size_t FailedPackages = 0;
	size_t Entries = 0;
	size_t DecodeFailures = 0;
	size_t Extracted = 0;
	size_t Issues = 0;
	std::map<std::string, size_t> TypeCounts;
	// key -> packages that provide it, in scan order (later = higher override priority)
	std::unordered_map<ResourceKey, std::vector<std::string>, ResourceKeyHash> Providers;
};

void ScanPackage(const fs::path& Path, const Options& Opts, ScanTotals& Totals)
{
	++Totals.Packages;
	std::error_code Ec;
	const uint64_t FileSize = fs::file_size(Path, Ec);
	std::ifstream File(Path, std::ios::binary);
	std::vector<uint8_t> Buffer;

	DbpfHeader Header;
	DbpfError Error = DbpfError::TooSmall;
	if (!Ec && File && ReadRange(File, 0, DbpfHeaderSize, Buffer))
	{
		Error = ParseHeader(Buffer.data(), Buffer.size(), FileSize, Header);
	}
	std::vector<IndexEntry> Entries;
	if (Error == DbpfError::None)
	{
		Error = ReadRange(File, Header.IndexOffset, Header.IndexSize, Buffer)
			? ParseIndex(Buffer.data(), Buffer.size(), Header, FileSize, Entries)
			: DbpfError::IndexOutOfRange;
	}
	if (Error != DbpfError::None)
	{
		++Totals.FailedPackages;
		std::printf("  FAIL %s: %s\n", Path.string().c_str(), ToString(Error));
		return;
	}

	std::vector<std::string> Issues;
	ValidateIndex(Entries, FileSize, Issues);
	Totals.Issues += Issues.size();
	Totals.Entries += Entries.size();

	size_t LocalFailures = 0;
	const std::string PackageName = Path.filename().string();
	std::vector<uint8_t> Decoded;
	for (const IndexEntry& Entry : Entries)
	{
		++Totals.TypeCounts[TypeLabel(Entry.Key.Type)];
		Totals.Providers[Entry.Key].push_back(PackageName);

		const bool bWanted = !Opts.bHasTypeFilter || Entry.Key.Type == Opts.TypeFilter;
		const bool bExtract = !Opts.ExtractDir.empty() && bWanted;
		if (!Opts.bVerify && !bExtract)
		{
			continue;
		}

		DbpfError DecodeError = DbpfError::EntryOutOfRange;
		if (ReadRange(File, Entry.Offset, Entry.CompressedSize, Buffer))
		{
			DecodeError = DecodeEntry(Entry, Buffer.data(), Buffer.size(), Decoded);
		}
		if (DecodeError != DbpfError::None)
		{
			++LocalFailures;
			continue;
		}

		if (bExtract)
		{
			char Name[96];
			std::snprintf(Name, sizeof(Name), "%08X!%08X.%s", Entry.Key.Group, Entry.Key.Instance, TypeLabel(Entry.Key.Type).c_str());
			const fs::path OutDir = fs::path(Opts.ExtractDir) / Path.stem();
			fs::create_directories(OutDir, Ec);
			std::ofstream Out(OutDir / Name, std::ios::binary);
			Out.write(reinterpret_cast<const char*>(Decoded.data()), static_cast<std::streamsize>(Decoded.size()));
			++Totals.Extracted;
		}
	}
	Totals.DecodeFailures += LocalFailures;

	std::printf("  ok   %-48s v%u.%u  %6zu entries", PackageName.c_str(), Header.MajorVersion, Header.MinorVersion, Entries.size());
	if (Opts.bVerify)
	{
		std::printf("  decode failures: %zu", LocalFailures);
	}
	std::printf("\n");
	for (size_t I = 0; I < Issues.size() && I < 5; ++I)
	{
		std::printf("         ! %s\n", Issues[I].c_str());
	}
	if (Issues.size() > 5)
	{
		std::printf("         ! ... %zu more\n", Issues.size() - 5);
	}
}

void ScanPng(const fs::path& Path)
{
	std::ifstream File(Path, std::ios::binary);
	std::vector<uint8_t> Data((std::istreambuf_iterator<char>(File)), std::istreambuf_iterator<char>());
	PngInfo Info;
	if (!ReadPngChunks(Data.data(), Data.size(), ZlibInflate, Info))
	{
		return;
	}
	std::printf("  png  %s  %ux%u%s  text chunks: %zu\n", Path.filename().string().c_str(), Info.Width, Info.Height,
		Info.LooksLikeSporeCard() ? "  [card-shaped]" : "", Info.TextChunks.size());
	for (const PngTextChunk& Text : Info.TextChunks)
	{
		std::printf("         %s '%s' (%zu bytes%s)\n", Text.ChunkType.c_str(), Text.Keyword.c_str(), Text.Value.size(), Text.bInflated ? ", inflated" : "");
	}
	for (const std::string& Issue : Info.Issues)
	{
		std::printf("         ! %s\n", Issue.c_str());
	}
}

void PrintUsage()
{
	std::printf("usage: spore2-scan [--verify] [--png] [--extract DIR] [--type HEX|png|prop|rw4|raster] [ROOT...]\n");
}

} // namespace

int main(int Argc, char** Argv)
{
	Options Opts;
	for (int I = 1; I < Argc; ++I)
	{
		const std::string Arg = Argv[I];
		if (Arg == "--verify") Opts.bVerify = true;
		else if (Arg == "--png") Opts.bPng = true;
		else if (Arg == "--extract" && I + 1 < Argc) Opts.ExtractDir = Argv[++I];
		else if (Arg == "--type" && I + 1 < Argc)
		{
			if (!ParseType(Argv[++I], Opts.TypeFilter))
			{
				std::fprintf(stderr, "unknown type '%s'\n", Argv[I]);
				return 2;
			}
			Opts.bHasTypeFilter = true;
		}
		else if (Arg == "-h" || Arg == "--help") { PrintUsage(); return 0; }
		else if (!Arg.empty() && Arg[0] == '-') { PrintUsage(); return 2; }
		else Opts.Roots.push_back(Arg);
	}
	if (Opts.Roots.empty())
	{
		Opts.Roots.assign(std::begin(DefaultRoots), std::end(DefaultRoots));
	}

	ScanTotals Totals;
	for (const std::string& Root : Opts.Roots)
	{
		std::printf("%s\n", Root.c_str());
		std::error_code Ec;
		if (!fs::is_directory(Root, Ec))
		{
			std::printf("  missing or not a directory\n");
			continue;
		}

		std::vector<fs::path> Packages;
		std::vector<fs::path> Pngs;
		std::map<std::string, size_t> Extensions;
		for (auto It = fs::recursive_directory_iterator(Root, fs::directory_options::skip_permission_denied, Ec); !Ec && It != fs::recursive_directory_iterator(); It.increment(Ec))
		{
			if (!It->is_regular_file(Ec))
			{
				continue;
			}
			std::string Ext = It->path().extension().string();
			std::transform(Ext.begin(), Ext.end(), Ext.begin(), [](unsigned char C) { return static_cast<char>(std::tolower(C)); });
			++Extensions[Ext.empty() ? "(none)" : Ext];
			if (Ext == ".package") Packages.push_back(It->path());
			else if (Ext == ".png") Pngs.push_back(It->path());
		}
		std::sort(Packages.begin(), Packages.end());

		if (Packages.empty())
		{
			// Typical when the folder holds an installer or disc image rather than an install.
			std::printf("  no .package files found. File types present:\n");
			for (const auto& [Ext, Count] : Extensions)
			{
				std::printf("    %-10s %zu\n", Ext.c_str(), Count);
			}
		}
		for (const fs::path& Package : Packages)
		{
			ScanPackage(Package, Opts, Totals);
		}
		if (Opts.bPng)
		{
			for (const fs::path& Png : Pngs)
			{
				ScanPng(Png);
			}
		}
	}

	size_t Overridden = 0;
	for (const auto& [Key, Owners] : Totals.Providers)
	{
		if (Owners.size() > 1) ++Overridden;
	}

	std::printf("\nSummary\n");
	std::printf("  packages read:    %zu (%zu failed)\n", Totals.Packages - Totals.FailedPackages, Totals.FailedPackages);
	std::printf("  index entries:    %zu\n", Totals.Entries);
	std::printf("  index issues:     %zu\n", Totals.Issues);
	std::printf("  overridden keys:  %zu (same key in more than one package)\n", Overridden);
	if (Opts.bVerify) std::printf("  decode failures:  %zu\n", Totals.DecodeFailures);
	if (!Opts.ExtractDir.empty()) std::printf("  extracted files:  %zu -> %s\n", Totals.Extracted, Opts.ExtractDir.c_str());

	std::vector<std::pair<std::string, size_t>> Types(Totals.TypeCounts.begin(), Totals.TypeCounts.end());
	std::sort(Types.begin(), Types.end(), [](const auto& A, const auto& B) { return A.second > B.second; });
	std::printf("  top resource types:\n");
	for (size_t I = 0; I < Types.size() && I < 15; ++I)
	{
		std::printf("    %-12s %zu\n", Types[I].first.c_str(), Types[I].second);
	}

	return (Totals.FailedPackages == 0 && Totals.DecodeFailures == 0) ? 0 : 1;
}
