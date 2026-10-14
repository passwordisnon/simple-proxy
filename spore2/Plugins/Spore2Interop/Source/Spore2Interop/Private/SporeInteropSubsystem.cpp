// Spore 2.0 interop layer - mounts a local Spore install and exposes its resources to UE.

#include "SporeInteropSubsystem.h"

#include "Async/Async.h"
#include "Async/ParallelFor.h"
#include "Engine/Engine.h"
#include "Engine/GameInstance.h"
#include "Engine/GameViewportClient.h"
#include "Engine/Texture2D.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "HAL/FileManager.h"
#include "HAL/IConsoleManager.h"
#include "HAL/PlatformFileManager.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Modules/ModuleManager.h"
#include "ProceduralMeshComponent.h"
#include "SporeCore/SporeCreation.h"
#include "SporeCore/SporePng.h"
#include "SporeCore/SporeProp.h"
#include "SporeCore/SporeTexture.h"
#include "SporeCore/SporeTextureGen.h"
#include "UI/SSporePackageBrowser.h"
#include "Widgets/SWeakWidget.h"

THIRD_PARTY_INCLUDES_START
#include "zlib.h"
THIRD_PARTY_INCLUDES_END

IMPLEMENT_MODULE(FDefaultModuleImpl, Spore2Interop);
DEFINE_LOG_CATEGORY(LogSporeInterop);

namespace SporeInterop
{

bool ReadFileRange(IFileHandle& Handle, int64 Offset, int64 Size, TArray<uint8>& Out)
{
	Out.SetNumUninitialized(Size);
	return Handle.Seek(Offset) && Handle.Read(Out.GetData(), Size);
}

bool ZlibInflate(const uint8* Data, size_t Size, std::vector<uint8>& Out)
{
	z_stream Stream = {};
	if (inflateInit(&Stream) != Z_OK)
	{
		return false;
	}
	Stream.next_in = const_cast<Bytef*>(Data);
	Stream.avail_in = static_cast<uInt>(Size);
	Out.clear();
	uint8 Chunk[16384];
	int Result = Z_OK;
	while (Result == Z_OK)
	{
		Stream.next_out = Chunk;
		Stream.avail_out = sizeof(Chunk);
		Result = inflate(&Stream, Z_NO_FLUSH);
		Out.insert(Out.end(), Chunk, Chunk + (sizeof(Chunk) - Stream.avail_out));
	}
	inflateEnd(&Stream);
	return Result == Z_STREAM_END;
}

} // namespace SporeInterop

FString FSporeResourceKey::ToString() const
{
	return FString::Printf(TEXT("%08X!%08X.%s"), Group, Instance, *TypeName());
}

FString FSporeResourceKey::TypeName() const
{
	if (const char* Known = sporecore::KnownTypeName(Type))
	{
		return FString(ANSI_TO_TCHAR(Known));
	}
	return FString::Printf(TEXT("%08X"), Type);
}

void USporeInteropSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	if (InstallRoots.IsEmpty())
	{
		// The game Data folders copied out of the disc images (the disc folders hold only .iso files).
		const FString SporeData = FPaths::Combine(FPlatformProcess::UserHomeDir(), TEXT("SporeData"));
		InstallRoots = {
			FPaths::Combine(SporeData, TEXT("Base")),
			FPaths::Combine(SporeData, TEXT("CreepyCute")),
			FPaths::Combine(SporeData, TEXT("GalacticAdventures")),
		};
	}
	if (NameRegistryFolder.IsEmpty())
	{
		// Where check-my-install.sh downloads SporeModder-FX's reg_*.txt name lists.
		const FString Names = FPaths::Combine(FPlatformProcess::UserHomeDir(), TEXT("SporeData"), TEXT("names"));
		if (FPaths::FileExists(FPaths::Combine(Names, TEXT("reg_file.txt"))))
		{
			NameRegistryFolder = Names;
		}
	}
	if (ModsFolder.IsEmpty())
	{
		ModsFolder = FPaths::Combine(FPlatformProcess::UserDir(), TEXT("My Spore Creations"), TEXT("Mods"));
	}

	LoadNameRegistries();
	LaunchState = ParseLaunchState(FCommandLine::Get());
	UE_LOG(LogSporeInterop, Log, TEXT("Spore interop ready, %d install roots, launch state %d"), InstallRoots.Num(), static_cast<int32>(LaunchState));
}

void USporeInteropSubsystem::Deinitialize()
{
	ClosePackageBrowser();
	++MountGeneration; // drops any mount still in flight
	Packages.Reset();
	Registry.Reset();
	Super::Deinitialize();
}

void USporeInteropSubsystem::LoadNameRegistries()
{
	PropertyNames.Reset();
	TypeNames.Reset();
	FileNames.Reset();
	if (NameRegistryFolder.IsEmpty())
	{
		return;
	}
	auto Load = [this](const TCHAR* FileName, TMap<uint32, FString>& Out)
	{
		FString Text;
		if (!FFileHelper::LoadFileToString(Text, *FPaths::Combine(NameRegistryFolder, FileName)))
		{
			return;
		}
		std::unordered_map<uint32_t, std::string> Parsed;
		sporecore::ParseNameRegistry(TCHAR_TO_UTF8(*Text), Parsed);
		for (const auto& [Id, Name] : Parsed)
		{
			Out.Add(Id, UTF8_TO_TCHAR(Name.c_str()));
		}
	};
	Load(TEXT("reg_property.txt"), PropertyNames);
	Load(TEXT("reg_type.txt"), TypeNames);
	Load(TEXT("reg_file.txt"), FileNames);
	UE_LOG(LogSporeInterop, Log, TEXT("Loaded %d property names and %d type names from %s"), PropertyNames.Num(), TypeNames.Num(), *NameRegistryFolder);
}

FString USporeInteropSubsystem::LookupTypeName(uint32 TypeId) const
{
	const FString* Found = TypeNames.Find(TypeId);
	return Found ? *Found : FString();
}

uint32 USporeInteropSubsystem::ResolveFileName(const FString& Name) const
{
	if (Name.StartsWith(TEXT("0x"), ESearchCase::IgnoreCase))
	{
		return static_cast<uint32>(FCString::Strtoui64(*Name.Mid(2), nullptr, 16));
	}
	for (const TPair<uint32, FString>& Pair : FileNames)
	{
		if (Pair.Value.Equals(Name, ESearchCase::IgnoreCase))
		{
			return Pair.Key;
		}
	}
	return sporecore::FnvHash(TCHAR_TO_UTF8(*Name));
}

bool USporeInteropSubsystem::ReadProperties(const FSporeResourceKey& Key, TArray<FSporeProperty>& OutProperties, FString* OutError) const
{
	OutProperties.Reset();
	TArray<uint8> Bytes;
	if (!ReadResource(Key, Bytes, OutError))
	{
		return false;
	}

	sporecore::PropertyList List;
	const bool bOk = sporecore::ParsePropertyList(Bytes.GetData(), Bytes.Num(), List);
	for (const sporecore::Property& Prop : List.Properties)
	{
		const FString* Registered = PropertyNames.Find(Prop.Id);
		const std::string Name = Registered ? std::string(TCHAR_TO_UTF8(**Registered)) : std::string();
		const std::string Line = sporecore::FormatProperty(Prop, Name, [this](uint32_t Id, bool bType)
		{
			const FString* Found = (bType ? TypeNames : FileNames).Find(Id);
			return Found ? std::string(TCHAR_TO_UTF8(**Found)) : std::string();
		});

		// FormatProperty renders "<name> <type> = <value>"; split it back into fields.
		const size_t NameEnd = Line.find(' ');
		const size_t Equals = Line.find(" = ");
		FSporeProperty& Out = OutProperties.AddDefaulted_GetRef();
		Out.Name = UTF8_TO_TCHAR(Line.substr(0, NameEnd).c_str());
		Out.Type = UTF8_TO_TCHAR(Line.substr(NameEnd + 1, Equals - NameEnd - 1).c_str());
		Out.Value = UTF8_TO_TCHAR(Line.substr(Equals + 3).c_str());
	}
	if (!bOk && OutError)
	{
		*OutError = UTF8_TO_TCHAR(List.Error.c_str());
	}
	return bOk;
}

struct FSporeTextureData
{
	sporecore::TextureImage Image;
};

bool USporeInteropSubsystem::ReadSporeTexture(const FSporeResourceKey& Key, int32 TextureIndex, FSporeTextureData& Out) const
{
	TArray<uint8> Bytes;
	FString ReadError;
	if (!ReadResource(Key, Bytes, &ReadError))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s: %s"), *Key.ToString(), *ReadError);
		return false;
	}

	std::string Error;
	bool bOk = false;
	if (Key.Type == 0x2F4E681C) // raster
	{
		bOk = TextureIndex == 0 && sporecore::ParseRaster(Bytes.GetData(), Bytes.Num(), Out.Image, Error);
	}
	else if (Key.Type == 0x2F4E681B) // rw4
	{
		sporecore::Rw4Info Info;
		bOk = sporecore::ParseRw4(Bytes.GetData(), Bytes.Num(), Info, Error) && Info.Textures.size() > static_cast<size_t>(TextureIndex) && TextureIndex >= 0;
		if (bOk)
		{
			Out.Image = MoveTemp(Info.Textures[TextureIndex]);
		}
		else if (Error.empty())
		{
			Error = "no texture at that index";
		}
	}
	else
	{
		Error = "resource is not a raster or rw4";
	}
	if (!bOk)
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s: %s"), *Key.ToString(), UTF8_TO_TCHAR(Error.c_str()));
	}
	return bOk;
}

void USporeInteropSubsystem::AddSporeMeshSection(UProceduralMeshComponent* Target, int32 Section, const sporecore::MeshData& Mesh, float UnitScale, UMaterialInterface* BaseMaterial, const FSporeResourceKey& Key)
{
	const int32 VertexCount = static_cast<int32>(Mesh.VertexCount());
	TArray<FVector> Vertices;
	TArray<FVector> Normals;
	TArray<FVector2D> UV0;
	Vertices.Reserve(VertexCount);
	for (int32 V = 0; V < VertexCount; ++V)
	{
		// Spore (right-handed, Z up) -> UE (left-handed, Z up): mirror Y.
		Vertices.Emplace(Mesh.Positions[3 * V] * UnitScale, -Mesh.Positions[3 * V + 1] * UnitScale, Mesh.Positions[3 * V + 2] * UnitScale);
		if (!Mesh.Normals.empty())
		{
			Normals.Emplace(FVector(Mesh.Normals[3 * V], -Mesh.Normals[3 * V + 1], Mesh.Normals[3 * V + 2]).GetSafeNormal());
		}
		if (!Mesh.UVs.empty())
		{
			UV0.Emplace(Mesh.UVs[2 * V], Mesh.UVs[2 * V + 1]); // both Direct3D-style, no flip
		}
	}
	TArray<int32> Triangles;
	Triangles.Reserve(static_cast<int32>(Mesh.Indices.size()));
	for (size_t T = 0; T + 2 < Mesh.Indices.size(); T += 3)
	{
		// Mirroring one axis reverses winding, so swap two corners to keep faces outward.
		Triangles.Add(static_cast<int32>(Mesh.Indices[T]));
		Triangles.Add(static_cast<int32>(Mesh.Indices[T + 2]));
		Triangles.Add(static_cast<int32>(Mesh.Indices[T + 1]));
	}
	Target->CreateMeshSection(Section, Vertices, Triangles, Normals, UV0, TArray<FColor>(), TArray<FProcMeshTangent>(), true);
	if (BaseMaterial)
	{
		const sporecore::MeshTextureSlot* Slot = sporecore::DiffuseSlot(Mesh);
		if (Slot && Slot->TextureIndex >= 0)
		{
			if (UTexture2D* Diffuse = LoadSporeTexture(Key, Slot->TextureIndex))
			{
				Target->SetMaterial(Section, CreateLegacyMaterial(BaseMaterial, Diffuse, nullptr, false));
			}
		}
		else if (Slot && !Slot->OverrideName.empty())
		{
			UE_LOG(LogSporeInterop, Log, TEXT("Model %s section %d uses external texture '%s'"), *Key.ToString(), Section, UTF8_TO_TCHAR(Slot->OverrideName.c_str()));
		}
	}
}

int32 USporeInteropSubsystem::BuildSporeMesh(const FSporeResourceKey& Key, UProceduralMeshComponent* Target, float UnitScale, UMaterialInterface* BaseMaterial)
{
	if (!Target)
	{
		return 0;
	}
	TArray<uint8> Bytes;
	FString ReadError;
	if (!ReadResource(Key, Bytes, &ReadError))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Model %s: %s"), *Key.ToString(), *ReadError);
		return 0;
	}
	sporecore::Rw4Info Info;
	std::string Error;
	if (!sporecore::ParseRw4(Bytes.GetData(), Bytes.Num(), Info, Error))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Model %s: %s"), *Key.ToString(), UTF8_TO_TCHAR(Error.c_str()));
		return 0;
	}
	for (const std::string& Issue : Info.MeshIssues)
	{
		UE_LOG(LogSporeInterop, Log, TEXT("Model %s: skipped a mesh (%s)"), *Key.ToString(), UTF8_TO_TCHAR(Issue.c_str()));
	}

	Target->ClearAllMeshSections();
	int32 Section = 0;
	for (const sporecore::MeshData& Mesh : Info.Meshes)
	{
		AddSporeMeshSection(Target, Section++, Mesh, UnitScale, BaseMaterial, Key);
	}
	UE_LOG(LogSporeInterop, Log, TEXT("Model %s: built %d mesh sections"), *Key.ToString(), Section);
	return Section;
}

int32 USporeInteropSubsystem::AssembleCreationPng(const FString& PngFile, UProceduralMeshComponent* Target, float UnitScale, UMaterialInterface* BaseMaterial, bool bFlipRotation)
{
	if (!Target)
	{
		return 0;
	}
	TArray<uint8> Data;
	if (!FFileHelper::LoadFileToArray(Data, *PngFile))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Cannot read %s"), *PngFile);
		return 0;
	}
	sporecore::SporeCreation Creation;
	std::string Error;
	// Saved creation files (.crt, .bld, ... from EditorSaves/Pollination packages) are the
	// <sporemodel> XML itself; anything else is treated as a creation card PNG.
	const bool bIsXml = Data.Num() > 0 && Data[0] == '<';
	const bool bDecoded = bIsXml
		? sporecore::ParseSporeModelXml(std::string(reinterpret_cast<const char*>(Data.GetData()), Data.Num()), Creation, Error)
		: sporecore::DecodeSporeCreation(Data.GetData(), Data.Num(), &SporeInterop::ZlibInflate, Creation, Error);
	if (!bDecoded)
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("%s: %s"), *PngFile, UTF8_TO_TCHAR(Error.c_str()));
		return 0;
	}

	Target->ClearAllMeshSections();
	int32 Section = 0;
	int32 PartsBuilt = 0;
	for (int32 B = 0; B < static_cast<int32>(Creation.Blocks.size()); ++B)
	{
		const sporecore::CreationBlock& Block = Creation.Blocks[B];
		FSporeResourceKey PropKey;
		PropKey.Group = Block.Group;
		PropKey.Instance = Block.Instance;
		PropKey.Type = 0x00B1B104;

		TArray<uint8> Bytes;
		FString ReadError;
		sporecore::PropertyList Props;
		sporecore::ResourceKey ModelKey;
		if (!ReadResource(PropKey, Bytes, &ReadError) || !sporecore::ParsePropertyList(Bytes.GetData(), Bytes.Num(), Props) || !sporecore::FindPartModelKey(Props, ModelKey))
		{
			UE_LOG(LogSporeInterop, Log, TEXT("%s part %d (%s): no readable part file or model reference"), *PngFile, B, *PropKey.ToString());
			continue;
		}
		const FSporeResourceKey ModelResource(ModelKey);
		sporecore::Rw4Info Info;
		if (!ReadResource(ModelResource, Bytes, &ReadError) || !sporecore::ParseRw4(Bytes.GetData(), Bytes.Num(), Info, Error))
		{
			UE_LOG(LogSporeInterop, Log, TEXT("%s part %d: model %s not readable"), *PngFile, B, *ModelResource.ToString());
			continue;
		}
		++PartsBuilt;
		for (sporecore::MeshData& Mesh : Info.Meshes)
		{
			sporecore::PlaceMesh(Mesh, Block, bFlipRotation); // into creation space, still Spore axes
			AddSporeMeshSection(Target, Section++, Mesh, UnitScale, BaseMaterial, ModelResource);
		}
	}
	UE_LOG(LogSporeInterop, Log, TEXT("%s: assembled %d of %d parts into %d sections"), *PngFile, PartsBuilt, static_cast<int32>(Creation.Blocks.size()), Section);
	return PartsBuilt;
}

FString USporeInteropSubsystem::DescribeRw4(const FSporeResourceKey& Key) const
{
	if (Key.Type == 0x2F4E681C)
	{
		return TEXT("Texture: ") + DescribeSporeTexture(Key);
	}
	TArray<uint8> Bytes;
	FString ReadError;
	if (!ReadResource(Key, Bytes, &ReadError))
	{
		return ReadError;
	}
	sporecore::Rw4Info Info;
	std::string Error;
	if (!sporecore::ParseRw4(Bytes.GetData(), Bytes.Num(), Info, Error))
	{
		return UTF8_TO_TCHAR(Error.c_str());
	}
	size_t Triangles = 0;
	size_t Vertices = 0;
	for (const sporecore::MeshData& Mesh : Info.Meshes)
	{
		Triangles += Mesh.Indices.size() / 3;
		Vertices += Mesh.VertexCount();
	}
	FString Description = FString::Printf(TEXT("RenderWare 4: %d mesh(es), %llu vertices, %llu triangles"), static_cast<int32>(Info.Meshes.size()),
		static_cast<unsigned long long>(Vertices), static_cast<unsigned long long>(Triangles));
	if (Info.SkippedMeshes > 0)
	{
		Description += FString::Printf(TEXT(" (%u skipped)"), Info.SkippedMeshes);
	}
	for (const sporecore::TextureImage& Image : Info.Textures)
	{
		Description += FString::Printf(TEXT("\nTexture: %s %ux%u"), UTF8_TO_TCHAR(sporecore::TextureFormatName(Image.Format).c_str()), Image.Width, Image.Height);
	}
	return Description;
}

FString USporeInteropSubsystem::DescribeSporeTexture(const FSporeResourceKey& Key) const
{
	FSporeTextureData Data;
	if (!ReadSporeTexture(Key, 0, Data))
	{
		return TEXT("no readable texture (see LogSporeInterop)");
	}
	return FString::Printf(TEXT("%s %ux%u, %u mip%s%s"), UTF8_TO_TCHAR(sporecore::TextureFormatName(Data.Image.Format).c_str()),
		Data.Image.Width, Data.Image.Height, Data.Image.MipCount, Data.Image.MipCount == 1 ? TEXT("") : TEXT("s"), Data.Image.bCube ? TEXT(", cube map") : TEXT(""));
}

bool USporeInteropSubsystem::DecodeSporeTexturePixels(const FSporeResourceKey& Key, int32 TextureIndex, TArray<uint8>& OutRgba, int32& OutWidth, int32& OutHeight)
{
	FSporeTextureData Data;
	if (!ReadSporeTexture(Key, TextureIndex, Data))
	{
		return false;
	}
	std::vector<uint8_t> Rgba;
	std::string Error;
	if (!sporecore::DecodeToRgba(Data.Image, Rgba, Error))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s: %s"), *Key.ToString(), UTF8_TO_TCHAR(Error.c_str()));
		return false;
	}
	OutRgba.SetNumUninitialized(static_cast<int32>(Rgba.size()));
	FMemory::Memcpy(OutRgba.GetData(), Rgba.data(), Rgba.size());
	OutWidth = static_cast<int32>(Data.Image.Width);
	OutHeight = static_cast<int32>(Data.Image.Height);
	return true;
}

UTexture2D* USporeInteropSubsystem::LoadSporeTexture(const FSporeResourceKey& Key, int32 TextureIndex)
{
	FSporeTextureData Data;
	if (!ReadSporeTexture(Key, TextureIndex, Data))
	{
		return nullptr;
	}
	const sporecore::TextureImage& Image = Data.Image;
	if (Image.bCube)
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s is a cube map; not supported yet"), *Key.ToString());
		return nullptr;
	}

	// Formats the GPU can take as-is; everything else is decoded to BGRA8.
	EPixelFormat PixelFormat = PF_B8G8R8A8;
	bool bUploadRaw = true;
	switch (Image.Format)
	{
	case sporecore::FourCC_DXT1: PixelFormat = PF_DXT1; break;
	case sporecore::FourCC_DXT3: PixelFormat = PF_DXT3; break;
	case sporecore::FourCC_DXT5: PixelFormat = PF_DXT5; break;
	case sporecore::D3DFMT_A8R8G8B8: PixelFormat = PF_B8G8R8A8; break; // same memory order
	default: bUploadRaw = false; break;
	}

	std::vector<uint8_t> Pixels;
	if (bUploadRaw)
	{
		const size_t Mip0 = sporecore::MipSize(Image.Format, Image.Width, Image.Height);
		if (Image.Data.size() < Mip0)
		{
			UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s: data shorter than its first mip"), *Key.ToString());
			return nullptr;
		}
		Pixels.assign(Image.Data.begin(), Image.Data.begin() + Mip0);
	}
	else
	{
		std::string Error;
		if (!sporecore::DecodeToRgba(Image, Pixels, Error))
		{
			UE_LOG(LogSporeInterop, Warning, TEXT("Texture %s: %s"), *Key.ToString(), UTF8_TO_TCHAR(Error.c_str()));
			return nullptr;
		}
		for (size_t I = 0; I + 3 < Pixels.size(); I += 4)
		{
			Swap(Pixels[I], Pixels[I + 2]); // RGBA -> BGRA
		}
	}

	UTexture2D* Texture = UTexture2D::CreateTransient(static_cast<int32>(Image.Width), static_cast<int32>(Image.Height), PixelFormat, FName(*Key.ToString()));
	if (!Texture)
	{
		return nullptr;
	}
	FTexture2DMipMap& Mip = Texture->GetPlatformData()->Mips[0];
	void* Dest = Mip.BulkData.Lock(LOCK_READ_WRITE);
	FMemory::Memcpy(Dest, Pixels.data(), FMath::Min<int64>(Pixels.size(), Mip.BulkData.GetBulkDataSize()));
	Mip.BulkData.Unlock();
	Texture->UpdateResource();
	return Texture;
}

ESporeLaunchState USporeInteropSubsystem::ParseLaunchState(const FString& CommandLine)
{
	FString StateName;
	if (!FParse::Value(*CommandLine, TEXT("-state:"), StateName))
	{
		return ESporeLaunchState::None;
	}
	if (StateName.Equals(TEXT("CellEditor"), ESearchCase::IgnoreCase)) return ESporeLaunchState::CellEditor;
	if (StateName.Equals(TEXT("CakeEditor"), ESearchCase::IgnoreCase)) return ESporeLaunchState::CakeEditor;
	if (StateName.Equals(TEXT("PlannerThumbnailGen"), ESearchCase::IgnoreCase)) return ESporeLaunchState::PlannerThumbnailGen;
	if (StateName.Equals(TEXT("PackageBrowser"), ESearchCase::IgnoreCase)) return ESporeLaunchState::PackageBrowser;
	return ESporeLaunchState::Unknown;
}

void USporeInteropSubsystem::MountAll()
{
	if (bMounting)
	{
		return;
	}
	bMounting = true;
	const uint32 Generation = ++MountGeneration;

	// Collect paths on the game thread so config edits during the scan cannot race.
	TArray<TPair<FString, bool>> Sources;
	IFileManager& FileManager = IFileManager::Get();
	auto Collect = [&](const FString& Root, bool bIsMod)
	{
		if (!FPaths::DirectoryExists(Root))
		{
			UE_LOG(LogSporeInterop, Log, TEXT("Spore folder not found (skipped): %s"), *Root);
			if (GEngine && !bIsMod && &Root == &InstallRoots[0])
			{
				GEngine->AddOnScreenDebugMessage(-1, 12.0f, FColor::Orange, FString::Printf(TEXT("Spore folder not found: %s"), *Root));
			}
			return;
		}
		TArray<FString> Found;
		FileManager.FindFilesRecursive(Found, *Root, TEXT("*.package"), true, false);
		Found.Sort();
		for (const FString& File : Found)
		{
			Sources.Emplace(File, bIsMod);
		}
	};
	for (const FString& Root : InstallRoots)
	{
		Collect(Root, false);
	}
	Collect(ModsFolder, true);

	TWeakObjectPtr<USporeInteropSubsystem> WeakThis(this);
	Async(EAsyncExecution::ThreadPool, [WeakThis, Generation, Sources = MoveTemp(Sources)]()
	{
		TArray<TSharedPtr<FSporeMountedPackage>> Parsed;
		Parsed.SetNum(Sources.Num());
		ParallelFor(Sources.Num(), [&](int32 Index)
		{
			Parsed[Index] = ParsePackage(Sources[Index].Key, Sources[Index].Value);
		});

		AsyncTask(ENamedThreads::GameThread, [WeakThis, Generation, Parsed = MoveTemp(Parsed)]() mutable
		{
			if (USporeInteropSubsystem* Self = WeakThis.Get())
			{
				Self->FinishMount(Generation, MoveTemp(Parsed));
			}
		});
	});
}

TSharedPtr<FSporeMountedPackage> USporeInteropSubsystem::ParsePackage(const FString& Path, bool bIsMod)
{
	TSharedPtr<FSporeMountedPackage> Result = MakeShared<FSporeMountedPackage>();
	Result->Path = Path;
	Result->bIsMod = bIsMod;

	TUniquePtr<IFileHandle> Handle(FPlatformFileManager::Get().GetPlatformFile().OpenRead(*Path));
	if (!Handle)
	{
		Result->Error = TEXT("cannot open file");
		return Result;
	}
	Result->FileSize = static_cast<uint64>(Handle->Size());

	TArray<uint8> Buffer;
	sporecore::DbpfHeader Header;
	sporecore::DbpfError Error = sporecore::DbpfError::TooSmall;
	if (SporeInterop::ReadFileRange(*Handle, 0, sporecore::DbpfHeaderSize, Buffer))
	{
		Error = sporecore::ParseHeader(Buffer.GetData(), Buffer.Num(), Result->FileSize, Header);
	}

	std::vector<sporecore::IndexEntry> Entries;
	if (Error == sporecore::DbpfError::None)
	{
		Error = SporeInterop::ReadFileRange(*Handle, static_cast<int64>(Header.IndexOffset), Header.IndexSize, Buffer)
			? sporecore::ParseIndex(Buffer.GetData(), Buffer.Num(), Header, Result->FileSize, Entries)
			: sporecore::DbpfError::IndexOutOfRange;
	}
	if (Error != sporecore::DbpfError::None)
	{
		Result->Error = ANSI_TO_TCHAR(sporecore::ToString(Error));
		return Result;
	}

	std::vector<std::string> Issues;
	sporecore::ValidateIndex(Entries, Result->FileSize, Issues);
	for (const std::string& Issue : Issues)
	{
		Result->Issues.Add(UTF8_TO_TCHAR(Issue.c_str()));
	}
	Result->Entries.Append(Entries.data(), static_cast<int32>(Entries.size()));
	return Result;
}

void USporeInteropSubsystem::FinishMount(uint32 Generation, TArray<TSharedPtr<FSporeMountedPackage>> NewPackages)
{
	if (Generation != MountGeneration)
	{
		return;
	}
	bMounting = false;

	Packages = MoveTemp(NewPackages);
	Registry.Reset();
	Summary = FSporeMountSummary();

	for (int32 PackageIndex = 0; PackageIndex < Packages.Num(); ++PackageIndex)
	{
		const FSporeMountedPackage& Package = *Packages[PackageIndex];
		if (!Package.Error.IsEmpty())
		{
			++Summary.PackagesFailed;
			UE_LOG(LogSporeInterop, Warning, TEXT("Skipped %s: %s"), *Package.Path, *Package.Error);
			continue;
		}
		++Summary.PackagesMounted;
		Summary.IntegrityIssues += Package.Issues.Num();

		for (int32 EntryIndex = 0; EntryIndex < Package.Entries.Num(); ++EntryIndex)
		{
			FSporeResourceRef& Ref = Registry.FindOrAdd(FSporeResourceKey(Package.Entries[EntryIndex].Key));
			Ref.PackageIndex = PackageIndex;
			Ref.EntryIndex = EntryIndex;
			++Ref.ProviderCount;
		}
	}

	Summary.UniqueResources = Registry.Num();
	for (const TPair<FSporeResourceKey, FSporeResourceRef>& Pair : Registry)
	{
		Summary.OverriddenResources += Pair.Value.ProviderCount > 1 ? 1 : 0;
	}

	const FString Message = FString::Printf(TEXT("Spore: mounted %d packages (%d failed), %d resources, %d overridden, %d integrity issues"),
		Summary.PackagesMounted, Summary.PackagesFailed, Summary.UniqueResources, Summary.OverriddenResources, Summary.IntegrityIssues);
	UE_LOG(LogSporeInterop, Log, TEXT("%s"), *Message);
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 12.0f, Summary.PackagesMounted > 0 ? FColor::Green : FColor::Orange,
			Summary.PackagesMounted > 0 ? Message : Message + TEXT(" - no packages found, check InstallRoots (default ~/SporeData/Base)"));
	}

	if (Browser.IsValid())
	{
		Browser->Refresh();
	}
	OnMountFinished.Broadcast(Summary);
}

bool USporeInteropSubsystem::ReadResource(const FSporeResourceKey& Key, TArray<uint8>& OutBytes, FString* OutError) const
{
	const FSporeResourceRef* Ref = Registry.Find(Key);
	if (!Ref)
	{
		if (OutError) *OutError = TEXT("resource not mounted");
		return false;
	}
	const FSporeMountedPackage& Package = *Packages[Ref->PackageIndex];
	const sporecore::IndexEntry& Entry = Package.Entries[Ref->EntryIndex];

	TUniquePtr<IFileHandle> Handle(FPlatformFileManager::Get().GetPlatformFile().OpenRead(*Package.Path));
	TArray<uint8> Raw;
	if (!Handle || !SporeInterop::ReadFileRange(*Handle, static_cast<int64>(Entry.Offset), Entry.CompressedSize, Raw))
	{
		if (OutError) *OutError = TEXT("could not read package");
		return false;
	}

	std::vector<uint8_t> Decoded;
	const sporecore::DbpfError Error = sporecore::DecodeEntry(Entry, Raw.GetData(), Raw.Num(), Decoded);
	if (Error != sporecore::DbpfError::None)
	{
		if (OutError) *OutError = ANSI_TO_TCHAR(sporecore::ToString(Error));
		return false;
	}
	OutBytes.SetNumUninitialized(static_cast<int32>(Decoded.size()));
	FMemory::Memcpy(OutBytes.GetData(), Decoded.data(), Decoded.size());
	return true;
}

bool USporeInteropSubsystem::ExportResource(const FSporeResourceKey& Key, const FString& TargetFile)
{
	TArray<uint8> Bytes;
	FString Error;
	if (!ReadResource(Key, Bytes, &Error))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Export of %s failed: %s"), *Key.ToString(), *Error);
		return false;
	}
	return FFileHelper::SaveArrayToFile(Bytes, *TargetFile);
}

bool USporeInteropSubsystem::DecodeCreationPng(const FString& PngFile, FSporeCreationInfo& OutCreation, float UnitScale) const
{
	OutCreation = FSporeCreationInfo();
	TArray<uint8> Data;
	if (!FFileHelper::LoadFileToArray(Data, *PngFile))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("Cannot read %s"), *PngFile);
		return false;
	}
	sporecore::SporeCreation Creation;
	std::string Error;
	if (!sporecore::DecodeSporeCreation(Data.GetData(), Data.Num(), &SporeInterop::ZlibInflate, Creation, Error))
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("%s: %s"), *PngFile, UTF8_TO_TCHAR(Error.c_str()));
		return false;
	}

	auto ToFString = [](const std::string& Text)
	{
		const FUTF8ToTCHAR Converted(Text.data(), static_cast<int32>(Text.size()));
		return FString(Converted.Length(), Converted.Get());
	};
	OutCreation.Metadata = ToFString(Creation.Metadata);
	OutCreation.ModelXml = ToFString(Creation.ModelXml);
	OutCreation.ModelType = Creation.ModelType;

	for (const sporecore::CreationBlock& Block : Creation.Blocks)
	{
		FSporeCreationPart& Part = OutCreation.Parts.AddDefaulted_GetRef();
		Part.PartKey.Group = Block.Group;
		Part.PartKey.Instance = Block.Instance;
		Part.PartKey.Type = 0x00B1B104; // part descriptions are property lists

		// Mirror Y on both sides of the rotation (S * R * S with S = diag(1,-1,1)).
		const float* R = Block.Rotation;
		const FMatrix Rotation(
			FPlane(R[0], -R[1], R[2], 0.0f),
			FPlane(-R[3], R[4], -R[5], 0.0f),
			FPlane(R[6], -R[7], R[8], 0.0f),
			FPlane(0.0f, 0.0f, 0.0f, 1.0f));
		Part.Transform = FTransform(Rotation.ToQuat(),
			FVector(Block.Position[0], -Block.Position[1], Block.Position[2]) * UnitScale,
			FVector(Block.Scale));
		Part.Children.Append(Block.Children.data(), static_cast<int32>(Block.Children.size()));
		Part.bAsymmetric = Block.bAsymmetric;
		for (const sporecore::CreationPaint& Paint : Block.Paints)
		{
			Part.PaintColors.Emplace(Paint.Color1[0], Paint.Color1[1], Paint.Color1[2], 1.0f);
		}
	}
	return true;
}

FSporePngReport USporeInteropSubsystem::InspectPng(const FString& PngFile) const
{
	FSporePngReport Report;
	TArray<uint8> Data;
	if (!FFileHelper::LoadFileToArray(Data, *PngFile))
	{
		Report.Issues.Add(TEXT("cannot read file"));
		return Report;
	}

	sporecore::PngInfo Info;
	Report.bIsPng = sporecore::ReadPngChunks(Data.GetData(), Data.Num(), &SporeInterop::ZlibInflate, Info);
	Report.Width = static_cast<int32>(Info.Width);
	Report.Height = static_cast<int32>(Info.Height);
	Report.bLooksLikeCreationCard = Info.LooksLikeSporeCard();
	for (const sporecore::PngTextChunk& Chunk : Info.TextChunks)
	{
		const FUTF8ToTCHAR Value(reinterpret_cast<const ANSICHAR*>(Chunk.Value.data()), static_cast<int32>(Chunk.Value.size()));
		Report.TextChunks.Add(UTF8_TO_TCHAR(Chunk.Keyword.c_str()), FString(Value.Length(), Value.Get()));
	}
	for (const std::string& Issue : Info.Issues)
	{
		Report.Issues.Add(UTF8_TO_TCHAR(Issue.c_str()));
	}
	return Report;
}

UTexture2D* USporeInteropSubsystem::CreateNormalMapTexture(const TArray<uint8>& Rgba, int32 Width, int32 Height, float Strength)
{
	if (Width <= 0 || Height <= 0 || Rgba.Num() != Width * Height * 4)
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("CreateNormalMapTexture: expected %d RGBA bytes, got %d"), Width * Height * 4, Rgba.Num());
		return nullptr;
	}

	std::vector<uint8_t> Normal;
	sporecore::GenerateNormalMap(Rgba.GetData(), Width, Height, Strength, Normal);

	UTexture2D* Texture = UTexture2D::CreateTransient(Width, Height, PF_B8G8R8A8);
	if (!Texture)
	{
		return nullptr;
	}
	Texture->SRGB = false;
	Texture->CompressionSettings = TC_Normalmap;

	FTexture2DMipMap& Mip = Texture->GetPlatformData()->Mips[0];
	uint8* Dest = static_cast<uint8*>(Mip.BulkData.Lock(LOCK_READ_WRITE));
	for (int32 Pixel = 0; Pixel < Width * Height; ++Pixel)
	{
		// RGBA -> BGRA
		Dest[Pixel * 4 + 0] = Normal[Pixel * 4 + 2];
		Dest[Pixel * 4 + 1] = Normal[Pixel * 4 + 1];
		Dest[Pixel * 4 + 2] = Normal[Pixel * 4 + 0];
		Dest[Pixel * 4 + 3] = Normal[Pixel * 4 + 3];
	}
	Mip.BulkData.Unlock();
	Texture->UpdateResource();
	return Texture;
}

UMaterialInstanceDynamic* USporeInteropSubsystem::CreateLegacyMaterial(UMaterialInterface* BaseMaterial, UTexture2D* Diffuse, UTexture2D* Normal, bool bIsMechanical)
{
	if (!BaseMaterial || !Diffuse)
	{
		return nullptr;
	}
	UMaterialInstanceDynamic* Material = UMaterialInstanceDynamic::Create(BaseMaterial, this);
	Material->SetTextureParameterValue(TEXT("Diffuse"), Diffuse);
	if (Normal)
	{
		Material->SetTextureParameterValue(TEXT("Normal"), Normal);
	}
	Material->SetScalarParameterValue(TEXT("Roughness"), bIsMechanical ? 0.25f : 0.65f);
	Material->SetScalarParameterValue(TEXT("Metallic"), bIsMechanical ? 1.0f : 0.0f);
	return Material;
}

void USporeInteropSubsystem::OpenPackageBrowser(APlayerController* PlayerController)
{
	if (!PlayerController || !GEngine || !GEngine->GameViewport)
	{
		return;
	}
	ClosePackageBrowser();

	SAssignNew(Browser, SSporePackageBrowser)
		.Subsystem(this)
		.OnCloseRequested_UObject(this, &USporeInteropSubsystem::ClosePackageBrowser);
	BrowserViewportWidget = SNew(SWeakWidget).PossiblyNullContent(Browser);
	GEngine->GameViewport->AddViewportWidgetContent(BrowserViewportWidget.ToSharedRef(), 100);

	BrowserOwner = PlayerController;
	FInputModeUIOnly InputMode;
	InputMode.SetWidgetToFocus(Browser);
	InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
	PlayerController->SetInputMode(InputMode);
	PlayerController->SetShowMouseCursor(true);

	if (Registry.IsEmpty() && !bMounting)
	{
		MountAll();
	}
}

void USporeInteropSubsystem::ClosePackageBrowser()
{
	if (BrowserViewportWidget.IsValid() && GEngine && GEngine->GameViewport)
	{
		GEngine->GameViewport->RemoveViewportWidgetContent(BrowserViewportWidget.ToSharedRef());
	}
	BrowserViewportWidget.Reset();
	Browser.Reset();

	if (APlayerController* PlayerController = BrowserOwner.Get())
	{
		PlayerController->SetInputMode(FInputModeGameOnly());
		PlayerController->SetShowMouseCursor(false);
	}
	BrowserOwner.Reset();
}

// Console commands for testing without Blueprints (type them in the ~ console during Play).
namespace SporeInterop
{

// Shows a status line in the viewport (and the log), so console commands give visible feedback.
void ShowStatus(const FString& Message, bool bProblem = false)
{
	if (bProblem)
	{
		UE_LOG(LogSporeInterop, Warning, TEXT("%s"), *Message);
	}
	else
	{
		UE_LOG(LogSporeInterop, Log, TEXT("%s"), *Message);
	}
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 12.0f, bProblem ? FColor::Orange : FColor::Green, Message);
	}
}

USporeInteropSubsystem* SubsystemFor(UWorld* World)
{
	UGameInstance* GameInstance = World ? World->GetGameInstance() : nullptr;
	return GameInstance ? GameInstance->GetSubsystem<USporeInteropSubsystem>() : nullptr;
}

// Spawns an actor with an empty procedural mesh a few metres in front of the player's view.
UProceduralMeshComponent* SpawnMeshActor(UWorld* World)
{
	FVector Location = FVector::ZeroVector;
	FRotator Rotation = FRotator::ZeroRotator;
	if (APlayerController* Player = World->GetFirstPlayerController())
	{
		FVector ViewLocation;
		FRotator ViewRotation;
		Player->GetPlayerViewPoint(ViewLocation, ViewRotation);
		Location = ViewLocation + ViewRotation.Vector() * 400.0f;
		Rotation = FRotator(0.0f, ViewRotation.Yaw + 180.0f, 0.0f); // face the viewer
	}
	AActor* Actor = World->SpawnActor<AActor>(AActor::StaticClass(), Location, Rotation);
	if (!Actor)
	{
		return nullptr;
	}
	UProceduralMeshComponent* Mesh = NewObject<UProceduralMeshComponent>(Actor, TEXT("SporeMesh"));
	Actor->SetRootComponent(Mesh);
	Mesh->RegisterComponent();
	Mesh->SetWorldLocationAndRotation(Location, Rotation);
	return Mesh;
}

FAutoConsoleCommandWithWorld BrowserCommand(
	TEXT("spore.Browser"),
	TEXT("Opens the Spore package browser (mounts the packages on first use)."),
	FConsoleCommandWithWorldDelegate::CreateLambda([](UWorld* World)
	{
		if (USporeInteropSubsystem* Subsystem = SubsystemFor(World))
		{
			Subsystem->OpenPackageBrowser(World->GetFirstPlayerController());
		}
	}));

FAutoConsoleCommandWithWorld MountCommand(
	TEXT("spore.Mount"),
	TEXT("Reads every package index under InstallRoots and ModsFolder."),
	FConsoleCommandWithWorldDelegate::CreateLambda([](UWorld* World)
	{
		if (USporeInteropSubsystem* Subsystem = SubsystemFor(World))
		{
			ShowStatus(TEXT("Spore: reading package indexes..."));
			Subsystem->MountAll();
		}
		else
		{
			ShowStatus(TEXT("Spore: interop subsystem not available"), true);
		}
	}));

FAutoConsoleCommandWithWorldAndArgs ModelCommand(
	TEXT("spore.Model"),
	TEXT("spore.Model <group>/<name> [scale] - shows an .rw4 model, e.g. spore.Model editor_rigblocks~/ce_grasper_bird_01 (run spore.Mount first)."),
	FConsoleCommandWithWorldAndArgsDelegate::CreateLambda([](const TArray<FString>& Args, UWorld* World)
	{
		USporeInteropSubsystem* Subsystem = SubsystemFor(World);
		if (!Subsystem)
		{
			ShowStatus(TEXT("Spore: interop subsystem not available - press Play first"), true);
			return;
		}
		// Accept "group/name", "group name" or "group!name" (the console may split arguments on
		// any of these), plus an optional trailing number as the scale.
		TArray<FString> Parts;
		for (const FString& Arg : Args)
		{
			TArray<FString> Pieces;
			Arg.ParseIntoArray(Pieces, TEXT("/"), true);
			for (FString& Piece : Pieces)
			{
				TArray<FString> Sub;
				Piece.ParseIntoArray(Sub, TEXT("!"), true);
				Parts.Append(Sub);
			}
		}
		float Scale = 100.0f;
		if (Parts.Num() == 3 && Parts[2].IsNumeric())
		{
			Scale = FCString::Atof(*Parts[2]);
			Parts.SetNum(2);
		}
		if (Parts.Num() != 2)
		{
			ShowStatus(FString::Printf(TEXT("Usage: spore.Model <group>/<name> [scale] - received %d argument(s): '%s'"), Args.Num(), *FString::Join(Args, TEXT("' '"))), true);
			return;
		}
		const FString& Group = Parts[0];
		const FString& Name = Parts[1];
		const FString Label = Group + TEXT("/") + Name;
		FSporeResourceKey Key;
		Key.Group = Subsystem->ResolveFileName(Group);
		Key.Instance = Subsystem->ResolveFileName(Name);
		Key.Type = 0x2F4E681B; // rw4
		if (Subsystem->IsMounting() || Subsystem->GetRegistry().IsEmpty())
		{
			ShowStatus(Subsystem->IsMounting() ? TEXT("Spore: still mounting - try again in a few seconds") : TEXT("Spore: nothing mounted - run spore.Mount first"), true);
			return;
		}
		if (UProceduralMeshComponent* Mesh = SpawnMeshActor(World))
		{
			const int32 Sections = Subsystem->BuildSporeMesh(Key, Mesh, Scale);
			const FBoxSphereBounds Bounds = Mesh->CalcBounds(Mesh->GetComponentTransform());
			ShowStatus(Sections > 0
				? FString::Printf(TEXT("Spore: %s - %d mesh section(s), %.0f cm across, 4 m in front of you"), *Label, Sections, Bounds.SphereRadius * 2.0f)
				: FString::Printf(TEXT("Spore: %s - no mesh built (%s); see Output Log, LogSporeInterop"), *Label, *Key.ToString()), Sections == 0);
		}
	}));

FAutoConsoleCommandWithWorldAndArgs AssembleCommand(
	TEXT("spore.Assemble"),
	TEXT("spore.Assemble <card.png | creation.crt> [scale] [flip] - rebuilds a creation from its parts (run spore.Mount first)."),
	FConsoleCommandWithWorldAndArgsDelegate::CreateLambda([](const TArray<FString>& Args, UWorld* World)
	{
		USporeInteropSubsystem* Subsystem = SubsystemFor(World);
		if (!Subsystem || Args.Num() < 1)
		{
			ShowStatus(Subsystem ? TEXT("Usage: spore.Assemble <card.png | creation.crt> [scale] [flip]") : TEXT("Spore: interop subsystem not available - press Play first"), true);
			return;
		}
		// Console arguments are split on spaces, so a quoted path with spaces arrives in pieces.
		FString Path = Args[0];
		int32 Next = 1;
		if (Path.StartsWith(TEXT("\"")))
		{
			while (!(Path.Len() > 1 && Path.EndsWith(TEXT("\""))) && Next < Args.Num())
			{
				Path += TEXT(" ") + Args[Next++];
			}
			Path.TrimQuotesInline();
		}
		if (Path.StartsWith(TEXT("~/")))
		{
			Path = FPaths::Combine(FPlatformProcess::UserHomeDir(), Path.Mid(2));
		}
		const float Scale = Args.IsValidIndex(Next) ? FCString::Atof(*Args[Next]) : 100.0f;
		const bool bFlip = Args.IsValidIndex(Next + 1) && Args[Next + 1].Equals(TEXT("flip"), ESearchCase::IgnoreCase);
		if (Subsystem->IsMounting() || Subsystem->GetRegistry().IsEmpty())
		{
			ShowStatus(Subsystem->IsMounting() ? TEXT("Spore: still mounting - try again in a few seconds") : TEXT("Spore: nothing mounted - run spore.Mount first"), true);
			return;
		}
		if (UProceduralMeshComponent* Mesh = SpawnMeshActor(World))
		{
			const int32 Parts = Subsystem->AssembleCreationPng(Path, Mesh, Scale, nullptr, bFlip);
			ShowStatus(Parts > 0
				? FString::Printf(TEXT("Spore: assembled %d part(s) from %s, 4 m in front of you"), Parts, *FPaths::GetCleanFilename(Path))
				: FString::Printf(TEXT("Spore: nothing assembled from %s; see Output Log, LogSporeInterop"), *Path), Parts == 0);
		}
	}));

} // namespace SporeInterop
