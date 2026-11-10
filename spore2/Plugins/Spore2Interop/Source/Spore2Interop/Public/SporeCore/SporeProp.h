// Spore 2.0 interop layer - binary .prop (property list) decoder.
//
// Layout mirrors SporeModder-FX (file/prop/PropertyList.java and the Property*
// classes): a big-endian header and scalar values, but little-endian keys,
// vectors, colors, transforms and bounding boxes. Single (non-array) keys and
// 2/3-component vectors carry trailing padding that arrays do not.

#pragma once

#include "SporeCore/SporeDbpf.h"

#include <cstddef>
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

namespace sporecore
{

enum class PropType : uint16_t
{
	Unknown = 0x0000,
	Bool = 0x0001,
	Char = 0x0002,
	WChar = 0x0003,
	Int8 = 0x0005,
	UInt8 = 0x0006,
	Int16 = 0x0007,
	UInt16 = 0x0008,
	Int32 = 0x0009,
	UInt32 = 0x000A,
	Int64 = 0x000B,
	UInt64 = 0x000C,
	Float = 0x000D,
	Double = 0x000E,
	String8 = 0x0012,
	String16 = 0x0013,
	Key = 0x0020,
	Text = 0x0022,
	Vector2 = 0x0030,
	Vector3 = 0x0031,
	ColorRGB = 0x0032,
	Vector4 = 0x0033,
	ColorRGBA = 0x0034,
	Transform = 0x0038,
	BBox = 0x0039,
};

const char* PropTypeName(uint16_t Type);

struct LocalizedText
{
	uint32_t TableId = 0;
	uint32_t InstanceId = 0;
	std::string Fallback; // UTF-8, the inline placeholder text
};

struct Property
{
	uint32_t Id = 0; // FNV hash of the property name
	uint16_t Type = 0;
	uint16_t Flags = 0;
	bool bArray = false;
	uint32_t Count = 0; // number of items (1 for non-array)

	// Exactly one of these is filled, depending on Type.
	std::vector<int64_t> Integers;   // bool, char, wchar, intN, uintN (uint64 stored bit-for-bit)
	std::vector<double> Floats;      // float/double, and vectors/colors/bbox/transform flattened per item
	std::vector<std::string> Strings; // string8 / string16 as UTF-8
	std::vector<ResourceKey> Keys;
	std::vector<LocalizedText> Texts;

	// Floats per item for the flattened types: vector2=2, vector3/colorRGB=3,
	// vector4/colorRGBA=4, bbox=6 (min xyz, max xyz),
	// transform=15 (flags, transformCount, offset xyz, scale, 3x3 rotation row-major).
	uint32_t FloatsPerItem() const;
};

struct PropertyList
{
	std::vector<Property> Properties;
	// Set when parsing stopped early; Properties holds everything read before that point.
	std::string Error;
};

// UTF-16LE code units -> UTF-8, stopping at a NUL when bStopAtNul is set.
std::string Utf16LeToUtf8(const uint8_t* Bytes, size_t Units, bool bStopAtNul);

// Returns false when the data could not be fully parsed (see Out.Error).
bool ParsePropertyList(const uint8_t* Data, size_t Size, PropertyList& Out);

// Resolves an id to a name, or returns an empty string. bType selects type names
// (e.g. "prop") versus file/group names (e.g. "editor_setup~").
using IdNamer = std::function<std::string(uint32_t Id, bool bType)>;

// One-line human readable rendering, e.g. "0x1A2B3C4D float = 1.5" or "[3] {1, 2, 3}".
// Name may be empty, in which case the hex id is used. With a Namer, key values print as
// "group!instance.type" using names where known and 0x-hex otherwise.
std::string FormatProperty(const Property& Prop, const std::string& Name, const IdNamer& Namer = nullptr);

} // namespace sporecore
