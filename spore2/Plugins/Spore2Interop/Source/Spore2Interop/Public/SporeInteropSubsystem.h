// Spore 2.0 interop layer - mounts a local Spore install and exposes its resources to UE.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SporeCore/SporeDbpf.h"
#include "SporeInteropSubsystem.generated.h"

class APlayerController;
class SSporePackageBrowser;
class SWidget;
class UMaterialInstanceDynamic;
class UMaterialInterface;
class UTexture2D;

DECLARE_LOG_CATEGORY_EXTERN(LogSporeInterop, Log, All);

UENUM(BlueprintType)
enum class ESporeEvolutionPhase : uint8
{
	Molecular,
	Cell,
	Aquatic,
	Creature,
	Tribal,
	Medieval,
	Civilization,
	Advanced,
	Space,
};

// Which workspace to open, chosen from a "-state:<Name>" launch argument.
// These names match states found in the original executable; only the UI
// routing is provided here, the original editors' content is not recovered.
UENUM(BlueprintType)
enum class ESporeLaunchState : uint8
{
	None,
	PackageBrowser,
	CellEditor,
	CakeEditor,
	PlannerThumbnailGen,
	Unknown,
};

USTRUCT(BlueprintType)
struct SPORE2INTEROP_API FSporeResourceKey
{
	GENERATED_BODY()

	UPROPERTY(VisibleAnywhere, Category = "Spore")
	uint32 Instance = 0;

	UPROPERTY(VisibleAnywhere, Category = "Spore")
	uint32 Type = 0;

	UPROPERTY(VisibleAnywhere, Category = "Spore")
	uint32 Group = 0;

	FSporeResourceKey() = default;
	explicit FSporeResourceKey(const sporecore::ResourceKey& Key) : Instance(Key.Instance), Type(Key.Type), Group(Key.Group) {}

	bool operator==(const FSporeResourceKey& Other) const { return Instance == Other.Instance && Type == Other.Type && Group == Other.Group; }
	friend uint32 GetTypeHash(const FSporeResourceKey& Key) { return HashCombine(HashCombine(Key.Instance, Key.Type), Key.Group); }

	// SporeModder-FX style "group!instance.type".
	FString ToString() const;
	FString TypeName() const;
};

USTRUCT(BlueprintType)
struct SPORE2INTEROP_API FSporeMountSummary
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 PackagesMounted = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 PackagesFailed = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 UniqueResources = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 OverriddenResources = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 IntegrityIssues = 0;
};

USTRUCT(BlueprintType)
struct SPORE2INTEROP_API FSporePngReport
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	bool bIsPng = false;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	bool bLooksLikeCreationCard = false;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 Width = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	int32 Height = 0;

	// keyword -> text value (inflated for zTXt / compressed iTXt)
	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	TMap<FString, FString> TextChunks;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	TArray<FString> Issues;
};

// One mounted .package and its parsed index. Owned by the subsystem.
struct FSporeMountedPackage
{
	FString Path;
	bool bIsMod = false;
	FString Error;
	uint64 FileSize = 0;
	TArray<sporecore::IndexEntry> Entries;
	TArray<FString> Issues;
};

// Which package/entry currently provides a key (last mounted wins, mods mount last).
struct FSporeResourceRef
{
	int32 PackageIndex = INDEX_NONE;
	int32 EntryIndex = INDEX_NONE;
	int32 ProviderCount = 0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSporeMountFinished, const FSporeMountSummary&, Summary);

UCLASS(Config = Game)
class SPORE2INTEROP_API USporeInteropSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	// Install roots scanned recursively for *.package, in mount order.
	// Defaults to the three folders of the original setup; override in DefaultGame.ini.
	UPROPERTY(Config, EditAnywhere, BlueprintReadWrite, Category = "Spore|Mount")
	TArray<FString> InstallRoots;

	// Spore's user mod folder; mounted after the install roots so mods override.
	UPROPERTY(Config, EditAnywhere, BlueprintReadWrite, Category = "Spore|Mount")
	FString ModsFolder;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	ESporeEvolutionPhase ActivePhase = ESporeEvolutionPhase::Molecular;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	ESporeLaunchState LaunchState = ESporeLaunchState::None;

	UPROPERTY(BlueprintAssignable, Category = "Spore|Mount")
	FOnSporeMountFinished OnMountFinished;

	// Parses every package index on the thread pool, then swaps the registry on the game thread.
	UFUNCTION(BlueprintCallable, Category = "Spore|Mount")
	void MountAll();

	UFUNCTION(BlueprintPure, Category = "Spore|Mount")
	bool IsMounting() const { return bMounting; }

	UFUNCTION(BlueprintPure, Category = "Spore|Mount")
	FSporeMountSummary GetMountSummary() const { return Summary; }

	// Reads and decompresses one resource from whichever package currently provides it.
	bool ReadResource(const FSporeResourceKey& Key, TArray<uint8>& OutBytes, FString* OutError = nullptr) const;

	UFUNCTION(BlueprintCallable, Category = "Spore|Resources")
	bool ExportResource(const FSporeResourceKey& Key, const FString& TargetFile);

	UFUNCTION(BlueprintCallable, Category = "Spore|Resources")
	FSporePngReport InspectPng(const FString& PngFile) const;

	// Builds a transient normal map from RGBA8 pixels (Scharr gradient over luminance).
	UFUNCTION(BlueprintCallable, Category = "Spore|Textures")
	UTexture2D* CreateNormalMapTexture(const TArray<uint8>& Rgba, int32 Width, int32 Height, float Strength = 2.0f);

	// Wraps a legacy diffuse in a material instance. BaseMaterial must expose the texture
	// parameters "Diffuse" and "Normal" and the scalars "Roughness" and "Metallic".
	UFUNCTION(BlueprintCallable, Category = "Spore|Textures")
	UMaterialInstanceDynamic* CreateLegacyMaterial(UMaterialInterface* BaseMaterial, UTexture2D* Diffuse, UTexture2D* Normal, bool bIsMechanical);

	UFUNCTION(BlueprintCallable, Category = "Spore|UI")
	void OpenPackageBrowser(APlayerController* PlayerController);

	UFUNCTION(BlueprintCallable, Category = "Spore|UI")
	void ClosePackageBrowser();

	static ESporeLaunchState ParseLaunchState(const FString& CommandLine);

	// Read-only views for the Slate browser (game thread only).
	const TArray<TSharedPtr<FSporeMountedPackage>>& GetPackages() const { return Packages; }
	const TMap<FSporeResourceKey, FSporeResourceRef>& GetRegistry() const { return Registry; }

private:
	void FinishMount(uint32 Generation, TArray<TSharedPtr<FSporeMountedPackage>> NewPackages);
	static TSharedPtr<FSporeMountedPackage> ParsePackage(const FString& Path, bool bIsMod);

	TArray<TSharedPtr<FSporeMountedPackage>> Packages;
	TMap<FSporeResourceKey, FSporeResourceRef> Registry;
	FSporeMountSummary Summary;
	bool bMounting = false;
	uint32 MountGeneration = 0;

	TSharedPtr<SSporePackageBrowser> Browser;
	TSharedPtr<SWidget> BrowserViewportWidget;
	TWeakObjectPtr<APlayerController> BrowserOwner;
};
