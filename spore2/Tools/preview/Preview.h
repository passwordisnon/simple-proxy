// Spore 2.0 interop layer - small software renderer for spore2-scan previews.
//
// Draws placed meshes (Spore axes, Z up) orthographically from the front, the side and above
// into one RGBA image, so assembled creations can be checked without a 3D program.

#pragma once

#include "SporeCore/SporeTexture.h"

#include <cstdint>
#include <vector>

namespace preview
{

struct PreviewMesh
{
	sporecore::MeshData Mesh;      // already placed in creation space
	std::vector<uint8_t> Rgba;     // diffuse texture (top row first), empty for a flat colour
	uint32_t TextureWidth = 0;
	uint32_t TextureHeight = 0;
	uint8_t Tint[3] = {200, 200, 200}; // used when there is no texture
};

// Three square panels side by side, PanelSize pixels each: front (looking along +Y, X right,
// Z up), side (looking along -X, Y right, Z up) and top (looking down, X right, Y up).
// Returns false when there is nothing to draw.
bool RenderViews(const std::vector<PreviewMesh>& Meshes, uint32_t PanelSize, std::vector<uint8_t>& OutRgba, uint32_t& OutWidth, uint32_t& OutHeight);

} // namespace preview
