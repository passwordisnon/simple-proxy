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
class UProceduralMeshComponent;
struct FSporeTextureData;

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

USTRUCT(BlueprintType)
struct SPORE2INTEROP_API FSporeProperty
{
	GENERATED_BODY()

	// Registry name when NameRegistryFolder is set, otherwise the hex id.
	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	FString Name;

	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	FString Type;

	// Human readable value, e.g. "0.75" or "{1, 2, 3}".
	UPROPERTY(BlueprintReadOnly, Category = "Spore")
	FString Value;
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

	// Optional SporeModder-FX folder; its reg_property.txt / reg_type.txt give hashes readable names.
	UPROPERTY(Config, EditAnywhere, BlueprintReadWrite, Category = "Spore|Mount")
	FString NameRegistryFolder;

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

	// Decodes a .prop resource. Returns false (with OutError) when it is not a readable property list.
	bool ReadProperties(const FSporeResourceKey& Key, TArray<FSporeProperty>& OutProperties, FString* OutError = nullptr) const;

	UFUNCTION(BlueprintCallable, Category = "Spore|Resources", meta = (DisplayName = "Read Properties"))
	bool K2_ReadProperties(const FSporeResourceKey& Key, TArray<FSporeProperty>& OutProperties) const { return ReadProperties(Key, OutProperties); }

	// Loads a .raster resource, or the Nth texture inside an .rw4, as a transient texture.
	// DXT1/3/5 and A8R8G8B8 upload without conversion; other formats are decoded first.
	// Only the top mip is uploaded for now. Cube maps are not supported yet (returns null).
	UFUNCTION(BlueprintCallable, Category = "Spore|Textures")
	UTexture2D* LoadSporeTexture(const FSporeResourceKey& Key, int32 TextureIndex = 0);

	// Builds every mesh of an .rw4 model into Target, one section per mesh. Converts from
	// Spore's right-handed space to UE's left-handed space (Y mirrored, winding flipped) and
	// scales by UnitScale (Spore units -> cm; 100 assumes Spore units are metres). Returns
	// the number of sections created. Skinned meshes are built in their bind pose.
	// With BaseMaterial set, sections whose diffuse texture is inside the same .rw4 get a
	// material instance from CreateLegacyMaterial (textures named by override are external
	// and are not resolved yet).
	UFUNCTION(BlueprintCallable, Category = "Spore|Models")
	int32 BuildSporeMesh(const FSporeResourceKey& Key, UProceduralMeshComponent* Target, float UnitScale = 100.0f, UMaterialInterface* BaseMaterial = nullptr);

	// Summary of a .raster/.rw4: texture formats and sizes, mesh and triangle counts.
	FString DescribeRw4(const FSporeResourceKey& Key) const;

	// One-line summary such as "DXT5 512x512, 10 mips" (or the reason it cannot be read).
	FString DescribeSporeTexture(const FSporeResourceKey& Key) const;

	// Decodes the same texture to RGBA8 pixels (e.g. to feed CreateNormalMapTexture).
	UFUNCTION(BlueprintCallable, Category = "Spore|Textures")
	bool DecodeSporeTexturePixels(const FSporeResourceKey& Key, int32 TextureIndex, TArray<uint8>& OutRgba, int32& OutWidth, int32& OutHeight);

	// Registry name for a type id, or empty.
	FString LookupTypeName(uint32 TypeId) const;

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

	void LoadNameRegistries();
	bool ReadSporeTexture(const FSporeResourceKey& Key, int32 TextureIndex, FSporeTextureData& Out) const;

	TMap<uint32, FString> PropertyNames;
	TMap<uint32, FString> FileNames;
	TMap<uint32, FString> TypeNames;

	TArray<TSharedPtr<FSporeMountedPackage>> Packages;
	TMap<FSporeResourceKey, FSporeResourceRef> Registry;
	FSporeMountSummary Summary;
	bool bMounting = false;
	uint32 MountGeneration = 0;

	TSharedPtr<SSporePackageBrowser> Browser;
	TSharedPtr<SWidget> BrowserViewportWidget;
	TWeakObjectPtr<APlayerController> BrowserOwner;
};
