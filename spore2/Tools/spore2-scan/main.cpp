// spore2-scan: verifies that the Spore2Interop core can read a local Spore install.
//
// Usage:
//   spore2-scan [--verify] [--props] [--png] [--extract DIR] [--type HEX|png|prop|rw4]
//               [--names SMFX_DIR] [--find NAME[,NAME...]] [ROOT...]
//
// With no ROOT arguments it scans the default install locations listed below.
// Nothing is modified; --extract only writes into DIR.
//
// --names points at a SporeModder-FX folder; its reg_*.txt files turn hashes into names.
// --find reports which packages hold a resource whose instance or group is the hash of NAME
//        (e.g. --find CakeEditor,CellEditor to check claims about hidden editors).

#include "SporeCore/SporeDbpf.h"
#include "SporeCore/SporePng.h"
#include "SporeCore/SporeProp.h"

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
	bool bProps = false;
	std::string NamesDir;
	std::vector<std::string> FindNames;
	std::string ExtractDir;
	bool bHasTypeFilter = false;
	uint32_t TypeFilter = 0;
	std::vector<std::string> Roots;
};

// Hash -> name tables loaded from SporeModder-FX registries.
struct NameTables
{
	std::unordered_map<uint32_t, std::string> Files;
	std::unordered_map<uint32_t, std::string> Types;
	std::unordered_map<uint32_t, std::string> Properties;

	static std::string Lookup(const std::unordered_map<uint32_t, std::string>& Table, uint32_t Id)
	{
		const auto It = Table.find(Id);
		return It == Table.end() ? std::string() : It->second;
	}
};

NameTables Names;

size_t LoadRegistry(const fs::path& File, std::unordered_map<uint32_t, std::string>& Out)
{
	std::ifstream In(File);
	if (!In) return 0;
	const std::string Text((std::istreambuf_iterator<char>(In)), std::istreambuf_iterator<char>());
	return ParseNameRegistry(Text, Out);
}

struct FindTarget
{
	std::string Name;
	uint32_t Hash = 0;
	std::vector<std::string> Hits;
};

std::vector<FindTarget> FindTargets;

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

std::string FormatSize(uint64_t Bytes)
{
	char Buffer[32];
	if (Bytes >= 1024ull * 1024 * 1024) std::snprintf(Buffer, sizeof(Buffer), "%.1f GB", Bytes / (1024.0 * 1024 * 1024));
	else if (Bytes >= 1024ull * 1024) std::snprintf(Buffer, sizeof(Buffer), "%.1f MB", Bytes / (1024.0 * 1024));
	else std::snprintf(Buffer, sizeof(Buffer), "%.1f KB", Bytes / 1024.0);
	return Buffer;
}

std::string TypeLabel(uint32_t Type)
{
	const std::string Registered = NameTables::Lookup(Names.Types, Type);
	if (!Registered.empty())
	{
		return Registered;
	}
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
	size_t PropsDecoded = 0;
	size_t PropsFailed = 0;
	std::vector<std::string> PropFailureSamples;
	std::map<std::string, size_t> TypeCounts;
	// key -> packages that provide it, in scan order (later = higher override priority)
	std::unordered_map<ResourceKey, std::vector<std::string>, ResourceKeyHash> Providers;
};

void ScanPackage(const fs::path& Path, const fs::path& Root, const Options& Opts, ScanTotals& Totals)
{
	// Shown relative to the scan root so same-named packages (one per language, etc.) are distinguishable.
	std::error_code RelEc;
	const std::string DisplayName = fs::relative(Path, Root, RelEc).string();
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

		for (FindTarget& Target : FindTargets)
		{
			if (Entry.Key.Instance == Target.Hash || Entry.Key.Group == Target.Hash)
			{
				char Hit[160];
				std::snprintf(Hit, sizeof(Hit), "%s  %08X!%08X.%s", PackageName.c_str(), Entry.Key.Group, Entry.Key.Instance, TypeLabel(Entry.Key.Type).c_str());
				Target.Hits.push_back(Hit);
			}
		}

		const bool bIsProp = Entry.Key.Type == 0x00B1B104;
		const bool bWanted = !Opts.bHasTypeFilter || Entry.Key.Type == Opts.TypeFilter;
		const bool bExtract = !Opts.ExtractDir.empty() && bWanted;
		const bool bDecodeProp = Opts.bProps && bIsProp;
		if (!Opts.bVerify && !bExtract && !bDecodeProp)
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

		PropertyList Props;
		const bool bPropOk = (bDecodeProp || (bExtract && bIsProp)) && ParsePropertyList(Decoded.data(), Decoded.size(), Props);
		if (bDecodeProp)
		{
			if (bPropOk)
			{
				++Totals.PropsDecoded;
			}
			else
			{
				++Totals.PropsFailed;
				if (Totals.PropFailureSamples.size() < 10)
				{
					char Sample[256];
					std::snprintf(Sample, sizeof(Sample), "%s %08X!%08X: %s", PackageName.c_str(), Entry.Key.Group, Entry.Key.Instance, Props.Error.c_str());
					Totals.PropFailureSamples.push_back(Sample);
				}
			}
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

			// Readable companion file for property lists.
			if (bPropOk)
			{
				std::ofstream Text(OutDir / (std::string(Name) + ".txt"));
				for (const Property& Prop : Props.Properties)
				{
					Text << FormatProperty(Prop, NameTables::Lookup(Names.Properties, Prop.Id)) << '\n';
				}
			}
		}
	}
	Totals.DecodeFailures += LocalFailures;

	std::printf("  ok   %-56s v%u.%u  %6zu entries  %s", RelEc ? PackageName.c_str() : DisplayName.c_str(), Header.MajorVersion, Header.MinorVersion, Entries.size(), FormatSize(FileSize).c_str());
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
	std::printf("usage: spore2-scan [--verify] [--props] [--png] [--extract DIR] [--type HEX|png|prop|rw4|raster]\n"
	            "                   [--names SMFX_DIR] [--find NAME[,NAME...]] [ROOT...]\n");
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
		else if (Arg == "--props") Opts.bProps = true;
		else if (Arg == "--names" && I + 1 < Argc) Opts.NamesDir = Argv[++I];
		else if (Arg == "--find" && I + 1 < Argc)
		{
			std::string List = Argv[++I];
			size_t Start = 0;
			while (Start <= List.size())
			{
				const size_t Comma = List.find(',', Start);
				const std::string Item = List.substr(Start, Comma == std::string::npos ? std::string::npos : Comma - Start);
				if (!Item.empty()) Opts.FindNames.push_back(Item);
				if (Comma == std::string::npos) break;
				Start = Comma + 1;
			}
		}
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

	if (!Opts.NamesDir.empty())
	{
		const fs::path Dir(Opts.NamesDir);
		const size_t FileCount = LoadRegistry(Dir / "reg_file.txt", Names.Files);
		const size_t TypeCount = LoadRegistry(Dir / "reg_type.txt", Names.Types);
		const size_t PropCount = LoadRegistry(Dir / "reg_property.txt", Names.Properties);
		std::printf("name registries: %zu files, %zu types, %zu properties\n", FileCount, TypeCount, PropCount);
		if (FileCount + TypeCount + PropCount == 0)
		{
			std::printf("  (no reg_*.txt found in %s - point --names at the SporeModder-FX folder)\n", Opts.NamesDir.c_str());
		}
	}
	for (const std::string& Name : Opts.FindNames)
	{
		FindTarget Target;
		Target.Name = Name;
		// Prefer an explicit registry id; fall back to the FNV hash Spore uses for names.
		Target.Hash = FnvHash(Name);
		for (const auto& [Id, Registered] : Names.Files)
		{
			if (Registered == Name) { Target.Hash = Id; break; }
		}
		FindTargets.push_back(Target);
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
			if (Extensions.count(".iso"))
			{
				std::printf("  hint: this folder holds a disc image. Mount it (hdiutil attach <file>.iso) and scan the mounted volume.\n");
			}
			for (const auto& [Ext, Count] : Extensions)
			{
				std::printf("    %-10s %zu\n", Ext.c_str(), Count);
			}
		}
		for (const fs::path& Package : Packages)
		{
			ScanPackage(Package, Root, Opts, Totals);
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
	if (Opts.bProps)
	{
		std::printf("  prop files:       %zu decoded, %zu failed\n", Totals.PropsDecoded, Totals.PropsFailed);
		for (const std::string& Sample : Totals.PropFailureSamples)
		{
			std::printf("    ! %s\n", Sample.c_str());
		}
	}
	if (!Opts.ExtractDir.empty()) std::printf("  extracted files:  %zu -> %s\n", Totals.Extracted, Opts.ExtractDir.c_str());

	std::vector<std::pair<std::string, size_t>> Types(Totals.TypeCounts.begin(), Totals.TypeCounts.end());
	std::sort(Types.begin(), Types.end(), [](const auto& A, const auto& B) { return A.second > B.second; });
	std::printf("  top resource types:\n");
	for (size_t I = 0; I < Types.size() && I < 15; ++I)
	{
		std::printf("    %-12s %zu\n", Types[I].first.c_str(), Types[I].second);
	}

	if (!FindTargets.empty())
	{
		std::printf("\nFind results\n");
		for (const FindTarget& Target : FindTargets)
		{
			std::printf("  %s (0x%08X): %s\n", Target.Name.c_str(), Target.Hash, Target.Hits.empty() ? "not found" : "");
			for (size_t I = 0; I < Target.Hits.size() && I < 20; ++I)
			{
				std::printf("    %s\n", Target.Hits[I].c_str());
			}
			if (Target.Hits.size() > 20) std::printf("    ... %zu more\n", Target.Hits.size() - 20);
		}
	}

	return (Totals.FailedPackages == 0 && Totals.DecodeFailures == 0) ? 0 : 1;
}
