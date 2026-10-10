// Spore 2.0 interop layer - decoder for Spore creation PNGs.

#include "SporeCore/SporeCreation.h"

#include <algorithm>
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

} // namespace sporecore
