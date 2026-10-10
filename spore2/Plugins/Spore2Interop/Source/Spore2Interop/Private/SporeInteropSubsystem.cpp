// Spore 2.0 interop layer - mounts a local Spore install and exposes its resources to UE.

#include "SporeInteropSubsystem.h"

#include "Async/Async.h"
#include "Async/ParallelFor.h"
#include "Engine/Engine.h"
#include "Engine/GameViewportClient.h"
#include "Engine/Texture2D.h"
#include "GameFramework/PlayerController.h"
#include "HAL/FileManager.h"
#include "HAL/PlatformFileManager.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Modules/ModuleManager.h"
#include "SporeCore/SporePng.h"
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
		InstallRoots = {
			TEXT("/Volumes/Macintosh SD/Spore.2008.EA"),
			TEXT("/Volumes/Macintosh SD/Spore.Creepy.&.Cute.Parts.Pack.2008.EA"),
			TEXT("/Volumes/Macintosh SD/Spore.Galactic.Adventures.Expansion.Pack.2009.EA"),
		};
	}
	if (ModsFolder.IsEmpty())
	{
		ModsFolder = FPaths::Combine(FPlatformProcess::UserDir(), TEXT("My Spore Creations"), TEXT("Mods"));
	}

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
			UE_LOG(LogSporeInterop, Warning, TEXT("Spore folder not found: %s"), *Root);
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
		Error = SporeInterop::ReadFileRange(*Handle, Header.IndexOffset, Header.IndexSize, Buffer)
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

	UE_LOG(LogSporeInterop, Log, TEXT("Mounted %d packages (%d failed), %d resources, %d overridden, %d integrity issues"),
		Summary.PackagesMounted, Summary.PackagesFailed, Summary.UniqueResources, Summary.OverriddenResources, Summary.IntegrityIssues);

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
	if (!Handle || !SporeInterop::ReadFileRange(*Handle, Entry.Offset, Entry.CompressedSize, Raw))
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
