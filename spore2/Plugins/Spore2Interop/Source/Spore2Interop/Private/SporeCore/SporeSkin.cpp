#include "SporeCore/SporeSkin.h"

#include <algorithm>
#include <cmath>

namespace sporecore
{

namespace
{

// Tuning constants (guesses, adjusted by comparing renders with the creation editor).
constexpr float SpineRadiusPerScale = 0.14f;  // body radius at a vertebra of scale 1
constexpr float LimbRadiusBase = 0.025f;      // limb radius for musclescale 0
constexpr float LimbRadiusPerMuscle = 0.05f;  // added per unit of musclescale
constexpr float LimbMinRadius = 0.02f;

struct Vec3
{
	float X = 0, Y = 0, Z = 0;
};
Vec3 operator+(Vec3 A, Vec3 B) { return {A.X + B.X, A.Y + B.Y, A.Z + B.Z}; }
Vec3 operator-(Vec3 A, Vec3 B) { return {A.X - B.X, A.Y - B.Y, A.Z - B.Z}; }
Vec3 operator*(Vec3 A, float S) { return {A.X * S, A.Y * S, A.Z * S}; }
float Dot(Vec3 A, Vec3 B) { return A.X * B.X + A.Y * B.Y + A.Z * B.Z; }
Vec3 Cross(Vec3 A, Vec3 B) { return {A.Y * B.Z - A.Z * B.Y, A.Z * B.X - A.X * B.Z, A.X * B.Y - A.Y * B.X}; }
float Length(Vec3 A) { return std::sqrt(Dot(A, A)); }
Vec3 Normalize(Vec3 A, Vec3 Fallback)
{
	const float L = Length(A);
	return L > 1e-8f ? A * (1.0f / L) : Fallback;
}
Vec3 ToVec(const float* P) { return {P[0], P[1], P[2]}; }

struct Sample
{
	Vec3 P;
	float R = 0;
};

Sample CatmullRom(const Sample& A, const Sample& B, const Sample& C, const Sample& D, float T)
{
	const float T2 = T * T, T3 = T2 * T;
	auto Eval = [&](float A0, float B0, float C0, float D0)
	{
		return 0.5f * ((2 * B0) + (-A0 + C0) * T + (2 * A0 - 5 * B0 + 4 * C0 - D0) * T2 + (-A0 + 3 * B0 - 3 * C0 + D0) * T3);
	};
	Sample S;
	S.P = {Eval(A.P.X, B.P.X, C.P.X, D.P.X), Eval(A.P.Y, B.P.Y, C.P.Y, D.P.Y), Eval(A.P.Z, B.P.Z, C.P.Z, D.P.Z)};
	S.R = std::max(0.0f, Eval(A.R, B.R, C.R, D.R));
	return S;
}

} // namespace

void AppendTube(const std::vector<TubePoint>& Path, int Sides, int SubdivisionsPerSegment, MeshData& Out)
{
	if (Path.size() < 2 || Sides < 3) return;
	SubdivisionsPerSegment = std::max(1, SubdivisionsPerSegment);

	std::vector<Sample> Pts;
	Pts.reserve(Path.size());
	for (const TubePoint& P : Path) Pts.push_back({ToVec(P.Position), P.Radius});

	std::vector<Sample> Smooth;
	for (size_t I = 0; I + 1 < Pts.size(); ++I)
	{
		const Sample& P0 = Pts[I == 0 ? 0 : I - 1];
		const Sample& P3 = Pts[std::min(I + 2, Pts.size() - 1)];
		for (int S = 0; S < SubdivisionsPerSegment; ++S)
		{
			Smooth.push_back(CatmullRom(P0, Pts[I], Pts[I + 1], P3, static_cast<float>(S) / SubdivisionsPerSegment));
		}
	}
	Smooth.push_back(Pts.back());

	// Rounded end caps: extra rings that shrink to a point (quarter circle profile).
	constexpr int CapRings = 3;
	struct Ring
	{
		Vec3 Center;
		float Radius;
		Vec3 AlongAxis; // tangent used for the frame of this ring
	};
	std::vector<Ring> Rings;
	std::vector<Vec3> Tangents(Smooth.size());
	for (size_t I = 0; I < Smooth.size(); ++I)
	{
		const Vec3 Prev = Smooth[I == 0 ? 0 : I - 1].P;
		const Vec3 Next = Smooth[std::min(I + 1, Smooth.size() - 1)].P;
		Tangents[I] = Normalize(Next - Prev, {0, 0, 1});
	}
	const float Pi = 3.14159265f;
	for (int C = CapRings; C >= 1; --C)
	{
		const float A = (Pi * 0.5f) * static_cast<float>(C) / (CapRings + 1); // 0 = full ring, pi/2 = tip
		const Sample& S = Smooth.front();
		Rings.push_back({S.P - Tangents.front() * (S.R * std::sin(A)), S.R * std::cos(A), Tangents.front()});
	}
	for (size_t I = 0; I < Smooth.size(); ++I) Rings.push_back({Smooth[I].P, Smooth[I].R, Tangents[I]});
	for (int C = 1; C <= CapRings; ++C)
	{
		const float A = (Pi * 0.5f) * static_cast<float>(C) / (CapRings + 1);
		const Sample& S = Smooth.back();
		Rings.push_back({S.P + Tangents.back() * (S.R * std::sin(A)), S.R * std::cos(A), Tangents.back()});
	}

	const uint32_t Base = static_cast<uint32_t>(Out.VertexCount());
	// Parallel-transported frame so the tube does not twist.
	Vec3 Up = std::fabs(Rings.front().AlongAxis.Z) < 0.9f ? Vec3{0, 0, 1} : Vec3{1, 0, 0};
	Vec3 Side = Normalize(Cross(Up, Rings.front().AlongAxis), {1, 0, 0});
	Up = Cross(Rings.front().AlongAxis, Side);
	for (const Ring& R : Rings)
	{
		Side = Normalize(Cross(Up, R.AlongAxis), Side);
		Up = Cross(R.AlongAxis, Side);
		for (int S = 0; S < Sides; ++S)
		{
			const float Angle = 2.0f * Pi * static_cast<float>(S) / Sides;
			const Vec3 Dir = Side * std::cos(Angle) + Up * std::sin(Angle);
			const Vec3 P = R.Center + Dir * R.Radius;
			Out.Positions.push_back(P.X);
			Out.Positions.push_back(P.Y);
			Out.Positions.push_back(P.Z);
			Out.Normals.push_back(Dir.X);
			Out.Normals.push_back(Dir.Y);
			Out.Normals.push_back(Dir.Z);
		}
	}
	// Wound counter-clockwise seen from outside given (Side, Up, Along) is right-handed.
	for (size_t I = 0; I + 1 < Rings.size(); ++I)
	{
		for (int S = 0; S < Sides; ++S)
		{
			const uint32_t A = Base + static_cast<uint32_t>(I * Sides + S);
			const uint32_t B = Base + static_cast<uint32_t>(I * Sides + (S + 1) % Sides);
			const uint32_t C = Base + static_cast<uint32_t>((I + 1) * Sides + S);
			const uint32_t D = Base + static_cast<uint32_t>((I + 1) * Sides + (S + 1) % Sides);
			Out.Indices.insert(Out.Indices.end(), {A, B, C, B, D, C});
		}
	}
}

bool BuildCreatureSkin(const SporeCreation& Creation, MeshData& Out)
{
	const size_t Count = Creation.Blocks.size();
	auto IsVertebra = [&](size_t I) { return Creation.Blocks[I].Instance == PartCeVertebra; };
	auto Valid = [&](int32_t I) { return I >= 0 && static_cast<size_t>(I) < Count; };

	std::vector<bool> VertebraChild(Count, false);
	bool bAny = false;
	for (size_t I = 0; I < Count; ++I)
	{
		if (!IsVertebra(I)) continue;
		bAny = true;
		for (int32_t C : Creation.Blocks[I].Children)
			if (Valid(C) && IsVertebra(static_cast<size_t>(C))) VertebraChild[static_cast<size_t>(C)] = true;
	}
	if (!bAny) return false;

	auto VertebraPoint = [&](size_t I)
	{
		TubePoint P;
		for (int K = 0; K < 3; ++K) P.Position[K] = Creation.Blocks[I].Position[K];
		P.Radius = SpineRadiusPerScale * Creation.Blocks[I].Scale;
		return P;
	};

	// Spine: follow vertebra -> vertebra links from each root (a vertebra no other vertebra owns).
	// Branching spines become one tube per branch.
	std::vector<bool> Visited(Count, false);
	std::vector<std::vector<size_t>> Paths;
	for (size_t Root = 0; Root < Count; ++Root)
	{
		if (!IsVertebra(Root) || VertebraChild[Root] || Visited[Root]) continue;
		std::vector<size_t> Stack{Root};
		// Depth-first; every leaf-ending branch is a path that starts at the root.
		struct Item { std::vector<size_t> Path; };
		std::vector<Item> Work{{{Root}}};
		while (!Work.empty())
		{
			Item Cur = std::move(Work.back());
			Work.pop_back();
			const size_t Last = Cur.Path.back();
			Visited[Last] = true;
			bool bExtended = false;
			for (int32_t C : Creation.Blocks[Last].Children)
			{
				if (!Valid(C) || !IsVertebra(static_cast<size_t>(C)) || Visited[static_cast<size_t>(C)]) continue;
				Item Next = Cur;
				Next.Path.push_back(static_cast<size_t>(C));
				Work.push_back(std::move(Next));
				bExtended = true;
			}
			if (!bExtended && Cur.Path.size() >= 1) Paths.push_back(std::move(Cur.Path));
		}
	}
	for (const std::vector<size_t>& Path : Paths)
	{
		std::vector<TubePoint> Points;
		for (size_t I : Path) Points.push_back(VertebraPoint(I));
		if (Points.size() == 1)
		{
			// A lone vertebra: a short blob along the body axis.
			TubePoint A = Points[0], B = Points[0];
			A.Position[1] -= A.Radius * 0.5f;
			B.Position[1] += B.Radius * 0.5f;
			Points = {A, B};
		}
		AppendTube(Points, 14, 4, Out);
	}

	// Limbs: a chain starts at a limb block that is not the child of another limb and follows
	// limb children; the first non-limb child (foot, hand...) ends the chain with a thin radius.
	std::vector<bool> LimbChild(Count, false);
	for (size_t I = 0; I < Count; ++I)
	{
		if (!Creation.Blocks[I].bIsLimb) continue;
		for (int32_t C : Creation.Blocks[I].Children)
			if (Valid(C) && Creation.Blocks[static_cast<size_t>(C)].bIsLimb) LimbChild[static_cast<size_t>(C)] = true;
	}
	auto LimbRadius = [&](const CreationBlock& B)
	{
		return std::max(LimbMinRadius, LimbRadiusBase + LimbRadiusPerMuscle * B.MuscleScale);
	};
	for (size_t Root = 0; Root < Count; ++Root)
	{
		const CreationBlock& RootBlock = Creation.Blocks[Root];
		if (!RootBlock.bIsLimb || LimbChild[Root]) continue;
		std::vector<TubePoint> Points;
		size_t Cur = Root;
		for (size_t Guard = 0; Guard < Count; ++Guard)
		{
			const CreationBlock& B = Creation.Blocks[Cur];
			TubePoint P;
			for (int K = 0; K < 3; ++K) P.Position[K] = B.Position[K];
			P.Radius = LimbRadius(B);
			Points.push_back(P);
			int32_t NextLimb = -1, NextAny = -1;
			for (int32_t C : B.Children)
			{
				if (!Valid(C)) continue;
				if (Creation.Blocks[static_cast<size_t>(C)].bIsLimb) { NextLimb = C; break; }
				if (NextAny < 0) NextAny = C;
			}
			if (NextLimb >= 0) { Cur = static_cast<size_t>(NextLimb); continue; }
			if (NextAny >= 0)
			{
				// The end part (foot, hand): the tube tapers towards its attach point.
				TubePoint End;
				for (int K = 0; K < 3; ++K) End.Position[K] = Creation.Blocks[static_cast<size_t>(NextAny)].Position[K];
				End.Radius = std::max(LimbMinRadius, P.Radius * 0.6f);
				Points.push_back(End);
			}
			break;
		}
		AppendTube(Points, 10, 4, Out);
	}
	return !Out.Positions.empty();
}

} // namespace sporecore
