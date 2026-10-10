// Spore 2.0 interop layer - PNG chunk reader for creation cards.

#include "SporeCore/SporePng.h"

#include <array>
#include <cstring>

namespace sporecore
{

namespace
{

uint32_t ReadBE32(const uint8_t* P)
{
	return (static_cast<uint32_t>(P[0]) << 24) | (static_cast<uint32_t>(P[1]) << 16) | (static_cast<uint32_t>(P[2]) << 8) | static_cast<uint32_t>(P[3]);
}

const std::array<uint32_t, 256>& CrcTable()
{
	static const std::array<uint32_t, 256> Table = []
	{
		std::array<uint32_t, 256> T{};
		for (uint32_t N = 0; N < 256; ++N)
		{
			uint32_t C = N;
			for (int K = 0; K < 8; ++K)
			{
				C = (C & 1) ? 0xEDB88320u ^ (C >> 1) : C >> 1;
			}
			T[N] = C;
		}
		return T;
	}();
	return Table;
}

const uint8_t PngSignature[8] = {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};

} // namespace

uint32_t Crc32(const uint8_t* Data, size_t Size, uint32_t Seed)
{
	const auto& Table = CrcTable();
	uint32_t C = Seed ^ 0xFFFFFFFFu;
	for (size_t I = 0; I < Size; ++I)
	{
		C = Table[(C ^ Data[I]) & 0xFF] ^ (C >> 8);
	}
	return C ^ 0xFFFFFFFFu;
}

bool ReadPngChunks(const uint8_t* Data, size_t Size, const InflateFn& Inflate, PngInfo& Out)
{
	if (Size < 8 || std::memcmp(Data, PngSignature, 8) != 0)
	{
		return false;
	}

	size_t Pos = 8;
	while (Pos + 12 <= Size)
	{
		const uint32_t Length = ReadBE32(Data + Pos);
		const uint8_t* TypePtr = Data + Pos + 4;
		const std::string Type(reinterpret_cast<const char*>(TypePtr), 4);
		if (Length > Size - Pos - 12)
		{
			Out.Issues.push_back("chunk " + Type + " is truncated");
			break;
		}

		const uint8_t* Body = Data + Pos + 8;
		const uint32_t StoredCrc = ReadBE32(Body + Length);
		if (Crc32(TypePtr, Length + 4) != StoredCrc)
		{
			Out.Issues.push_back("CRC mismatch in chunk " + Type);
		}
		Out.ChunkOrder.push_back(Type);

		if (Type == "IHDR" && Length >= 13)
		{
			Out.Width = ReadBE32(Body);
			Out.Height = ReadBE32(Body + 4);
			Out.BitDepth = Body[8];
			Out.ColorType = Body[9];
		}
		else if (Type == "tEXt" || Type == "zTXt" || Type == "iTXt")
		{
			const uint8_t* End = Body + Length;
			const uint8_t* KeyEnd = static_cast<const uint8_t*>(std::memchr(Body, 0, Length));
			if (!KeyEnd)
			{
				Out.Issues.push_back(Type + " chunk without keyword terminator");
			}
			else
			{
				PngTextChunk Text;
				Text.ChunkType = Type;
				Text.Keyword.assign(reinterpret_cast<const char*>(Body), KeyEnd - Body);
				const uint8_t* Cursor = KeyEnd + 1;
				bool bCompressed = false;

				if (Type == "zTXt")
				{
					bCompressed = true;
					Cursor += 1; // compression method, always 0 (zlib)
				}
				else if (Type == "iTXt")
				{
					// flag, method, then NUL-terminated language tag and translated keyword
					bCompressed = Cursor < End && *Cursor == 1;
					Cursor += 2;
					for (int Skip = 0; Skip < 2 && Cursor < End; ++Skip)
					{
						const uint8_t* Nul = static_cast<const uint8_t*>(std::memchr(Cursor, 0, End - Cursor));
						Cursor = Nul ? Nul + 1 : End;
					}
				}

				if (Cursor > End)
				{
					Cursor = End;
				}
				if (bCompressed && Inflate && Inflate(Cursor, End - Cursor, Text.Value))
				{
					Text.bInflated = true;
				}
				else
				{
					if (bCompressed)
					{
						Out.Issues.push_back("could not inflate " + Type + " '" + Text.Keyword + "'");
					}
					Text.Value.assign(Cursor, End);
				}
				Out.TextChunks.push_back(std::move(Text));
			}
		}

		Pos += 12 + Length;
		if (Type == "IEND")
		{
			break;
		}
	}
	return true;
}

} // namespace sporecore
