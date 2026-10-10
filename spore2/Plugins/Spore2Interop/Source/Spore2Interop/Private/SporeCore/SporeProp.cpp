// Spore 2.0 interop layer - binary .prop (property list) decoder.

#include "SporeCore/SporeProp.h"

#include <cstdio>
#include <cstring>

namespace sporecore
{

namespace
{

// Bounds-checked cursor; every read reports failure instead of overrunning.
struct PropReader
{
	const uint8_t* Data;
	size_t Size;
	size_t Pos = 0;

	bool Has(size_t Bytes) const { return Bytes <= Size - Pos; }

	bool Skip(size_t Bytes)
	{
		if (!Has(Bytes)) return false;
		Pos += Bytes;
		return true;
	}

	bool BE(size_t Bytes, uint64_t& Out)
	{
		if (!Has(Bytes)) return false;
		Out = 0;
		for (size_t I = 0; I < Bytes; ++I) Out = (Out << 8) | Data[Pos + I];
		Pos += Bytes;
		return true;
	}

	bool LE(size_t Bytes, uint64_t& Out)
	{
		if (!Has(Bytes)) return false;
		Out = 0;
		for (size_t I = 0; I < Bytes; ++I) Out |= static_cast<uint64_t>(Data[Pos + I]) << (8 * I);
		Pos += Bytes;
		return true;
	}

	bool BE32(uint32_t& Out)
	{
		uint64_t V;
		if (!BE(4, V)) return false;
		Out = static_cast<uint32_t>(V);
		return true;
	}

	bool LE32(uint32_t& Out)
	{
		uint64_t V;
		if (!LE(4, V)) return false;
		Out = static_cast<uint32_t>(V);
		return true;
	}

	bool LEFloat(double& Out)
	{
		uint32_t Bits;
		if (!LE32(Bits)) return false;
		float F;
		std::memcpy(&F, &Bits, sizeof(F));
		Out = F;
		return true;
	}

	bool LEFloats(size_t Count, std::vector<double>& Out)
	{
		for (size_t I = 0; I < Count; ++I)
		{
			double V;
			if (!LEFloat(V)) return false;
			Out.push_back(V);
		}
		return true;
	}
};

int64_t SignExtend(uint64_t Value, size_t Bytes)
{
	if (Bytes >= 8) return static_cast<int64_t>(Value);
	const uint64_t SignBit = 1ull << (Bytes * 8 - 1);
	return static_cast<int64_t>((Value ^ SignBit) - SignBit);
}

void AppendUtf8(std::string& Out, uint32_t CodePoint)
{
	if (CodePoint < 0x80)
	{
		Out += static_cast<char>(CodePoint);
	}
	else if (CodePoint < 0x800)
	{
		Out += static_cast<char>(0xC0 | (CodePoint >> 6));
		Out += static_cast<char>(0x80 | (CodePoint & 0x3F));
	}
	else if (CodePoint < 0x10000)
	{
		Out += static_cast<char>(0xE0 | (CodePoint >> 12));
		Out += static_cast<char>(0x80 | ((CodePoint >> 6) & 0x3F));
		Out += static_cast<char>(0x80 | (CodePoint & 0x3F));
	}
	else
	{
		Out += static_cast<char>(0xF0 | (CodePoint >> 18));
		Out += static_cast<char>(0x80 | ((CodePoint >> 12) & 0x3F));
		Out += static_cast<char>(0x80 | ((CodePoint >> 6) & 0x3F));
		Out += static_cast<char>(0x80 | (CodePoint & 0x3F));
	}
}

// UTF-16LE code units -> UTF-8, stopping at a NUL when bStopAtNul is set.
std::string Utf16LeToUtf8(const uint8_t* Bytes, size_t Units, bool bStopAtNul)
{
	std::string Out;
	for (size_t I = 0; I < Units; ++I)
	{
		uint32_t Unit = static_cast<uint32_t>(Bytes[I * 2] | (Bytes[I * 2 + 1] << 8));
		if (bStopAtNul && Unit == 0) break;
		if (Unit >= 0xD800 && Unit < 0xDC00 && I + 1 < Units)
		{
			const uint32_t Low = static_cast<uint32_t>(Bytes[I * 2 + 2] | (Bytes[I * 2 + 3] << 8));
			if (Low >= 0xDC00 && Low < 0xE000)
			{
				Unit = 0x10000 + ((Unit - 0xD800) << 10) + (Low - 0xDC00);
				++I;
			}
		}
		AppendUtf8(Out, Unit);
	}
	return Out;
}

size_t IntegerWidth(PropType Type)
{
	switch (Type)
	{
	case PropType::Bool:
	case PropType::Int8:
	case PropType::UInt8: return 1;
	case PropType::Char: // SporeModder-FX reads these with Java's 2-byte readChar
	case PropType::WChar:
	case PropType::Int16:
	case PropType::UInt16: return 2;
	case PropType::Int32:
	case PropType::UInt32: return 4;
	case PropType::Int64:
	case PropType::UInt64: return 8;
	default: return 0;
	}
}

bool IsSigned(PropType Type)
{
	return Type == PropType::Int8 || Type == PropType::Int16 || Type == PropType::Int32 || Type == PropType::Int64;
}

// Reads Count items of Prop.Type. Returns false on truncation or an unsupported type.
bool ReadItems(PropReader& R, Property& Prop, uint32_t Count, std::string& Error)
{
	const PropType Type = static_cast<PropType>(Prop.Type);
	const bool bSingle = !Prop.bArray;

	if (const size_t Width = IntegerWidth(Type))
	{
		for (uint32_t I = 0; I < Count; ++I)
		{
			uint64_t V;
			if (!R.BE(Width, V)) return false;
			Prop.Integers.push_back(IsSigned(Type) ? SignExtend(V, Width) : static_cast<int64_t>(V));
		}
		return true;
	}

	switch (Type)
	{
	case PropType::Float:
	case PropType::Double:
		for (uint32_t I = 0; I < Count; ++I)
		{
			uint64_t Bits;
			if (Type == PropType::Float)
			{
				if (!R.BE(4, Bits)) return false;
				const uint32_t Bits32 = static_cast<uint32_t>(Bits);
				float F;
				std::memcpy(&F, &Bits32, sizeof(F));
				Prop.Floats.push_back(F);
			}
			else
			{
				if (!R.BE(8, Bits)) return false;
				double D;
				std::memcpy(&D, &Bits, sizeof(D));
				Prop.Floats.push_back(D);
			}
		}
		return true;

	case PropType::String8:
	case PropType::String16:
		for (uint32_t I = 0; I < Count; ++I)
		{
			uint32_t Length;
			if (!R.BE32(Length)) return false;
			const size_t Bytes = Type == PropType::String8 ? Length : static_cast<size_t>(Length) * 2;
			if (!R.Has(Bytes)) return false;
			if (Type == PropType::String8)
				Prop.Strings.emplace_back(reinterpret_cast<const char*>(R.Data + R.Pos), Length);
			else
				Prop.Strings.push_back(Utf16LeToUtf8(R.Data + R.Pos, Length, false));
			R.Pos += Bytes;
		}
		return true;

	case PropType::Key:
		for (uint32_t I = 0; I < Count; ++I)
		{
			ResourceKey Key;
			if (!R.LE32(Key.Instance) || !R.LE32(Key.Type) || !R.LE32(Key.Group)) return false;
			if (bSingle && !R.Skip(4)) return false;
			Prop.Keys.push_back(Key);
		}
		return true;

	case PropType::Text:
		for (uint32_t I = 0; I < Count; ++I)
		{
			LocalizedText Text;
			if (!R.LE32(Text.TableId) || !R.LE32(Text.InstanceId)) return false;
			// Fixed 512-byte slot holding a NUL-terminated UTF-16LE placeholder.
			if (!R.Has(512)) return false;
			Text.Fallback = Utf16LeToUtf8(R.Data + R.Pos, 256, true);
			R.Pos += 512;
			Prop.Texts.push_back(std::move(Text));
		}
		return true;

	case PropType::Vector2:
	case PropType::Vector3:
	case PropType::ColorRGB:
	case PropType::Vector4:
	case PropType::ColorRGBA:
	case PropType::BBox:
	{
		const uint32_t Components = Prop.FloatsPerItem();
		// Single vector2 pads to 16 bytes, single vector3/colorRGB to 16 bytes.
		const size_t Padding = !bSingle ? 0 : (Type == PropType::Vector2 ? 8 : (Type == PropType::Vector3 || Type == PropType::ColorRGB) ? 4 : 0);
		for (uint32_t I = 0; I < Count; ++I)
		{
			if (!R.LEFloats(Components, Prop.Floats) || !R.Skip(Padding)) return false;
		}
		return true;
	}

	case PropType::Transform:
		for (uint32_t I = 0; I < Count; ++I)
		{
			uint64_t Flags, TransformCount;
			if (!R.LE(2, Flags) || !R.LE(2, TransformCount)) return false;
			Prop.Floats.push_back(static_cast<double>(Flags));
			Prop.Floats.push_back(static_cast<double>(SignExtend(TransformCount, 2)));
			if (!R.LEFloats(3 + 1 + 9, Prop.Floats)) return false; // offset, scale, rotation
		}
		return true;

	default:
		char Buffer[80];
		std::snprintf(Buffer, sizeof(Buffer), "unsupported property type 0x%04X", Prop.Type);
		Error = Buffer;
		return false;
	}
}

void AppendNumber(std::string& Out, double Value)
{
	char Buffer[32];
	std::snprintf(Buffer, sizeof(Buffer), "%g", Value);
	Out += Buffer;
}

} // namespace

const char* PropTypeName(uint16_t Type)
{
	switch (static_cast<PropType>(Type))
	{
	case PropType::Bool: return "bool";
	case PropType::Char: return "char";
	case PropType::WChar: return "wchar";
	case PropType::Int8: return "int8";
	case PropType::UInt8: return "uint8";
	case PropType::Int16: return "int16";
	case PropType::UInt16: return "uint16";
	case PropType::Int32: return "int32";
	case PropType::UInt32: return "uint32";
	case PropType::Int64: return "int64";
	case PropType::UInt64: return "uint64";
	case PropType::Float: return "float";
	case PropType::Double: return "double";
	case PropType::String8: return "string8";
	case PropType::String16: return "string16";
	case PropType::Key: return "key";
	case PropType::Text: return "text";
	case PropType::Vector2: return "vector2";
	case PropType::Vector3: return "vector3";
	case PropType::ColorRGB: return "colorRGB";
	case PropType::Vector4: return "vector4";
	case PropType::ColorRGBA: return "colorRGBA";
	case PropType::Transform: return "transform";
	case PropType::BBox: return "bbox";
	default: return "unknown";
	}
}

uint32_t Property::FloatsPerItem() const
{
	switch (static_cast<PropType>(Type))
	{
	case PropType::Float:
	case PropType::Double: return 1;
	case PropType::Vector2: return 2;
	case PropType::Vector3:
	case PropType::ColorRGB: return 3;
	case PropType::Vector4:
	case PropType::ColorRGBA: return 4;
	case PropType::BBox: return 6;
	case PropType::Transform: return 15;
	default: return 0;
	}
}

bool ParsePropertyList(const uint8_t* Data, size_t Size, PropertyList& Out)
{
	Out.Properties.clear();
	Out.Error.clear();
	PropReader R{Data, Size};

	uint32_t Count;
	if (!R.BE32(Count))
	{
		Out.Error = "missing property count";
		return false;
	}

	for (uint32_t I = 0; I < Count; ++I)
	{
		Property Prop;
		uint64_t Type, Flags;
		if (!R.BE32(Prop.Id) || !R.BE(2, Type) || !R.BE(2, Flags))
		{
			Out.Error = "truncated property header at index " + std::to_string(I);
			return false;
		}
		Prop.Type = static_cast<uint16_t>(Type);
		Prop.Flags = static_cast<uint16_t>(Flags);

		uint32_t ItemCount = 1;
		uint32_t ItemSize = 0;
		if ((Prop.Flags & 0x30) != 0)
		{
			if ((Prop.Flags & 0x40) != 0)
			{
				Out.Error = "property " + std::to_string(I) + " uses unsupported flags";
				return false;
			}
			Prop.bArray = true;
			if (!R.BE32(ItemCount) || !R.BE32(ItemSize))
			{
				Out.Error = "truncated array header at index " + std::to_string(I);
				return false;
			}
		}
		Prop.Count = ItemCount;

		const size_t Start = R.Pos;
		std::string Error;
		if (!ReadItems(R, Prop, ItemCount, Error))
		{
			// An array of an unknown type can still be skipped using its declared item size.
			if (Prop.bArray && !Error.empty() && R.Pos == Start && R.Skip(static_cast<size_t>(ItemCount) * ItemSize))
			{
				Out.Properties.push_back(std::move(Prop));
				continue;
			}
			Out.Error = Error.empty() ? "truncated value at index " + std::to_string(I) : Error;
			return false;
		}
		Out.Properties.push_back(std::move(Prop));
	}

	if (R.Pos != Size)
	{
		Out.Error = std::to_string(Size - R.Pos) + " trailing bytes after last property";
		return false;
	}
	return true;
}

std::string FormatProperty(const Property& Prop, const std::string& Name)
{
	std::string Out;
	if (Name.empty())
	{
		char Buffer[16];
		std::snprintf(Buffer, sizeof(Buffer), "0x%08X", Prop.Id);
		Out = Buffer;
	}
	else
	{
		Out = Name;
	}
	Out += ' ';
	Out += PropTypeName(Prop.Type);
	if (Prop.bArray)
	{
		Out += '[' + std::to_string(Prop.Count) + ']';
	}
	Out += " = ";
	if (Prop.bArray) Out += '{';

	const PropType Type = static_cast<PropType>(Prop.Type);
	for (uint32_t I = 0; I < Prop.Count; ++I)
	{
		if (I > 0) Out += ", ";
		if (!Prop.Integers.empty() && I < Prop.Integers.size())
		{
			if (Type == PropType::Bool) Out += Prop.Integers[I] ? "true" : "false";
			else if (Type == PropType::UInt64) Out += std::to_string(static_cast<uint64_t>(Prop.Integers[I]));
			else Out += std::to_string(Prop.Integers[I]);
		}
		else if (const uint32_t Per = Prop.FloatsPerItem(); Per > 0 && (I + 1) * Per <= Prop.Floats.size())
		{
			if (Per > 1) Out += '(';
			for (uint32_t C = 0; C < Per; ++C)
			{
				if (C > 0) Out += ", ";
				AppendNumber(Out, Prop.Floats[I * Per + C]);
			}
			if (Per > 1) Out += ')';
		}
		else if (I < Prop.Strings.size())
		{
			Out += '"' + Prop.Strings[I] + '"';
		}
		else if (I < Prop.Keys.size())
		{
			char Buffer[40];
			const ResourceKey& K = Prop.Keys[I];
			std::snprintf(Buffer, sizeof(Buffer), "%08X!%08X.%08X", K.Group, K.Instance, K.Type);
			Out += Buffer;
		}
		else if (I < Prop.Texts.size())
		{
			char Buffer[40];
			std::snprintf(Buffer, sizeof(Buffer), "(%08X!%08X) ", Prop.Texts[I].TableId, Prop.Texts[I].InstanceId);
			Out += Buffer;
			Out += '"' + Prop.Texts[I].Fallback + '"';
		}
		else
		{
			Out += '?';
		}
	}
	if (Prop.bArray) Out += '}';
	return Out;
}

} // namespace sporecore
