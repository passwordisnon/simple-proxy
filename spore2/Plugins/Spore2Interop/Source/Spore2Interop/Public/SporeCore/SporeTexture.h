// Spore 2.0 interop layer - Spore texture containers (.raster) and RenderWare 4 (.rw4)
// textures and meshes.
//
// Layouts follow SporeModder-FX (file/raster/RasterTexture.java, file/rw4/RWHeader.java,
// RWSectionInfo.java, RWRaster.java, RWMesh.java, RWVertexBuffer.java, RWIndexBuffer.java,
// RWVertexDescription.java, RWVertexElement.java and view/editors/RWModelViewer.java). Pixel data is stored as Direct3D 9 formats:
// DXT1/DXT3/DXT5 (FourCC) or the uncompressed D3DFMT codes below.

#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace sporecore
{

constexpr uint32_t MakeFourCC(char A, char B, char C, char D)
{
	return static_cast<uint32_t>(static_cast<uint8_t>(A)) | (static_cast<uint32_t>(static_cast<uint8_t>(B)) << 8) |
		(static_cast<uint32_t>(static_cast<uint8_t>(C)) << 16) | (static_cast<uint32_t>(static_cast<uint8_t>(D)) << 24);
}

constexpr uint32_t FourCC_DXT1 = MakeFourCC('D', 'X', 'T', '1');
constexpr uint32_t FourCC_DXT3 = MakeFourCC('D', 'X', 'T', '3');
constexpr uint32_t FourCC_DXT5 = MakeFourCC('D', 'X', 'T', '5');
constexpr uint32_t D3DFMT_R8G8B8 = 20;   // memory order B, G, R
constexpr uint32_t D3DFMT_A8R8G8B8 = 21; // memory order B, G, R, A
constexpr uint32_t D3DFMT_A8 = 28;
constexpr uint32_t D3DFMT_X8R8G8B8 = 22; // B, G, R, unused
constexpr uint32_t D3DFMT_R5G6B5 = 23;
constexpr uint32_t D3DFMT_X1R5G5B5 = 24;
constexpr uint32_t D3DFMT_A1R5G5B5 = 25;
constexpr uint32_t D3DFMT_A4R4G4B4 = 26;
constexpr uint32_t D3DFMT_L8 = 50;
constexpr uint32_t D3DFMT_A8L8 = 51;
constexpr uint32_t FourCC_ATI1 = MakeFourCC('A', 'T', 'I', '1'); // BC4: one 8-bit channel
constexpr uint32_t FourCC_ATI2 = MakeFourCC('A', 'T', 'I', '2'); // BC5: two channels (normal maps)

struct TextureImage
{
	uint32_t Width = 0;
	uint32_t Height = 0;
	uint32_t MipCount = 0;
	uint32_t Format = 0; // FourCC or D3DFMT code
	bool bCube = false;
	std::vector<uint8_t> Data; // all mips (and faces) back to back, largest first
};

// Short name, or "unknown(<code>)" / "unknown('ABCD')" for unsupported formats.
std::string TextureFormatName(uint32_t Format);

// Bytes for one mip level of the given format, or 0 for unsupported formats.
size_t MipSize(uint32_t Format, uint32_t Width, uint32_t Height);

// .raster: version 1 header followed by per-mip size-prefixed data.
bool ParseRaster(const uint8_t* Data, size_t Size, TextureImage& Out, std::string& Error);

enum class Rw4Kind : uint8_t
{
	Unknown,
	Model,
	Texture,
	Special,
};

// A texture bound to a mesh through its compiled material state.
struct MeshTextureSlot
{
	uint32_t Sampler = 0;     // Direct3D sampler stage (0 is usually the diffuse map)
	int32_t TextureIndex = -1; // index into Rw4Info::Textures when the raster is in this file
	std::string OverrideName;  // name of an externally supplied texture (RW texture override)
};

// One renderable mesh: triangle list in Spore's coordinate system (Z up).
struct MeshData
{
	std::vector<float> Positions; // x, y, z per vertex
	std::vector<float> Normals;   // x, y, z per vertex, empty when the mesh has none
	std::vector<float> UVs;       // u, v per vertex, empty when the mesh has none
	std::vector<uint32_t> Indices; // 3 per triangle
	bool bSkinned = false;        // has blend indices/weights (skeleton data not decoded yet)
	bool bBlendShape = false;     // vertices came from a blend shape buffer (base shape only, morphs not applied)
	// Skin weights, 4 per vertex when the mesh is skinned: bone numbers into the file's skeleton
	// (the stored value divided by 3, as SporeModder's Blender importer does) and their weights.
	std::vector<uint16_t> BoneIndices;
	std::vector<float> BoneWeights;
	std::string SkinIssue; // set when the mesh is skinned but its weights could not be read
	std::vector<MeshTextureSlot> TextureSlots; // from the mesh's compiled states, in order

	size_t VertexCount() const { return Positions.size() / 3; }
};

// One bone of an rw4 skeleton (SporeModder-FX RWSkeleton + RWAnimationSkin).
struct SkeletonBone
{
	uint32_t Name = 0;  // hash; resolve with reg_file.txt
	uint32_t Flags = 0; // meaning not documented; kept raw
	int32_t Parent = -1;
	// Bind pose as stored: a 3x3 rotation (row-major) and the inverse bind translation.
	float BindRotation[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
	float InverseTranslation[3] = {0, 0, 0};
	float Head[3] = {0, 0, 0}; // bone position in model space: BindRotation * -InverseTranslation
};

struct SkeletonData
{
	uint32_t Id = 0; // hash
	std::vector<SkeletonBone> Bones;
	// True for the skeleton a skin-in-K links to its bind pose (the one meshes are weighted to).
	// Other skeleton sections are listed after those, without a pose; their role is unknown.
	bool bHasBindPose = false;
};

struct Rw4Info
{
	Rw4Kind Kind = Rw4Kind::Unknown;
	uint32_t SectionCount = 0;
	std::vector<TextureImage> Textures;
	uint32_t SkippedTextures = 0; // rasters whose data lives in sub-references (not supported yet)
	std::vector<MeshData> Meshes;
	uint32_t SkippedMeshes = 0;   // meshes using blend shapes, sub-references or unsupported layouts
	std::vector<std::string> MeshIssues;
	uint32_t UnreadableMaterials = 0; // compiled states that could not be decoded
	std::vector<SkeletonData> Skeletons;
};

// Wavefront OBJ text for one mesh (positions, UVs with V flipped, normals). When
// MaterialLibrary is set, the OBJ references it and uses material MaterialName.
std::string MeshToObj(const MeshData& Mesh, const std::string& Name, const std::string& MaterialLibrary = std::string(), const std::string& MaterialName = std::string());

// The slot to use as the diffuse texture: sampler 0 if present, else the first slot, else null.
const MeshTextureSlot* DiffuseSlot(const MeshData& Mesh);

// Reads the RenderWare 4 header and section table and extracts every raster and mesh section.
bool ParseRw4(const uint8_t* Data, size_t Size, Rw4Info& Out, std::string& Error);

// Standard DirectDraw Surface file, readable by macOS Preview, GIMP, Photoshop and texture tools.
void WriteDds(const TextureImage& Image, std::vector<uint8_t>& Out);

// Decodes the first mip (first face for cube maps) to tightly packed RGBA8.
bool DecodeToRgba(const TextureImage& Image, std::vector<uint8_t>& OutRgba, std::string& Error);

} // namespace sporecore
