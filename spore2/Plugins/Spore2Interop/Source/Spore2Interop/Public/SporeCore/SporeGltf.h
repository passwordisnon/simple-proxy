// Spore 2.0 interop layer - glTF 2.0 binary (.glb) export of decoded Spore models.
//
// One file carries what OBJ cannot: meshes with their textures, the rw4 skeleton, per-vertex
// bone weights and rw4 keyframe animations. Blender, Unreal and most 3D tools read it.
//
// Spore data is Z up; glTF is Y up, so everything is converted on export
// (x, y, z) -> (x, z, -y). Units stay as stored (Spore's unit is taken as one metre).
//
// Skeleton and animation conventions follow SporeModder's Blender add-on (rw4_importer.py):
// - the stored 3x3 matrix m and translation t of a bone give its bind pose in model space as
//   rotation m, position -m * t; the inverse bind transform is x -> inverse(m) * x + t;
// - keyframes hold a bone's rotation, location and scale relative to its parent bone;
// - Spore does not pass a parent's scale on to the child's axes (only to its position). glTF
//   always inherits scale, so a child's exported scale is divided by its parent's; that is
//   exact when the parent's scale is uniform and an approximation otherwise.
// Blend-factor channels (morph weights) are not exported: morph targets are not decoded.

#pragma once

#include "SporeCore/SporeTexture.h"

#include <cstdint>
#include <functional>
#include <string>
#include <vector>

namespace sporecore
{

// Bone flags as named by SporeModder's Blender add-on (rw4_base.SkeletonBone).
constexpr uint32_t BoneFlagRoot = 0;       // the following bones are this bone's children
constexpr uint32_t BoneFlagLeaf = 1;       // ends a chain: continue at the last branch point
constexpr uint32_t BoneFlagBranch = 2;     // starts a chain that later returns to this bone's parent
constexpr uint32_t BoneFlagBranchLeaf = 3; // a child without children of its own

// The parent of every bone as the animation code derives it from the bone flags (the add-on's
// process_animation walk). Should equal SkeletonBone::Parent; a difference means one of the two
// readings is wrong for that file.
std::vector<int32_t> SkeletonParentsFromFlags(const SkeletonData& Skeleton);

struct GltfMesh
{
	const MeshData* Mesh = nullptr;
	std::string Name;
	int32_t Image = -1; // index into GltfScene::Images used as the base colour texture, or -1
};

struct GltfScene
{
	std::vector<GltfMesh> Meshes;
	std::vector<std::vector<uint8_t>> Images; // PNG files, embedded as they are
	// Skeleton the meshes' bone indices refer to (one with a bind pose), or null for static models.
	const SkeletonData* Skeleton = nullptr;
	// Animations for that skeleton. One whose channels do not all name bones of it is left out.
	std::vector<const KeyframeAnimation*> Animations;
	// Turns bone and animation name hashes into names; unset or empty results give 0x-hex names.
	std::function<std::string(uint32_t Id)> NameOf;
};

struct GltfReport
{
	size_t Meshes = 0;        // meshes written
	size_t SkinnedMeshes = 0; // of those, with bone weights
	size_t Bones = 0;
	size_t Animations = 0;
	std::vector<std::string> Notes; // what was left out and why
};

// Returns false (and an empty Out) when the scene has no mesh that can be written.
bool WriteGlb(const GltfScene& Scene, std::vector<uint8_t>& Out, GltfReport& Report);

} // namespace sporecore
