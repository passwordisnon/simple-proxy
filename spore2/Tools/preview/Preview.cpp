// Spore 2.0 interop layer - small software renderer for spore2-scan previews.

#include "Preview.h"

#include <algorithm>
#include <cmath>
#include <limits>

namespace preview
{

namespace
{

// Maps a Spore-space point to (screen x, screen y, depth) for view V; smaller depth is nearer.
void Project(int V, const float* P, float& X, float& Y, float& Depth)
{
	switch (V)
	{
	case 0: X = P[0]; Y = P[2]; Depth = P[1]; break;   // front: camera at -Y
	case 1: X = P[1]; Y = P[2]; Depth = -P[0]; break;  // side: camera at +X
	default: X = P[0]; Y = P[1]; Depth = -P[2]; break; // top: camera at +Z
	}
}

} // namespace

bool RenderViews(const std::vector<PreviewMesh>& Meshes, uint32_t PanelSize, std::vector<uint8_t>& OutRgba, uint32_t& OutWidth, uint32_t& OutHeight)
{
	float Min[3] = {std::numeric_limits<float>::max(), std::numeric_limits<float>::max(), std::numeric_limits<float>::max()};
	float Max[3] = {-std::numeric_limits<float>::max(), -std::numeric_limits<float>::max(), -std::numeric_limits<float>::max()};
	size_t Triangles = 0;
	for (const PreviewMesh& M : Meshes)
	{
		for (size_t I = 0; I + 2 < M.Mesh.Positions.size(); I += 3)
		{
			for (int C = 0; C < 3; ++C)
			{
				Min[C] = std::min(Min[C], M.Mesh.Positions[I + C]);
				Max[C] = std::max(Max[C], M.Mesh.Positions[I + C]);
			}
		}
		Triangles += M.Mesh.Indices.size() / 3;
	}
	if (Triangles == 0 || PanelSize < 16)
	{
		return false;
	}

	const float Extent = std::max({Max[0] - Min[0], Max[1] - Min[1], Max[2] - Min[2], 1e-6f});
	const float Scale = static_cast<float>(PanelSize) * 0.9f / Extent;
	const float Center[3] = {(Min[0] + Max[0]) * 0.5f, (Min[1] + Max[1]) * 0.5f, (Min[2] + Max[2]) * 0.5f};

	OutWidth = PanelSize * 3;
	OutHeight = PanelSize;
	OutRgba.assign(static_cast<size_t>(OutWidth) * OutHeight * 4, 255);
	for (uint32_t Y = 0; Y < OutHeight; ++Y)
	{
		// Dark vertical gradient, panels separated by a thin line.
		const uint8_t Shade = static_cast<uint8_t>(28 + 20 * Y / OutHeight);
		for (uint32_t X = 0; X < OutWidth; ++X)
		{
			uint8_t* Px = &OutRgba[(static_cast<size_t>(Y) * OutWidth + X) * 4];
			const bool bDivider = X % PanelSize == 0 && X > 0;
			Px[0] = Px[1] = bDivider ? 90 : Shade;
			Px[2] = bDivider ? 90 : static_cast<uint8_t>(Shade + 8);
		}
	}

	std::vector<float> DepthBuffer(static_cast<size_t>(OutWidth) * OutHeight);
	for (int V = 0; V < 3; ++V)
	{
		std::fill(DepthBuffer.begin(), DepthBuffer.end(), std::numeric_limits<float>::max());
		float CenterX, CenterY, CenterDepth;
		Project(V, Center, CenterX, CenterY, CenterDepth);
		const float OffsetX = static_cast<float>(V * PanelSize) + static_cast<float>(PanelSize) * 0.5f;
		const float OffsetY = static_cast<float>(PanelSize) * 0.5f;

		for (const PreviewMesh& M : Meshes)
		{
			const std::vector<float>& P = M.Mesh.Positions;
			const std::vector<float>& Uv = M.Mesh.UVs;
			const bool bTextured = !M.Rgba.empty() && !Uv.empty() && M.TextureWidth > 0 && M.TextureHeight > 0 &&
				M.Rgba.size() >= static_cast<size_t>(M.TextureWidth) * M.TextureHeight * 4;
			for (size_t T = 0; T + 2 < M.Mesh.Indices.size(); T += 3)
			{
				const uint32_t Idx[3] = {M.Mesh.Indices[T], M.Mesh.Indices[T + 1], M.Mesh.Indices[T + 2]};
				if (3ull * std::max({Idx[0], Idx[1], Idx[2]}) + 2 >= P.size()) continue;
				float Sx[3], Sy[3], Sd[3];
				for (int K = 0; K < 3; ++K)
				{
					float X, Y, D;
					Project(V, &P[3ull * Idx[K]], X, Y, D);
					Sx[K] = OffsetX + (X - CenterX) * Scale;
					Sy[K] = OffsetY - (Y - CenterY) * Scale;
					Sd[K] = D;
				}

				// Flat Lambert shading from the face normal, lit from the camera and a little above.
				const float* A = &P[3ull * Idx[0]];
				const float* B = &P[3ull * Idx[1]];
				const float* C = &P[3ull * Idx[2]];
				const float E1[3] = {B[0] - A[0], B[1] - A[1], B[2] - A[2]};
				const float E2[3] = {C[0] - A[0], C[1] - A[1], C[2] - A[2]};
				float N[3] = {E1[1] * E2[2] - E1[2] * E2[1], E1[2] * E2[0] - E1[0] * E2[2], E1[0] * E2[1] - E1[1] * E2[0]};
				const float Length = std::sqrt(N[0] * N[0] + N[1] * N[1] + N[2] * N[2]);
				if (Length <= 0.0f) continue;
				float Nx, Ny, Nd;
				for (float& Value : N) Value /= Length;
				Project(V, N, Nx, Ny, Nd);
				const float Light = 0.35f + 0.65f * std::min(1.0f, std::fabs(-Nd * 0.85f + Ny * 0.5f));

				const float Area = (Sx[1] - Sx[0]) * (Sy[2] - Sy[0]) - (Sx[2] - Sx[0]) * (Sy[1] - Sy[0]);
				if (std::fabs(Area) < 1e-8f) continue;
				const int X0 = std::max(static_cast<int>(V * PanelSize), static_cast<int>(std::floor(std::min({Sx[0], Sx[1], Sx[2]}))));
				const int X1 = std::min(static_cast<int>((V + 1) * PanelSize) - 1, static_cast<int>(std::ceil(std::max({Sx[0], Sx[1], Sx[2]}))));
				const int Y0 = std::max(0, static_cast<int>(std::floor(std::min({Sy[0], Sy[1], Sy[2]}))));
				const int Y1 = std::min(static_cast<int>(OutHeight) - 1, static_cast<int>(std::ceil(std::max({Sy[0], Sy[1], Sy[2]}))));
				for (int Y = Y0; Y <= Y1; ++Y)
				{
					for (int X = X0; X <= X1; ++X)
					{
						const float Px = static_cast<float>(X) + 0.5f, Py = static_cast<float>(Y) + 0.5f;
						const float W0 = ((Sx[1] - Px) * (Sy[2] - Py) - (Sx[2] - Px) * (Sy[1] - Py)) / Area;
						const float W1 = ((Sx[2] - Px) * (Sy[0] - Py) - (Sx[0] - Px) * (Sy[2] - Py)) / Area;
						const float W2 = 1.0f - W0 - W1;
						if (W0 < 0.0f || W1 < 0.0f || W2 < 0.0f) continue;
						const float Depth = W0 * Sd[0] + W1 * Sd[1] + W2 * Sd[2];
						const size_t Pixel = static_cast<size_t>(Y) * OutWidth + static_cast<size_t>(X);
						if (Depth >= DepthBuffer[Pixel]) continue;
						DepthBuffer[Pixel] = Depth;

						uint8_t Color[3] = {M.Tint[0], M.Tint[1], M.Tint[2]};
						if (bTextured)
						{
							// Direct3D texture coordinates: v = 0 is the top row; wrap repeats.
							float U = W0 * Uv[2ull * Idx[0]] + W1 * Uv[2ull * Idx[1]] + W2 * Uv[2ull * Idx[2]];
							float Vt = W0 * Uv[2ull * Idx[0] + 1] + W1 * Uv[2ull * Idx[1] + 1] + W2 * Uv[2ull * Idx[2] + 1];
							U -= std::floor(U);
							Vt -= std::floor(Vt);
							const uint32_t Tx = std::min(M.TextureWidth - 1, static_cast<uint32_t>(U * static_cast<float>(M.TextureWidth)));
							const uint32_t Ty = std::min(M.TextureHeight - 1, static_cast<uint32_t>(Vt * static_cast<float>(M.TextureHeight)));
							const uint8_t* Texel = &M.Rgba[(static_cast<size_t>(Ty) * M.TextureWidth + Tx) * 4];
							Color[0] = Texel[0];
							Color[1] = Texel[1];
							Color[2] = Texel[2];
						}
						uint8_t* Out = &OutRgba[Pixel * 4];
						for (int K = 0; K < 3; ++K) Out[K] = static_cast<uint8_t>(std::min(255.0f, static_cast<float>(Color[K]) * Light));
						Out[3] = 255;
					}
				}
			}
		}
	}
	return true;
}

} // namespace preview
