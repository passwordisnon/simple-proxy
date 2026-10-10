// Spore 2.0 interop layer - derives PBR helper maps from legacy diffuse textures.
//
// Legacy Spore textures are low-resolution diffuse only. These helpers build
// a tangent-space normal map (Scharr gradient over luminance) and a roughness
// estimate so the UE material can light them sensibly. External upscalers
// (e.g. ESRGAN) should run before this step, on the exported diffuse.

#pragma once

#include <cstdint>
#include <vector>

namespace sporecore
{

// RGBA8 in, RGBA8 out. Strength scales the gradient (2.0 is a good default).
// Edges clamp, so the result tiles like the source texture does not.
void GenerateNormalMap(const uint8_t* Rgba, int Width, int Height, float Strength, std::vector<uint8_t>& OutRgba);

// Single-channel roughness: flat areas map to MinRough, high local contrast to MaxRough.
void GenerateRoughnessMap(const uint8_t* Rgba, int Width, int Height, float MinRough, float MaxRough, std::vector<uint8_t>& OutGray);

} // namespace sporecore
