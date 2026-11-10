// Spore 2.0 interop layer - approximate body skin for creatures.
//
// Spore does not store a creature's body as a mesh: the game wraps a skin around the spine
// and limbs at runtime. A saved creation only holds the rig blocks (vertebrae, limb bones)
// and their sizes. The exact skinning algorithm is not known here, so this builds an
// APPROXIMATION: smooth tubes along the spine and along each limb chain. It is not what the
// game would draw; radii and constants are guesses tuned by eye (see SporeSkin.cpp).

#pragma once

#include "SporeCore/SporeCreation.h"
#include "SporeCore/SporeTexture.h"

#include <vector>

namespace sporecore
{

// Part instance of creature_parts~/ce_vertebra (FnvHash("ce_vertebra")).
constexpr uint32_t PartCeVertebra = 0xD05C53A3;

struct TubePoint
{
	float Position[3] = {0, 0, 0};
	float Radius = 0.0f;
};

// Sweeps a closed-ended tube along a polyline (Catmull-Rom smoothed, radius interpolated).
// Appends to Out (positions, normals, indices). Needs at least 2 points.
void AppendTube(const std::vector<TubePoint>& Path, int Sides, int SubdivisionsPerSegment, MeshData& Out);

// Builds the approximate skin: one mesh for the whole body (spine + limbs). Returns false
// when the creation has no vertebrae (nothing to wrap, e.g. buildings and vehicles).
bool BuildCreatureSkin(const SporeCreation& Creation, MeshData& Out);

} // namespace sporecore
