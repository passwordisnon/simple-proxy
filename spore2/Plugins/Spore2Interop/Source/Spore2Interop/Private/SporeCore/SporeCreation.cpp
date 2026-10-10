// Spore 2.0 interop layer - decoder for Spore creation PNGs.

#include "SporeCore/SporeCreation.h"

#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <cstring>

namespace sporecore
{

namespace
{

uint32_t PngBE32(const uint8_t* P)
{
	return (static_cast<uint32_t>(P[0]) << 24) | (static_cast<uint32_t>(P[1]) << 16) | (static_cast<uint32_t>(P[2]) << 8) | static_cast<uint32_t>(P[3]);
}

uint8_t Paeth(uint8_t A, uint8_t B, uint8_t C)
{
	const int P = static_cast<int>(A) + B - C;
	const int PA = std::abs(P - A);
	const int PB = std::abs(P - B);
	const int PC = std::abs(P - C);
	if (PA <= PB && PA <= PC) return A;
	return PB <= PC ? B : C;
}

// Returns the text between <Tag> and </Tag> starting the search at From, or empty. Pos is
// set past the closing tag on success.
std::string TagText(const std::string& Xml, const char* Tag, size_t From, size_t Limit, size_t* Pos = nullptr)
{
	const std::string Open = std::string("<") + Tag + ">";
	const std::string Close = std::string("</") + Tag + ">";
	const size_t Start = Xml.find(Open, From);
	if (Start == std::string::npos || Start >= Limit) return std::string();
	const size_t TextStart = Start + Open.size();
	const size_t End = Xml.find(Close, TextStart);
	if (End == std::string::npos || End > Limit) return std::string();
	if (Pos) *Pos = End + Close.size();
	return Xml.substr(TextStart, End - TextStart);
}

uint32_t ParseHex(const std::string& Text)
{
	return static_cast<uint32_t>(std::strtoul(Text.c_str(), nullptr, 0));
}

// "a,b,c" -> up to Count floats.
void ParseFloats(const std::string& Text, float* Out, int Count)
{
	const char* P = Text.c_str();
	for (int I = 0; I < Count && *P; ++I)
	{
		char* End = nullptr;
		Out[I] = std::strtof(P, &End);
		if (End == P) break;
		P = End;
		while (*P == ',' || *P == ' ') ++P;
	}
}

} // namespace

bool DecodePngImage(const uint8_t* Data, size_t Size, const InflateFn& Inflate, PngImage& Out, std::string& Error)
{
	Out = PngImage();
	static const uint8_t Signature[8] = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
	if (Size < 8 || std::memcmp(Data, Signature, 8) != 0)
	{
		Error = "not a PNG";
		return false;
	}
	if (!Inflate)
	{
		Error = "no inflater available";
		return false;
	}

	uint8_t BitDepth = 0, ColorType = 0, Interlace = 0;
	std::vector<uint8_t> Compressed;
	size_t Pos = 8;
	while (Pos + 12 <= Size)
	{
		const uint32_t Length = PngBE32(Data + Pos);
		if (Length > Size - Pos - 12) break;
		const uint8_t* Type = Data + Pos + 4;
		const uint8_t* Body = Data + Pos + 8;
		if (std::memcmp(Type, "IHDR", 4) == 0 && Length >= 13)
		{
			Out.Width = PngBE32(Body);
			Out.Height = PngBE32(Body + 4);
			BitDepth = Body[8];
			ColorType = Body[9];
			Interlace = Body[12];
		}
		else if (std::memcmp(Type, "IDAT", 4) == 0)
		{
			Compressed.insert(Compressed.end(), Body, Body + Length);
		}
		else if (std::memcmp(Type, "IEND", 4) == 0)
		{
			break;
		}
		Pos += 12 + Length;
	}

	if (BitDepth != 8 || (ColorType != 6 && ColorType != 2) || Interlace != 0)
	{
		Error = "unsupported PNG layout (need 8-bit RGB/RGBA, not interlaced)";
		return false;
	}
	if (Out.Width == 0 || Out.Height == 0 || Out.Width > 8192 || Out.Height > 8192)
	{
		Error = "implausible PNG dimensions";
		return false;
	}

	std::vector<uint8_t> Raw;
	if (!Inflate(Compressed.data(), Compressed.size(), Raw))
	{
		Error = "could not inflate image data";
		return false;
	}
	const size_t Channels = ColorType == 6 ? 4 : 3;
	const size_t Stride = Out.Width * Channels;
	if (Raw.size() < (Stride + 1) * Out.Height)
	{
		Error = "image data shorter than expected";
		return false;
	}

	// Undo the per-row filters (spec section 9).
	std::vector<uint8_t> Pixels(Stride * Out.Height);
	for (uint32_t Y = 0; Y < Out.Height; ++Y)
	{
		const uint8_t Filter = Raw[Y * (Stride + 1)];
		const uint8_t* Src = &Raw[Y * (Stride + 1) + 1];
		uint8_t* Row = &Pixels[Y * Stride];
		const uint8_t* Prev = Y > 0 ? &Pixels[(Y - 1) * Stride] : nullptr;
		for (size_t X = 0; X < Stride; ++X)
		{
			const uint8_t A = X >= Channels ? Row[X - Channels] : 0;
			const uint8_t B = Prev ? Prev[X] : 0;
			const uint8_t C = (Prev && X >= Channels) ? Prev[X - Channels] : 0;
			uint8_t Value = Src[X];
			switch (Filter)
			{
			case 0: break;
			case 1: Value = static_cast<uint8_t>(Value + A); break;
			case 2: Value = static_cast<uint8_t>(Value + B); break;
			case 3: Value = static_cast<uint8_t>(Value + ((A + B) >> 1)); break;
			case 4: Value = static_cast<uint8_t>(Value + Paeth(A, B, C)); break;
			default:
				Error = "invalid PNG filter type";
				return false;
			}
			Row[X] = Value;
		}
	}

	Out.Rgba.resize(static_cast<size_t>(Out.Width) * Out.Height * 4);
	for (size_t I = 0; I < static_cast<size_t>(Out.Width) * Out.Height; ++I)
	{
		Out.Rgba[I * 4 + 0] = Pixels[I * Channels + 0];
		Out.Rgba[I * 4 + 1] = Pixels[I * Channels + 1];
		Out.Rgba[I * 4 + 2] = Pixels[I * Channels + 2];
		Out.Rgba[I * 4 + 3] = Channels == 4 ? Pixels[I * Channels + 3] : 255;
	}
	return true;
}

std::vector<uint8_t> ExtractHiddenBytes(const uint8_t* Bgra, size_t Size, size_t MaxBytes)
{
	// The walk is a 16-bit LFSR over byte positions, so the buffer must cover 0..0xFFFF.
	constexpr uint32_t Start = 0x0B400;
	std::vector<uint8_t> Out;
	if (Size < 0x10000)
	{
		return Out;
	}
	uint32_t Hash = 0x811C9DC5u;
	uint32_t Next = Start;
	Out.reserve(MaxBytes);
	while (Out.size() < MaxBytes)
	{
		uint32_t Byte = 0;
		for (int Bit = 0; Bit < 8; ++Bit)
		{
			const uint32_t N = Next;
			const uint32_t D = Bgra[N];
			Hash = (Hash * 0x01000193u) ^ ((N & 7) | (D & 0xF8));
			const uint32_t Value = ((D & 1) << 7) ^ ((Hash & 0x8000) >> 8);
			Byte = (Byte >> 1) | Value;
			Next = (N >> 1) ^ (Start & (0u - (N & 1)));
			if (Next == Start)
			{
				return Out; // walk exhausted mid-byte; the partial byte is dropped
			}
		}
		Out.push_back(static_cast<uint8_t>(Byte));
	}
	return Out;
}

bool ParseSporeModelXml(const std::string& Xml, SporeCreation& Out, std::string& Error)
{
	Out.Blocks.clear();
	const size_t ModelStart = Xml.find("<sporemodel");
	if (ModelStart == std::string::npos)
	{
		Error = "no <sporemodel> element";
		return false;
	}
	Out.FormatVersion = static_cast<uint32_t>(std::strtoul(TagText(Xml, "formatversion", ModelStart, Xml.size()).c_str(), nullptr, 10));
	Out.ModelType = ParseHex(TagText(Xml, "modeltype", ModelStart, Xml.size()));

	size_t Pos = ModelStart;
	while (true)
	{
		const size_t BlockStart = Xml.find("<blockref>", Pos);
		if (BlockStart == std::string::npos) break;
		const size_t BlockEnd = Xml.find("</blockref>", BlockStart);
		if (BlockEnd == std::string::npos)
		{
			Error = "unterminated <blockref>";
			return false;
		}
		CreationBlock Block;
		const std::string Id = TagText(Xml, "blockid", BlockStart, BlockEnd);
		const size_t Comma = Id.find(',');
		if (Comma != std::string::npos)
		{
			Block.Group = ParseHex(Id.substr(0, Comma));
			Block.Instance = ParseHex(Id.substr(Comma + 1));
		}
		else
		{
			Block.Instance = ParseHex(Id);
		}
		const std::string ScaleText = TagText(Xml, "scale", BlockStart, BlockEnd);
		if (!ScaleText.empty()) Block.Scale = std::strtof(ScaleText.c_str(), nullptr);
		ParseFloats(TagText(Xml, "position", BlockStart, BlockEnd), Block.Position, 3);
		ParseFloats(TagText(Xml, "row0", BlockStart, BlockEnd), Block.Rotation, 3);
		ParseFloats(TagText(Xml, "row1", BlockStart, BlockEnd), Block.Rotation + 3, 3);
		ParseFloats(TagText(Xml, "row2", BlockStart, BlockEnd), Block.Rotation + 6, 3);
		Block.bSnapped = TagText(Xml, "snapped", BlockStart, BlockEnd) == "true";
		Block.bAsymmetric = TagText(Xml, "isasymmetric", BlockStart, BlockEnd) == "true";

		size_t Cursor = BlockStart;
		std::string Child;
		while (!(Child = TagText(Xml, "childid", Cursor, BlockEnd, &Cursor)).empty())
		{
			Block.Children.push_back(static_cast<int32_t>(std::strtol(Child.c_str(), nullptr, 10)));
		}

		Cursor = BlockStart;
		std::string PaintXml;
		while (!(PaintXml = TagText(Xml, "paint", Cursor, BlockEnd, &Cursor)).empty())
		{
			CreationPaint Paint;
			Paint.Region = ParseHex(TagText(PaintXml, "paintregion", 0, PaintXml.size()));
			Paint.PaintId = ParseHex(TagText(PaintXml, "paintid", 0, PaintXml.size()));
			ParseFloats(TagText(PaintXml, "color1", 0, PaintXml.size()), Paint.Color1, 3);
			ParseFloats(TagText(PaintXml, "color2", 0, PaintXml.size()), Paint.Color2, 3);
			Block.Paints.push_back(Paint);
		}

		Out.Blocks.push_back(std::move(Block));
		Pos = BlockEnd + 11;
	}
	return true;
}

bool FindPartModelKey(const PropertyList& Props, ResourceKey& OutKey)
{
	static const uint32_t Order[] = {PropModelMeshLOD0, PropModelMeshLOD1, PropModelMeshLOD2, PropModelMeshLOD3, PropModelMeshLowRes};
	for (uint32_t Wanted : Order)
	{
		for (const Property& Prop : Props.Properties)
		{
			if (Prop.Id == Wanted && Prop.Type == static_cast<uint16_t>(PropType::Key) && !Prop.Keys.empty())
			{
				OutKey = Prop.Keys.front();
				if (OutKey.Type == 0)
				{
					OutKey.Type = 0x2F4E681B; // rw4
				}
				return true;
			}
		}
	}
	return false;
}

void PlaceMesh(MeshData& Mesh, const CreationBlock& Block, bool bTransposeRotation)
{
	const float* R = Block.Rotation;
	// Row-vector convention: v' = v * R, so output component j = sum_i v_i * R[i][j].
	auto Rotate = [&](const float* V, float* Out)
	{
		for (int J = 0; J < 3; ++J)
		{
			Out[J] = bTransposeRotation ? (R[J * 3 + 0] * V[0] + R[J * 3 + 1] * V[1] + R[J * 3 + 2] * V[2])
			                            : (V[0] * R[0 * 3 + J] + V[1] * R[1 * 3 + J] + V[2] * R[2 * 3 + J]);
		}
	};
	for (size_t I = 0; I + 2 < Mesh.Positions.size(); I += 3)
	{
		const float Scaled[3] = {Mesh.Positions[I] * Block.Scale, Mesh.Positions[I + 1] * Block.Scale, Mesh.Positions[I + 2] * Block.Scale};
		float Rotated[3];
		Rotate(Scaled, Rotated);
		for (int K = 0; K < 3; ++K) Mesh.Positions[I + K] = Rotated[K] + Block.Position[K];
	}
	for (size_t I = 0; I + 2 < Mesh.Normals.size(); I += 3)
	{
		float Rotated[3];
		Rotate(&Mesh.Normals[I], Rotated);
		for (int K = 0; K < 3; ++K) Mesh.Normals[I + K] = Rotated[K];
	}
}

bool DecodeSporeCreation(const uint8_t* Data, size_t Size, const InflateFn& Inflate, SporeCreation& Out, std::string& Error)
{
	Out = SporeCreation();
	PngImage Image;
	if (!DecodePngImage(Data, Size, Inflate, Image, Error))
	{
		return false;
	}
	if (Image.Width != 128 || Image.Height != 128)
	{
		Error = "not a 128x128 creation card";
		return false;
	}

	// The decoder walks the pixels as B, G, R, A bytes.
	std::vector<uint8_t> Bgra(Image.Rgba.size());
	for (size_t I = 0; I + 3 < Image.Rgba.size(); I += 4)
	{
		Bgra[I + 0] = Image.Rgba[I + 2];
		Bgra[I + 1] = Image.Rgba[I + 1];
		Bgra[I + 2] = Image.Rgba[I + 0];
		Bgra[I + 3] = Image.Rgba[I + 3];
	}

	// Header: 4-byte magic, 4-byte little-endian length (some files store it negated).
	std::vector<uint8_t> Stream = ExtractHiddenBytes(Bgra.data(), Bgra.size(), 0x10000 / 8);
	if (Stream.size() < 8)
	{
		Error = "no hidden data in card";
		return false;
	}
	int32_t Length = static_cast<int32_t>(static_cast<uint32_t>(Stream[4]) | (static_cast<uint32_t>(Stream[5]) << 8) |
		(static_cast<uint32_t>(Stream[6]) << 16) | (static_cast<uint32_t>(Stream[7]) << 24));
	if (Length < 0) Length = -Length;
	std::vector<uint8_t> Payload(Stream.begin() + 8, Stream.begin() + 8 + std::min<size_t>(static_cast<size_t>(Length), Stream.size() - 8));

	// Large creations keep the full payload in a "spOr" chunk after IEND.
	size_t Pos = 8;
	while (Pos + 12 <= Size)
	{
		const uint32_t ChunkLength = PngBE32(Data + Pos);
		if (ChunkLength > Size - Pos - 12) break;
		if (std::memcmp(Data + Pos + 4, "spOr", 4) == 0 && ChunkLength > 0x14)
		{
			const uint8_t* Body = Data + Pos + 8;
			Payload.assign(Body + 8, Body + 8 + (ChunkLength - 0x14));
			Out.bUsedExtraChunk = true;
			break;
		}
		Pos += 12 + ChunkLength;
	}

	std::vector<uint8_t> Decompressed;
	if (!Inflate(Payload.data(), Payload.size(), Decompressed))
	{
		Error = "hidden payload is not valid zlib data (creation too large for its card without an spOr chunk, or an unsupported asset such as Darkspore)";
		return false;
	}

	const std::string Text(reinterpret_cast<const char*>(Decompressed.data()), Decompressed.size());
	const size_t XmlStart = Text.find("<?xml");
	if (XmlStart == std::string::npos)
	{
		// Adventures and some other assets carry binary data instead of model XML.
		Out.Metadata = Text;
		return true;
	}
	Out.Metadata = Text.substr(0, XmlStart);
	Out.ModelXml = Text.substr(XmlStart);
	return ParseSporeModelXml(Out.ModelXml, Out, Error);
}

bool IsCreationXmlType(uint32_t Type)
{
	return Type == TypeCreature || Type == TypeBuilding || Type == TypeVehicle || Type == TypeUfo || Type == TypeCell || Type == TypeFlora;
}

namespace
{

struct BeReader
{
	const uint8_t* Data;
	size_t Size;
	size_t Pos = 0;
	bool bOk = true;

	uint32_t U32()
	{
		if (Pos > Size || Size - Pos < 4) { bOk = false; Pos = Size; return 0; }
		const uint8_t* P = Data + Pos;
		Pos += 4;
		return (static_cast<uint32_t>(P[0]) << 24) | (static_cast<uint32_t>(P[1]) << 16) | (static_cast<uint32_t>(P[2]) << 8) | P[3];
	}
	int64_t I64()
	{
		const uint64_t High = U32();
		return static_cast<int64_t>((High << 32) | U32());
	}
	void Key(ResourceKey& K)
	{
		K.Type = U32();
		K.Group = U32();
		K.Instance = U32();
	}
	// Length prefix counts characters; bWide = UTF-16LE, otherwise single-byte ASCII.
	std::string Text(bool bWide)
	{
		const uint32_t Length = U32();
		const size_t Bytes = static_cast<size_t>(Length) * (bWide ? 2 : 1);
		if (!bOk || Length > Size || Size - Pos < Bytes) { bOk = false; Pos = Size; return {}; }
		std::string Out = bWide ? Utf16LeToUtf8(Data + Pos, Length, false) : std::string(reinterpret_cast<const char*>(Data + Pos), Length);
		Pos += Bytes;
		return Out;
	}
};

} // namespace

bool ParsePollenMetadata(const uint8_t* Data, size_t Size, PollenMetadata& Out, std::string& Error)
{
	Out = PollenMetadata();
	BeReader R{Data, Size};
	Out.Version = R.U32();
	if (R.bOk && Out.Version > 13)
	{
		Error = "unsupported pollen_metadata version " + std::to_string(Out.Version);
		return false;
	}
	Out.AssetId = R.I64();
	R.Key(Out.AssetKey);
	R.Key(Out.ParentKey);
	if (Out.Version >= 10) Out.ParentAssetId = R.I64();
	if (Out.Version >= 12) Out.OriginalParentAssetId = R.I64();
	Out.TimeCreated = R.I64();
	if (Out.Version == 10)
	{
		// Version 10 writes a single 0xFFFFFFFF when there is no download time.
		const uint64_t High = R.U32();
		if (High != 0xFFFFFFFFu) Out.TimeDownloaded = static_cast<int64_t>((High << 32) | R.U32());
	}
	else if (Out.Version >= 9)
	{
		Out.TimeDownloaded = R.I64();
	}

	if (R.U32() == 0)
	{
		Out.AuthorId = R.I64();
		Out.AuthorName = R.Text(true);
		Out.Name = R.Text(true);
		Out.Description = R.Text(true);
	}
	else
	{
		Out.bLocalized = true;
		Out.LocaleTable = R.U32();
		Out.AuthorNameLocale = R.U32();
		Out.NameLocale = R.U32();
		Out.DescriptionLocale = R.U32();
	}

	if (Out.Version >= 2)
	{
		const uint32_t Count = R.U32();
		for (uint32_t I = 0; I < Count && R.bOk; ++I) Out.Authors.push_back(R.Text(false));
	}
	else if (Out.Version == 1)
	{
		Out.Authors.push_back(R.Text(false));
	}

	const uint32_t TagMode = Out.Version >= 13 ? R.U32() : 0;
	if (TagMode == 0)
	{
		const uint32_t Count = R.U32();
		for (uint32_t I = 0; I < Count && R.bOk; ++I) Out.Tags.push_back(R.Text(true));
	}
	else
	{
		R.U32(); // table id (same table as the names)
		Out.TagsLocale = R.U32();
	}

	if (Out.Version >= 8)
	{
		Out.bShareable = R.U32() != 0;
		const uint32_t Count = R.U32();
		for (uint32_t I = 0; I < Count && R.bOk; ++I) Out.ConsequenceTraits.push_back(R.U32());
	}

	if (!R.bOk)
	{
		Error = "pollen_metadata is truncated";
		return false;
	}
	return true;
}

std::string FormatPollenMetadata(const PollenMetadata& Meta)
{
	char Buffer[160];
	std::string Out;
	auto Line = [&Out](const char* Field, const std::string& Value) { Out += Field; Out += ": "; Out += Value; Out += '\n'; };
	auto KeyText = [&Buffer](const ResourceKey& K)
	{
		std::snprintf(Buffer, sizeof(Buffer), "%08X!%08X.%08X", K.Group, K.Instance, K.Type);
		return std::string(Buffer);
	};
	// Seconds since 0001-01-01 (as real files suggest) -> civil UTC date, or the raw value.
	auto TimeText = [&Buffer](int64_t T)
	{
		constexpr int64_t UnixEpochFromYear1 = 62135596800ll;
		if (T < UnixEpochFromYear1)
		{
			std::snprintf(Buffer, sizeof(Buffer), "%lld", static_cast<long long>(T));
			return std::string(Buffer);
		}
		const int64_t Days = (T - UnixEpochFromYear1) / 86400;
		// Howard Hinnant's days_from_civil inverse.
		const int64_t Z = Days + 719468;
		const int64_t Era = Z / 146097;
		const int64_t Doe = Z - Era * 146097;
		const int64_t Yoe = (Doe - Doe / 1460 + Doe / 36524 - Doe / 146096) / 365;
		const int64_t Doy = Doe - (365 * Yoe + Yoe / 4 - Yoe / 100);
		const int64_t Mp = (5 * Doy + 2) / 153;
		const int64_t Day = Doy - (153 * Mp + 2) / 5 + 1;
		const int64_t Month = Mp < 10 ? Mp + 3 : Mp - 9;
		const int64_t Year = Yoe + Era * 400 + (Month <= 2 ? 1 : 0);
		std::snprintf(Buffer, sizeof(Buffer), "%04lld-%02lld-%02lld (raw %lld)", static_cast<long long>(Year), static_cast<long long>(Month), static_cast<long long>(Day), static_cast<long long>(T));
		return std::string(Buffer);
	};

	Line("version", std::to_string(Meta.Version));
	if (Meta.bLocalized)
	{
		std::snprintf(Buffer, sizeof(Buffer), "locale table 0x%08X: author 0x%08X, name 0x%08X, description 0x%08X", Meta.LocaleTable, Meta.AuthorNameLocale, Meta.NameLocale, Meta.DescriptionLocale);
		Line("localized", Buffer);
	}
	else
	{
		Line("name", Meta.Name);
		Line("author", Meta.AuthorName);
		Line("description", Meta.Description);
		Line("author id", std::to_string(Meta.AuthorId));
	}
	Line("asset id", std::to_string(Meta.AssetId));
	Line("asset key", KeyText(Meta.AssetKey));
	Line("parent key", KeyText(Meta.ParentKey));
	Line("parent asset id", std::to_string(Meta.ParentAssetId));
	Line("created", Meta.TimeCreated == -1 ? std::string("-") : TimeText(Meta.TimeCreated));
	Line("downloaded", Meta.TimeDownloaded == -1 ? std::string("-") : TimeText(Meta.TimeDownloaded));
	std::string List;
	for (const std::string& A : Meta.Authors) List += (List.empty() ? "" : ", ") + A;
	Line("authors", List);
	List.clear();
	for (const std::string& T : Meta.Tags) List += (List.empty() ? "" : ", ") + T;
	Line("tags", List);
	Line("shareable", Meta.bShareable ? "yes" : "no");
	return Out;
}

} // namespace sporecore
