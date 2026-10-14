// Spore 2.0 interop layer - derives PBR helper maps from legacy diffuse textures.

#include "SporeCore/SporeTextureGen.h"

#include <algorithm>
#include <cmath>

namespace sporecore
{

namespace
{

std::vector<float> Luminance(const uint8_t* Rgba, int Width, int Height)
{
	std::vector<float> Lum(static_cast<size_t>(Width) * Height);
	for (size_t I = 0; I < Lum.size(); ++I)
	{
		const uint8_t* P = Rgba + I * 4;
		Lum[I] = (0.2126f * P[0] + 0.7152f * P[1] + 0.0722f * P[2]) / 255.0f;
	}
	return Lum;
}

uint8_t ToByte(float V)
{
	return static_cast<uint8_t>(std::clamp(V, 0.0f, 1.0f) * 255.0f + 0.5f);
}

} // namespace

void GenerateNormalMap(const uint8_t* Rgba, int Width, int Height, float Strength, std::vector<uint8_t>& OutRgba)
{
	OutRgba.assign(static_cast<size_t>(Width) * Height * 4, 0);
	if (Width <= 0 || Height <= 0)
	{
		return;
	}
	const std::vector<float> Lum = Luminance(Rgba, Width, Height);
	auto At = [&](int X, int Y)
	{
		X = std::clamp(X, 0, Width - 1);
		Y = std::clamp(Y, 0, Height - 1);
		return Lum[static_cast<size_t>(Y) * Width + X];
	};

	// Scharr kernel: better rotational symmetry than Sobel at the same cost.
	for (int Y = 0; Y < Height; ++Y)
	{
		for (int X = 0; X < Width; ++X)
		{
			const float Gx = 3.0f * (At(X + 1, Y - 1) - At(X - 1, Y - 1)) + 10.0f * (At(X + 1, Y) - At(X - 1, Y)) + 3.0f * (At(X + 1, Y + 1) - At(X - 1, Y + 1));
			const float Gy = 3.0f * (At(X - 1, Y + 1) - At(X - 1, Y - 1)) + 10.0f * (At(X, Y + 1) - At(X, Y - 1)) + 3.0f * (At(X + 1, Y + 1) - At(X + 1, Y - 1));

			float Nx = -Gx * Strength / 16.0f;
			float Ny = -Gy * Strength / 16.0f;
			float Nz = 1.0f;
			const float Len = std::sqrt(Nx * Nx + Ny * Ny + Nz * Nz);
			Nx /= Len;
			Ny /= Len;
			Nz /= Len;

			uint8_t* O = &OutRgba[(static_cast<size_t>(Y) * Width + X) * 4];
			O[0] = ToByte(Nx * 0.5f + 0.5f);
			O[1] = ToByte(Ny * 0.5f + 0.5f);
			O[2] = ToByte(Nz * 0.5f + 0.5f);
			O[3] = 255;
		}
	}
}

void GenerateRoughnessMap(const uint8_t* Rgba, int Width, int Height, float MinRough, float MaxRough, std::vector<uint8_t>& OutGray)
{
	OutGray.assign(static_cast<size_t>(Width) * Height, 0);
	if (Width <= 0 || Height <= 0)
	{
		return;
	}
	const std::vector<float> Lum = Luminance(Rgba, Width, Height);
	for (int Y = 0; Y < Height; ++Y)
	{
		for (int X = 0; X < Width; ++X)
		{
			// 3x3 standard deviation as a cheap micro-surface proxy.
			float Sum = 0.0f;
			float SumSq = 0.0f;
			for (int Dy = -1; Dy <= 1; ++Dy)
			{
				for (int Dx = -1; Dx <= 1; ++Dx)
				{
					const int Sx = std::clamp(X + Dx, 0, Width - 1);
					const int Sy = std::clamp(Y + Dy, 0, Height - 1);
					const float L = Lum[static_cast<size_t>(Sy) * Width + Sx];
					Sum += L;
					SumSq += L * L;
				}
			}
			const float Mean = Sum / 9.0f;
			const float StdDev = std::sqrt(std::max(0.0f, SumSq / 9.0f - Mean * Mean));
			const float T = std::clamp(StdDev * 4.0f, 0.0f, 1.0f);
			OutGray[static_cast<size_t>(Y) * Width + X] = ToByte(MinRough + (MaxRough - MinRough) * T);
		}
	}
}

} // namespace sporecore
