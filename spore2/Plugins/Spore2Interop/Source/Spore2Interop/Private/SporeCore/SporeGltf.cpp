// Spore 2.0 interop layer - glTF 2.0 binary export. See SporeGltf.h for the conventions.

#include "SporeCore/SporeGltf.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdio>
#include <cstring>

namespace sporecore
{

namespace
{

using GltfMat3 = std::array<float, 9>; // row-major, applied to column vectors
using GltfVec3 = std::array<float, 3>;

constexpr int TargetNone = 0;
constexpr int TargetVertices = 34962; // ARRAY_BUFFER
constexpr int TargetIndices = 34963;  // ELEMENT_ARRAY_BUFFER

// Spore (Z up) -> glTF (Y up): a rotation, so handedness and triangle winding are kept.
GltfVec3 ToGltf(const float* V)
{
	return {V[0], V[2], -V[1]};
}

// The same change of axes for a matrix acting on such vectors: C * M * transpose(C).
GltfMat3 ToGltf(const GltfMat3& M)
{
	// With C = [1 0 0; 0 0 1; 0 -1 0], row/column 1 and 2 swap and each swap of the old Y
	// axis changes sign.
	return {
		M[0], M[2], -M[1],
		M[6], M[8], -M[7],
		-M[3], -M[5], M[4]};
}

GltfMat3 Mul(const GltfMat3& A, const GltfMat3& B)
{
	GltfMat3 Out{};
	for (size_t R = 0; R < 3; ++R)
	{
		for (size_t C = 0; C < 3; ++C)
		{
			Out[3 * R + C] = A[3 * R] * B[C] + A[3 * R + 1] * B[3 + C] + A[3 * R + 2] * B[6 + C];
		}
	}
	return Out;
}

GltfVec3 Mul(const GltfMat3& A, const GltfVec3& V)
{
	return {
		A[0] * V[0] + A[1] * V[1] + A[2] * V[2],
		A[3] * V[0] + A[4] * V[1] + A[5] * V[2],
		A[6] * V[0] + A[7] * V[1] + A[8] * V[2]};
}

float Determinant(const GltfMat3& M)
{
	return M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6]);
}

// Inverse, or the transpose when the matrix cannot be inverted (a rotation's inverse anyway).
GltfMat3 Inverse(const GltfMat3& M)
{
	const float Det = Determinant(M);
	if (!(std::fabs(Det) > 1e-12f))
	{
		return {M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]};
	}
	const float Inv = 1.0f / Det;
	return {
		(M[4] * M[8] - M[5] * M[7]) * Inv, (M[2] * M[7] - M[1] * M[8]) * Inv, (M[1] * M[5] - M[2] * M[4]) * Inv,
		(M[5] * M[6] - M[3] * M[8]) * Inv, (M[0] * M[8] - M[2] * M[6]) * Inv, (M[2] * M[3] - M[0] * M[5]) * Inv,
		(M[3] * M[7] - M[4] * M[6]) * Inv, (M[1] * M[6] - M[0] * M[7]) * Inv, (M[0] * M[4] - M[1] * M[3]) * Inv};
}

std::array<float, 4> NormalizedQuat(float X, float Y, float Z, float W)
{
	const float Length = std::sqrt(X * X + Y * Y + Z * Z + W * W);
	if (!(Length > 1e-12f)) return {0, 0, 0, 1};
	return {X / Length, Y / Length, Z / Length, W / Length};
}

// Quaternion (x, y, z, w) of a pure rotation matrix.
std::array<float, 4> QuatFromRotation(const GltfMat3& M)
{
	const float Trace = M[0] + M[4] + M[8];
	float X, Y, Z, W;
	if (Trace > 0.0f)
	{
		const float S = std::sqrt(Trace + 1.0f) * 2.0f;
		W = 0.25f * S;
		X = (M[7] - M[5]) / S;
		Y = (M[2] - M[6]) / S;
		Z = (M[3] - M[1]) / S;
	}
	else if (M[0] > M[4] && M[0] > M[8])
	{
		const float S = std::sqrt(std::max(0.0f, 1.0f + M[0] - M[4] - M[8])) * 2.0f;
		W = (M[7] - M[5]) / S;
		X = 0.25f * S;
		Y = (M[1] + M[3]) / S;
		Z = (M[2] + M[6]) / S;
	}
	else if (M[4] > M[8])
	{
		const float S = std::sqrt(std::max(0.0f, 1.0f + M[4] - M[0] - M[8])) * 2.0f;
		W = (M[2] - M[6]) / S;
		X = (M[1] + M[3]) / S;
		Y = 0.25f * S;
		Z = (M[5] + M[7]) / S;
	}
	else
	{
		const float S = std::sqrt(std::max(0.0f, 1.0f + M[8] - M[0] - M[4])) * 2.0f;
		W = (M[3] - M[1]) / S;
		X = (M[2] + M[6]) / S;
		Y = (M[5] + M[7]) / S;
		Z = 0.25f * S;
	}
	return NormalizedQuat(X, Y, Z, W);
}

// Splits a 3x3 into rotation * scale (scale = column lengths). Shear, which a bind pose is not
// expected to have, is lost.
void Decompose(const GltfMat3& M, std::array<float, 4>& Rotation, GltfVec3& Scale)
{
	GltfMat3 R = M;
	for (size_t C = 0; C < 3; ++C)
	{
		const float Length = std::sqrt(M[C] * M[C] + M[3 + C] * M[3 + C] + M[6 + C] * M[6 + C]);
		Scale[C] = Length;
		const float Inv = Length > 1e-12f ? 1.0f / Length : 0.0f;
		for (size_t Row = 0; Row < 3; ++Row) R[3 * Row + C] = M[3 * Row + C] * Inv;
	}
	if (Determinant(R) < 0.0f)
	{
		// A mirrored basis: keep the rotation proper and put the mirror into the scale.
		Scale[0] = -Scale[0];
		for (size_t Row = 0; Row < 3; ++Row) R[3 * Row] = -R[3 * Row];
	}
	Rotation = QuatFromRotation(R);
}

float Finite(float V)
{
	return std::isfinite(V) ? V : 0.0f;
}

std::string Num(double V)
{
	if (!std::isfinite(V)) V = 0.0;
	char Text[32];
	std::snprintf(Text, sizeof(Text), "%.9g", V);
	return Text;
}

std::string Quoted(const std::string& Text)
{
	std::string Out = "\"";
	for (const char Ch : Text)
	{
		const unsigned char U = static_cast<unsigned char>(Ch);
		if (Ch == '"' || Ch == '\\')
		{
			Out += '\\';
			Out += Ch;
		}
		else if (U < 0x20 || U >= 0x7F)
		{
			// Names are hashes or registry names; anything unusual is replaced, not escaped.
			Out += '_';
		}
		else
		{
			Out += Ch;
		}
	}
	return Out + "\"";
}

// The .glb's binary chunk with its buffer views and accessors.
struct Buffer
{
	std::vector<uint8_t> Bytes;
	std::vector<std::string> Views;
	std::vector<std::string> Accessors;

	int AddView(const void* Data, size_t Size, int Target)
	{
		while (Bytes.size() % 4 != 0) Bytes.push_back(0);
		const size_t Offset = Bytes.size();
		const uint8_t* Start = static_cast<const uint8_t*>(Data);
		Bytes.insert(Bytes.end(), Start, Start + Size);
		std::string View = "{\"buffer\":0,\"byteOffset\":" + std::to_string(Offset) + ",\"byteLength\":" + std::to_string(Size);
		if (Target != TargetNone) View += ",\"target\":" + std::to_string(Target);
		Views.push_back(View + "}");
		return static_cast<int>(Views.size() - 1);
	}

	// Floats as SCALAR/VEC2/VEC3/VEC4/MAT4; bMinMax adds the bounds glTF requires for positions
	// and animation times.
	int AddFloats(const std::vector<float>& Values, int Components, const char* Type, int Target, bool bMinMax)
	{
		const int View = AddView(Values.data(), Values.size() * sizeof(float), Target);
		const size_t Count = Values.size() / static_cast<size_t>(Components);
		std::string Accessor = "{\"bufferView\":" + std::to_string(View) + ",\"componentType\":5126,\"count\":" + std::to_string(Count) + ",\"type\":\"" + Type + "\"";
		if (bMinMax && Count > 0)
		{
			std::string Min = "[", Max = "[";
			for (int C = 0; C < Components; ++C)
			{
				float Lo = Values[static_cast<size_t>(C)], Hi = Lo;
				for (size_t I = 0; I < Count; ++I)
				{
					const float V = Values[I * static_cast<size_t>(Components) + static_cast<size_t>(C)];
					Lo = std::min(Lo, V);
					Hi = std::max(Hi, V);
				}
				Min += (C ? "," : "") + Num(Lo);
				Max += (C ? "," : "") + Num(Hi);
			}
			Accessor += ",\"min\":" + Min + "],\"max\":" + Max + "]";
		}
		Accessors.push_back(Accessor + "}");
		return static_cast<int>(Accessors.size() - 1);
	}

	int AddIntegers(const void* Data, size_t Count, int ComponentType, size_t ComponentSize, const char* Type, int Target)
	{
		const int View = AddView(Data, Count * ComponentSize, Target);
		const size_t PerItem = std::strcmp(Type, "VEC4") == 0 ? 4 : 1;
		Accessors.push_back("{\"bufferView\":" + std::to_string(View) + ",\"componentType\":" + std::to_string(ComponentType) + ",\"count\":" + std::to_string(Count / PerItem) + ",\"type\":\"" + Type + "\"}");
		return static_cast<int>(Accessors.size() - 1);
	}
};

std::string Joined(const std::vector<std::string>& Items)
{
	std::string Out;
	for (size_t I = 0; I < Items.size(); ++I) Out += (I ? "," : "") + Items[I];
	return Out;
}

std::string Vec(const float* V, int Count)
{
	std::string Out = "[";
	for (int I = 0; I < Count; ++I) Out += (I ? "," : "") + Num(V[I]);
	return Out + "]";
}

void AppendLE32(std::vector<uint8_t>& Out, uint32_t V)
{
	for (int I = 0; I < 4; ++I) Out.push_back(static_cast<uint8_t>(V >> (8 * I)));
}

// Bind pose of one bone in glTF axes.
struct BonePose
{
	GltfMat3 World{};       // rotation (and any scale) in model space
	GltfVec3 Head{};        // position in model space
	GltfMat3 InverseWorld{};
	GltfVec3 InverseTranslation{};
};

// Linear interpolation of a channel's scale at Time (1 when the channel stores none).
GltfVec3 ScaleAt(const AnimChannel* Channel, float Time)
{
	if (!Channel || Channel->Components != 0x601 || Channel->Keys.empty()) return {1, 1, 1};
	const std::vector<AnimKeyframe>& Keys = Channel->Keys;
	if (Time <= Keys.front().Time) return {Keys.front().Scale[0], Keys.front().Scale[1], Keys.front().Scale[2]};
	for (size_t K = 1; K < Keys.size(); ++K)
	{
		if (Time <= Keys[K].Time)
		{
			const float Span = Keys[K].Time - Keys[K - 1].Time;
			const float F = Span > 1e-9f ? (Time - Keys[K - 1].Time) / Span : 1.0f;
			GltfVec3 Out;
			for (int C = 0; C < 3; ++C) Out[static_cast<size_t>(C)] = Keys[K - 1].Scale[C] + (Keys[K].Scale[C] - Keys[K - 1].Scale[C]) * F;
			return Out;
		}
	}
	return {Keys.back().Scale[0], Keys.back().Scale[1], Keys.back().Scale[2]};
}

} // namespace

std::vector<int32_t> SkeletonParentsFromFlags(const SkeletonData& Skeleton)
{
	std::vector<int32_t> Parents(Skeleton.Bones.size(), -1);
	std::vector<int32_t> Branches;
	int32_t Current = -1;
	for (size_t I = 0; I < Skeleton.Bones.size(); ++I)
	{
		Parents[I] = Current;
		switch (Skeleton.Bones[I].Flags)
		{
		case BoneFlagRoot:
			Current = static_cast<int32_t>(I);
			break;
		case BoneFlagLeaf:
			if (!Branches.empty())
			{
				Current = Branches.back();
				Branches.pop_back();
			}
			break;
		case BoneFlagBranch:
			Branches.push_back(Current);
			Current = static_cast<int32_t>(I);
			break;
		default:
			break;
		}
	}
	return Parents;
}

bool WriteGlb(const GltfScene& Scene, std::vector<uint8_t>& Out, GltfReport& Report)
{
	Out.clear();
	Report = GltfReport();
	Buffer Bin;

	auto NameOf = [&](uint32_t Id)
	{
		std::string Name = Scene.NameOf ? Scene.NameOf(Id) : std::string();
		if (Name.empty())
		{
			char Hex[16];
			std::snprintf(Hex, sizeof(Hex), "0x%08X", Id);
			Name = Hex;
		}
		return Name;
	};

	// Skeleton: bind poses, node transforms relative to the parent, inverse bind matrices.
	const SkeletonData* Skeleton = Scene.Skeleton && Scene.Skeleton->bHasBindPose && !Scene.Skeleton->Bones.empty() ? Scene.Skeleton : nullptr;
	const size_t BoneCount = Skeleton ? Skeleton->Bones.size() : 0;
	std::vector<BonePose> Poses(BoneCount);
	std::vector<std::string> BoneNames(BoneCount);
	std::vector<std::string> Nodes;
	std::vector<std::string> SceneNodes;
	int InverseBindAccessor = -1;
	if (Skeleton)
	{
		std::vector<float> InverseBind;
		for (size_t B = 0; B < BoneCount; ++B)
		{
			const SkeletonBone& Bone = Skeleton->Bones[B];
			BonePose& Pose = Poses[B];
			GltfMat3 Stored;
			for (size_t I = 0; I < 9; ++I) Stored[I] = Finite(Bone.BindRotation[I]);
			Pose.World = ToGltf(Stored);
			Pose.Head = ToGltf(Bone.Head);
			Pose.InverseWorld = Inverse(Pose.World);
			Pose.InverseTranslation = ToGltf(Bone.InverseTranslation);
			// Column-major 4x4 of x -> InverseWorld * x + InverseTranslation.
			const GltfMat3& I = Pose.InverseWorld;
			const float Matrix[16] = {I[0], I[3], I[6], 0, I[1], I[4], I[7], 0, I[2], I[5], I[8], 0,
				Finite(Pose.InverseTranslation[0]), Finite(Pose.InverseTranslation[1]), Finite(Pose.InverseTranslation[2]), 1};
			InverseBind.insert(InverseBind.end(), Matrix, Matrix + 16);

			BoneNames[B] = NameOf(Bone.Name);
			for (size_t Earlier = 0; Earlier < B; ++Earlier)
			{
				if (BoneNames[Earlier] == BoneNames[B])
				{
					BoneNames[B] += "_" + std::to_string(B); // tools expect unique bone names
					break;
				}
			}
		}
		InverseBindAccessor = Bin.AddFloats(InverseBind, 16, "MAT4", TargetNone, false);

		std::vector<std::vector<size_t>> Children(BoneCount);
		for (size_t B = 0; B < BoneCount; ++B)
		{
			const int32_t Parent = Skeleton->Bones[B].Parent;
			// A bone can only hang below an earlier or later bone other than itself; anything
			// else (out of range was rejected by the decoder) is treated as a root.
			if (Parent >= 0 && static_cast<size_t>(Parent) != B) Children[static_cast<size_t>(Parent)].push_back(B);
			else SceneNodes.push_back(std::to_string(B));
		}
		for (size_t B = 0; B < BoneCount; ++B)
		{
			const int32_t Parent = Skeleton->Bones[B].Parent;
			GltfMat3 Local = Poses[B].World;
			GltfVec3 Offset = Poses[B].Head;
			if (Parent >= 0 && static_cast<size_t>(Parent) != B)
			{
				const BonePose& Up = Poses[static_cast<size_t>(Parent)];
				Local = Mul(Up.InverseWorld, Poses[B].World);
				Offset = Mul(Up.InverseWorld, GltfVec3{Poses[B].Head[0] - Up.Head[0], Poses[B].Head[1] - Up.Head[1], Poses[B].Head[2] - Up.Head[2]});
			}
			std::array<float, 4> Rotation;
			GltfVec3 Scale;
			Decompose(Local, Rotation, Scale);
			std::string Node = "{\"name\":" + Quoted(BoneNames[B]) + ",\"translation\":" + Vec(Offset.data(), 3) + ",\"rotation\":" + Vec(Rotation.data(), 4);
			if (std::fabs(Scale[0] - 1.0f) > 1e-4f || std::fabs(Scale[1] - 1.0f) > 1e-4f || std::fabs(Scale[2] - 1.0f) > 1e-4f)
			{
				Node += ",\"scale\":" + Vec(Scale.data(), 3);
			}
			if (!Children[B].empty())
			{
				Node += ",\"children\":[";
				for (size_t C = 0; C < Children[B].size(); ++C) Node += (C ? "," : "") + std::to_string(Children[B][C]);
				Node += "]";
			}
			Nodes.push_back(Node + "}");
		}
		Report.Bones = BoneCount;
	}

	// Meshes, one material per distinct texture (plus one without).
	std::vector<std::string> Meshes;
	std::vector<std::string> Materials;
	std::vector<int32_t> MaterialImage; // image index per material
	size_t FlippedMeshes = 0;
	for (const GltfMesh& Item : Scene.Meshes)
	{
		if (!Item.Mesh) continue;
		const MeshData& Mesh = *Item.Mesh;
		const size_t VertexCount = Mesh.VertexCount();
		bool bValid = VertexCount > 0 && Mesh.Indices.size() >= 3;
		for (const uint32_t Index : Mesh.Indices) bValid = bValid && Index < VertexCount;
		if (!bValid)
		{
			Report.Notes.push_back("mesh '" + Item.Name + "' left out: no triangles or an index outside its vertices");
			continue;
		}

		std::vector<float> Positions(3 * VertexCount);
		for (size_t V = 0; V < VertexCount; ++V)
		{
			const GltfVec3 P = ToGltf(&Mesh.Positions[3 * V]);
			for (size_t C = 0; C < 3; ++C) Positions[3 * V + C] = Finite(P[C]);
		}
		std::string Attributes = "\"POSITION\":" + std::to_string(Bin.AddFloats(Positions, 3, "VEC3", TargetVertices, true));

		std::vector<uint32_t> Indices(Mesh.Indices.begin(), Mesh.Indices.begin() + static_cast<std::ptrdiff_t>(Mesh.Indices.size() - Mesh.Indices.size() % 3));
		if (Mesh.Normals.size() == 3 * VertexCount)
		{
			std::vector<float> Normals(3 * VertexCount);
			for (size_t V = 0; V < VertexCount; ++V)
			{
				GltfVec3 N = ToGltf(&Mesh.Normals[3 * V]);
				const float Length = std::sqrt(N[0] * N[0] + N[1] * N[1] + N[2] * N[2]);
				if (std::isfinite(Length) && Length > 1e-6f) N = {N[0] / Length, N[1] / Length, N[2] / Length};
				else N = {0, 1, 0};
				for (size_t C = 0; C < 3; ++C) Normals[3 * V + C] = N[C];
			}
			// glTF's front side is counter-clockwise. Whether Spore's index order agrees is not
			// documented, so it is decided per mesh from the data: when most triangles face
			// away from their vertex normals, their order is reversed.
			size_t Agree = 0, Disagree = 0;
			for (size_t T = 0; T + 2 < Indices.size(); T += 3)
			{
				const float* A = &Positions[3 * Indices[T]];
				const float* B = &Positions[3 * Indices[T + 1]];
				const float* C = &Positions[3 * Indices[T + 2]];
				const float E1[3] = {B[0] - A[0], B[1] - A[1], B[2] - A[2]};
				const float E2[3] = {C[0] - A[0], C[1] - A[1], C[2] - A[2]};
				const float Face[3] = {E1[1] * E2[2] - E1[2] * E2[1], E1[2] * E2[0] - E1[0] * E2[2], E1[0] * E2[1] - E1[1] * E2[0]};
				float Dot = 0.0f;
				for (size_t K = 0; K < 3; ++K)
				{
					const float* N = &Normals[3 * Indices[T + K]];
					Dot += Face[0] * N[0] + Face[1] * N[1] + Face[2] * N[2];
				}
				if (Dot > 0.0f) ++Agree;
				else if (Dot < 0.0f) ++Disagree;
			}
			if (Disagree > Agree)
			{
				for (size_t T = 0; T + 2 < Indices.size(); T += 3) std::swap(Indices[T + 1], Indices[T + 2]);
				++FlippedMeshes;
			}
			Attributes += ",\"NORMAL\":" + std::to_string(Bin.AddFloats(Normals, 3, "VEC3", TargetVertices, false));
		}
		if (Mesh.UVs.size() == 2 * VertexCount)
		{
			// Direct3D and glTF both put the UV origin at the top left: no flip.
			std::vector<float> UVs(Mesh.UVs.size());
			for (size_t I = 0; I < UVs.size(); ++I) UVs[I] = Finite(Mesh.UVs[I]);
			Attributes += ",\"TEXCOORD_0\":" + std::to_string(Bin.AddFloats(UVs, 2, "VEC2", TargetVertices, false));
		}

		bool bSkinned = Skeleton && Mesh.BoneIndices.size() == 4 * VertexCount && Mesh.BoneWeights.size() == 4 * VertexCount;
		if (bSkinned)
		{
			for (const uint16_t Bone : Mesh.BoneIndices) bSkinned = bSkinned && Bone < BoneCount;
			if (!bSkinned) Report.Notes.push_back("mesh '" + Item.Name + "' written without weights: a bone index is outside the skeleton");
		}
		if (bSkinned)
		{
			std::vector<uint16_t> Joints(4 * VertexCount, 0);
			std::vector<float> Weights(4 * VertexCount, 0.0f);
			for (size_t V = 0; V < VertexCount; ++V)
			{
				float Sum = 0.0f;
				for (size_t K = 0; K < 4; ++K)
				{
					const float W = Mesh.BoneWeights[4 * V + K];
					if (std::isfinite(W) && W > 0.0f) Sum += W;
				}
				if (Sum > 1e-6f)
				{
					for (size_t K = 0; K < 4; ++K)
					{
						const float W = Mesh.BoneWeights[4 * V + K];
						if (std::isfinite(W) && W > 0.0f)
						{
							Joints[4 * V + K] = Mesh.BoneIndices[4 * V + K];
							Weights[4 * V + K] = W / Sum; // glTF wants weights that add up to 1
						}
					}
				}
				else
				{
					// No weight at all: glTF needs one, so the vertex follows its first listed bone.
					Joints[4 * V] = Mesh.BoneIndices[4 * V];
					Weights[4 * V] = 1.0f;
				}
			}
			Attributes += ",\"JOINTS_0\":" + std::to_string(Bin.AddIntegers(Joints.data(), Joints.size(), 5123, sizeof(uint16_t), "VEC4", TargetVertices));
			Attributes += ",\"WEIGHTS_0\":" + std::to_string(Bin.AddFloats(Weights, 4, "VEC4", TargetVertices, false));
			++Report.SkinnedMeshes;
		}

		const int IndexAccessor = Bin.AddIntegers(Indices.data(), Indices.size(), 5125, sizeof(uint32_t), "SCALAR", TargetIndices);

		const int32_t Image = Item.Image >= 0 && static_cast<size_t>(Item.Image) < Scene.Images.size() && !Scene.Images[static_cast<size_t>(Item.Image)].empty() ? Item.Image : -1;
		size_t Material = 0;
		while (Material < MaterialImage.size() && MaterialImage[Material] != Image) ++Material;
		if (Material == MaterialImage.size())
		{
			MaterialImage.push_back(Image);
			std::string Pbr = "\"metallicFactor\":0,\"roughnessFactor\":1";
			if (Image >= 0) Pbr = "\"baseColorTexture\":{\"index\":" + std::to_string(Image) + "}," + Pbr;
			Materials.push_back("{\"name\":" + Quoted(Image >= 0 ? "texture" + std::to_string(Image) : std::string("untextured")) + ",\"pbrMetallicRoughness\":{" + Pbr + "}}");
		}

		const size_t MeshIndex = Meshes.size();
		Meshes.push_back("{\"name\":" + Quoted(Item.Name) + ",\"primitives\":[{\"attributes\":{" + Attributes + "},\"indices\":" + std::to_string(IndexAccessor) + ",\"material\":" + std::to_string(Material) + "}]}");
		SceneNodes.push_back(std::to_string(Nodes.size()));
		Nodes.push_back("{\"name\":" + Quoted(Item.Name) + ",\"mesh\":" + std::to_string(MeshIndex) + (bSkinned ? ",\"skin\":0" : "") + "}");
	}
	Report.Meshes = Meshes.size();
	if (Meshes.empty())
	{
		return false;
	}
	if (FlippedMeshes > 0) Report.Notes.push_back(std::to_string(FlippedMeshes) + " mesh(es) had their triangle order reversed to match their normals");

	// Animations: one glTF channel per bone and component.
	std::vector<std::string> Animations;
	for (size_t A = 0; Skeleton && A < Scene.Animations.size(); ++A)
	{
		const KeyframeAnimation* Animation = Scene.Animations[A];
		if (!Animation) continue;
		const std::string AnimationName = Animation->Id != 0 ? NameOf(Animation->Id) : "animation" + std::to_string(A);

		// Channel -> bone by name; the same name twice goes to the next bone carrying it.
		std::vector<int32_t> ChannelBone(Animation->Channels.size(), -1);
		std::vector<const AnimChannel*> BoneChannel(BoneCount, nullptr);
		bool bResolved = true;
		for (size_t C = 0; C < Animation->Channels.size(); ++C)
		{
			const AnimChannel& Channel = Animation->Channels[C];
			if (Channel.Components == 0x100) continue; // blend factor: morph weights, not exported
			for (size_t B = 0; B < BoneCount; ++B)
			{
				if (Skeleton->Bones[B].Name == Channel.Id && !BoneChannel[B])
				{
					ChannelBone[C] = static_cast<int32_t>(B);
					BoneChannel[B] = &Channel;
					break;
				}
			}
			bResolved = bResolved && ChannelBone[C] >= 0;
		}
		if (!bResolved)
		{
			Report.Notes.push_back("animation '" + AnimationName + "' left out: a channel names no bone of this skeleton");
			continue;
		}

		std::vector<std::string> Samplers, Channels;
		for (size_t C = 0; C < Animation->Channels.size(); ++C)
		{
			if (ChannelBone[C] < 0) continue;
			const AnimChannel& Channel = Animation->Channels[C];
			const size_t Bone = static_cast<size_t>(ChannelBone[C]);
			const int32_t Parent = Skeleton->Bones[Bone].Parent;
			const AnimChannel* ParentChannel = Parent >= 0 && static_cast<size_t>(Parent) != Bone ? BoneChannel[static_cast<size_t>(Parent)] : nullptr;

			std::vector<float> Times, Rotations, Locations, Scales;
			for (const AnimKeyframe& Key : Channel.Keys)
			{
				// glTF needs strictly increasing times; later keys at or before the last are dropped.
				if (!std::isfinite(Key.Time) || (!Times.empty() && Key.Time <= Times.back())) continue;
				Times.push_back(Key.Time);
				// The same change of axes as the vectors: the rotation axis is converted.
				const std::array<float, 4> Q = NormalizedQuat(Finite(Key.Rotation[0]), Finite(Key.Rotation[2]), -Finite(Key.Rotation[1]), Finite(Key.Rotation[3]));
				Rotations.insert(Rotations.end(), Q.begin(), Q.end());
				const GltfVec3 T = ToGltf(Key.Location);
				for (const float V : T) Locations.push_back(Finite(V));
				if (Channel.Components == 0x601)
				{
					// Per-axis sizes swap Y and Z with the axes; the parent's scale is divided out.
					const GltfVec3 Up = ScaleAt(ParentChannel, Key.Time);
					const float Own[3] = {Key.Scale[0], Key.Scale[2], Key.Scale[1]};
					const float Above[3] = {Up[0], Up[2], Up[1]};
					for (int K = 0; K < 3; ++K) Scales.push_back(Finite(std::fabs(Above[K]) > 1e-6f ? Own[K] / Above[K] : Own[K]));
				}
			}
			if (Times.empty()) continue;
			const int Input = Bin.AddFloats(Times, 1, "SCALAR", TargetNone, true);
			auto AddChannel = [&](const std::vector<float>& Values, int Components, const char* Type, const char* Path)
			{
				const int Output = Bin.AddFloats(Values, Components, Type, TargetNone, false);
				Channels.push_back("{\"sampler\":" + std::to_string(Samplers.size()) + ",\"target\":{\"node\":" + std::to_string(Bone) + ",\"path\":\"" + Path + "\"}}");
				Samplers.push_back("{\"input\":" + std::to_string(Input) + ",\"output\":" + std::to_string(Output) + ",\"interpolation\":\"LINEAR\"}");
			};
			AddChannel(Rotations, 4, "VEC4", "rotation");
			AddChannel(Locations, 3, "VEC3", "translation");
			if (!Scales.empty()) AddChannel(Scales, 3, "VEC3", "scale");
		}
		if (Channels.empty()) continue;
		Animations.push_back("{\"name\":" + Quoted(AnimationName) + ",\"samplers\":[" + Joined(Samplers) + "],\"channels\":[" + Joined(Channels) + "]}");
	}
	Report.Animations = Animations.size();

	// Textures: the PNG files as they were handed in.
	std::vector<std::string> Images, Textures;
	for (size_t I = 0; I < Scene.Images.size(); ++I)
	{
		// An empty slot still gets an entry so indices stay as the caller numbered them.
		static const uint8_t Nothing = 0;
		const std::vector<uint8_t>& Png = Scene.Images[I];
		const int View = Bin.AddView(Png.empty() ? &Nothing : Png.data(), Png.empty() ? 1 : Png.size(), TargetNone);
		Images.push_back("{\"bufferView\":" + std::to_string(View) + ",\"mimeType\":\"image/png\"}");
		Textures.push_back("{\"source\":" + std::to_string(I) + ",\"sampler\":0}");
	}

	std::string Json = "{\"asset\":{\"version\":\"2.0\",\"generator\":\"Spore2Interop\"},\"scene\":0,\"scenes\":[{\"nodes\":[" + Joined(SceneNodes) + "]}]";
	Json += ",\"nodes\":[" + Joined(Nodes) + "]";
	Json += ",\"meshes\":[" + Joined(Meshes) + "]";
	Json += ",\"materials\":[" + Joined(Materials) + "]";
	if (!Images.empty())
	{
		// 10497 = repeat, the Direct3D default the game's materials rely on.
		Json += ",\"images\":[" + Joined(Images) + "],\"textures\":[" + Joined(Textures) + "],\"samplers\":[{\"wrapS\":10497,\"wrapT\":10497}]";
	}
	if (Report.SkinnedMeshes > 0)
	{
		std::string Joints;
		for (size_t B = 0; B < BoneCount; ++B) Joints += (B ? "," : "") + std::to_string(B);
		Json += ",\"skins\":[{\"joints\":[" + Joints + "],\"inverseBindMatrices\":" + std::to_string(InverseBindAccessor) + "}]";
	}
	if (!Animations.empty()) Json += ",\"animations\":[" + Joined(Animations) + "]";
	while (Bin.Bytes.size() % 4 != 0) Bin.Bytes.push_back(0);
	Json += ",\"accessors\":[" + Joined(Bin.Accessors) + "],\"bufferViews\":[" + Joined(Bin.Views) + "],\"buffers\":[{\"byteLength\":" + std::to_string(Bin.Bytes.size()) + "}]}";
	while (Json.size() % 4 != 0) Json += ' ';

	// .glb container: 12-byte header, JSON chunk, binary chunk.
	const uint64_t Total = 12ull + 8 + Json.size() + 8 + Bin.Bytes.size();
	if (Total > 0xFFFFFFFFull)
	{
		Report.Notes.push_back("model too large for one .glb file");
		return false;
	}
	Out.reserve(static_cast<size_t>(Total));
	AppendLE32(Out, 0x46546C67); // "glTF"
	AppendLE32(Out, 2);
	AppendLE32(Out, static_cast<uint32_t>(Total));
	AppendLE32(Out, static_cast<uint32_t>(Json.size()));
	AppendLE32(Out, 0x4E4F534A); // "JSON"
	Out.insert(Out.end(), Json.begin(), Json.end());
	AppendLE32(Out, static_cast<uint32_t>(Bin.Bytes.size()));
	AppendLE32(Out, 0x004E4942); // "BIN"
	Out.insert(Out.end(), Bin.Bytes.begin(), Bin.Bytes.end());
	return true;
}

} // namespace sporecore
