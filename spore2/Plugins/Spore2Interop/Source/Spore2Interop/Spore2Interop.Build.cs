using System.IO;
using UnrealBuildTool;

public class Spore2Interop : ModuleRules
{
	public Spore2Interop(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		CppStandard = CppStandardVersion.Cpp20;

		PrivateIncludePaths.Add(Path.Combine(ModuleDirectory, "Private"));

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"Slate",
			"SlateCore",
			"InputCore",
			"ProceduralMeshComponent",
		});

		// zTXt / iTXt chunks in creation PNGs are zlib streams of unknown length.
		AddEngineThirdPartyPrivateStaticDependencies(Target, "zlib");
	}
}
