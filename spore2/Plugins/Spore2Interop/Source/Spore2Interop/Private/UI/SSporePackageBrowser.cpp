// Spore 2.0 interop layer - in-game browser for mounted Spore packages.

#include "UI/SSporePackageBrowser.h"

#include "Framework/Application/SlateApplication.h"
#include "HAL/FileManager.h"
#include "InputCoreTypes.h"
#include "Misc/Paths.h"
#include "Styling/AppStyle.h"
#include "Styling/CoreStyle.h"
#include "Widgets/Input/SButton.h"
#include "Widgets/Input/SCheckBox.h"
#include "Widgets/Input/SSearchBox.h"
#include "Widgets/Layout/SBorder.h"
#include "Widgets/Layout/SBox.h"
#include "Widgets/Layout/SSplitter.h"
#include "Widgets/SBoxPanel.h"
#include "Widgets/Text/STextBlock.h"
#include "Widgets/Views/SHeaderRow.h"
#include "Widgets/Views/STableRow.h"

#define LOCTEXT_NAMESPACE "SporePackageBrowser"

namespace SporeBrowser
{
const FName ColKey(TEXT("Key"));
const FName ColType(TEXT("Type"));
const FName ColSize(TEXT("Size"));
const FName ColPacked(TEXT("Packed"));
const FName ColSource(TEXT("Source"));

const FLinearColor PanelColor(0.018f, 0.022f, 0.03f, 0.96f);
const FLinearColor HeaderColor(0.03f, 0.045f, 0.06f, 1.0f);
const FLinearColor AccentColor(0.30f, 0.80f, 0.55f, 1.0f);
const FLinearColor ModColor(0.95f, 0.65f, 0.25f, 1.0f);
const FLinearColor ErrorColor(0.95f, 0.35f, 0.30f, 1.0f);
const FLinearColor MutedColor(0.6f, 0.65f, 0.7f, 1.0f);

FString FormatBytes(uint64 Bytes)
{
	if (Bytes >= 1024 * 1024) return FString::Printf(TEXT("%.1f MB"), Bytes / (1024.0 * 1024.0));
	if (Bytes >= 1024) return FString::Printf(TEXT("%.1f KB"), Bytes / 1024.0);
	return FString::Printf(TEXT("%llu B"), Bytes);
}

class SResourceRow : public SMultiColumnTableRow<TSharedPtr<FSporeBrowserResourceItem>>
{
public:
	SLATE_BEGIN_ARGS(SResourceRow) {}
		SLATE_ARGUMENT(TSharedPtr<FSporeBrowserResourceItem>, Item)
		SLATE_ARGUMENT(FString, SourceLabel)
	SLATE_END_ARGS()

	void Construct(const FArguments& InArgs, const TSharedRef<STableViewBase>& OwnerTable)
	{
		Item = InArgs._Item;
		SourceLabel = InArgs._SourceLabel;
		SMultiColumnTableRow::Construct(FSuperRowType::FArguments().Padding(FMargin(4.0f, 2.0f)), OwnerTable);
	}

	virtual TSharedRef<SWidget> GenerateWidgetForColumn(const FName& ColumnName) override
	{
		FText Label;
		FSlateColor Color = FSlateColor::UseForeground();
		if (ColumnName == ColKey)
		{
			Label = FText::FromString(FString::Printf(TEXT("%08X!%08X"), Item->Key.Group, Item->Key.Instance));
		}
		else if (ColumnName == ColType)
		{
			Label = FText::FromString(Item->Key.TypeName());
			Color = AccentColor;
		}
		else if (ColumnName == ColSize)
		{
			Label = FText::FromString(FormatBytes(Item->MemSize));
		}
		else if (ColumnName == ColPacked)
		{
			Label = Item->bCompressed ? LOCTEXT("RefPack", "RefPack") : LOCTEXT("Raw", "raw");
			Color = MutedColor;
		}
		else if (ColumnName == ColSource)
		{
			Label = FText::FromString(Item->ProviderCount > 1 ? FString::Printf(TEXT("%s  (overrides %d)"), *SourceLabel, Item->ProviderCount - 1) : SourceLabel);
			Color = Item->ProviderCount > 1 ? FSlateColor(ModColor) : FSlateColor(MutedColor);
		}

		return SNew(SBox)
			.VAlign(VAlign_Center)
			.Padding(FMargin(6.0f, 3.0f))
			[
				SNew(STextBlock)
				.Text(Label)
				.ColorAndOpacity(Color)
				.Font(FCoreStyle::GetDefaultFontStyle(ColumnName == ColKey ? "Mono" : "Regular", 10))
			];
	}

private:
	TSharedPtr<FSporeBrowserResourceItem> Item;
	FString SourceLabel;
};

} // namespace SporeBrowser

void SSporePackageBrowser::Construct(const FArguments& InArgs)
{
	using namespace SporeBrowser;

	Subsystem = InArgs._Subsystem;
	OnCloseRequested = InArgs._OnCloseRequested;

	ChildSlot
	[
		SNew(SBox)
		.Padding(FMargin(48.0f, 36.0f))
		[
			SNew(SBorder)
			.BorderImage(FAppStyle::GetBrush("WhiteBrush"))
			.BorderBackgroundColor(PanelColor)
			.Padding(0.0f)
			[
				SNew(SVerticalBox)

				// Title bar
				+ SVerticalBox::Slot()
				.AutoHeight()
				[
					SNew(SBorder)
					.BorderImage(FAppStyle::GetBrush("WhiteBrush"))
					.BorderBackgroundColor(HeaderColor)
					.Padding(FMargin(16.0f, 10.0f))
					[
						SNew(SHorizontalBox)
						+ SHorizontalBox::Slot()
						.FillWidth(1.0f)
						.VAlign(VAlign_Center)
						[
							SNew(SVerticalBox)
							+ SVerticalBox::Slot().AutoHeight()
							[
								SNew(STextBlock)
								.Text(LOCTEXT("Title", "Spore Package Browser"))
								.Font(FCoreStyle::GetDefaultFontStyle("Bold", 18))
							]
							+ SVerticalBox::Slot().AutoHeight().Padding(0.0f, 2.0f, 0.0f, 0.0f)
							[
								SNew(STextBlock)
								.Text(this, &SSporePackageBrowser::GetStatusText)
								.ColorAndOpacity(MutedColor)
							]
						]
						+ SHorizontalBox::Slot()
						.AutoWidth()
						.VAlign(VAlign_Center)
						.Padding(8.0f, 0.0f)
						[
							SNew(SButton)
							.ContentPadding(FMargin(14.0f, 6.0f))
							.Text(LOCTEXT("Rescan", "Rescan"))
							.ToolTipText(LOCTEXT("RescanTip", "Re-read every package index from disk"))
							.IsEnabled_Lambda([this]() { return Subsystem.IsValid() && !Subsystem->IsMounting(); })
							.OnClicked(this, &SSporePackageBrowser::OnRescanClicked)
						]
						+ SHorizontalBox::Slot()
						.AutoWidth()
						.VAlign(VAlign_Center)
						[
							SNew(SButton)
							.ContentPadding(FMargin(14.0f, 6.0f))
							.Text(LOCTEXT("Close", "Close"))
							.ToolTipText(LOCTEXT("CloseTip", "Close the browser (Esc)"))
							.OnClicked_Lambda([this]() { OnCloseRequested.ExecuteIfBound(); return FReply::Handled(); })
						]
					]
				]

				// Category tabs + search
				+ SVerticalBox::Slot()
				.AutoHeight()
				.Padding(FMargin(16.0f, 10.0f))
				[
					SNew(SHorizontalBox)
					+ SHorizontalBox::Slot().AutoWidth()[MakeCategoryTab(ESporeBrowserCategory::All, LOCTEXT("TabAll", "All"))]
					+ SHorizontalBox::Slot().AutoWidth()[MakeCategoryTab(ESporeBrowserCategory::Properties, LOCTEXT("TabProps", "Properties"))]
					+ SHorizontalBox::Slot().AutoWidth()[MakeCategoryTab(ESporeBrowserCategory::Textures, LOCTEXT("TabTextures", "Textures"))]
					+ SHorizontalBox::Slot().AutoWidth()[MakeCategoryTab(ESporeBrowserCategory::Models, LOCTEXT("TabModels", "Models"))]
					+ SHorizontalBox::Slot().AutoWidth()[MakeCategoryTab(ESporeBrowserCategory::Other, LOCTEXT("TabOther", "Other"))]
					+ SHorizontalBox::Slot()
					.FillWidth(1.0f)
					.Padding(16.0f, 0.0f, 0.0f, 0.0f)
					[
						SNew(SSearchBox)
						.HintText(LOCTEXT("SearchHint", "Filter by group, instance or type (hex)"))
						.OnTextChanged_Lambda([this](const FText& Text)
						{
							SearchText = Text.ToString().TrimStartAndEnd();
							RebuildResourceList();
						})
					]
				]

				// Packages | resources
				+ SVerticalBox::Slot()
				.FillHeight(1.0f)
				.Padding(FMargin(16.0f, 0.0f))
				[
					SNew(SSplitter)
					+ SSplitter::Slot()
					.Value(0.28f)
					[
						SAssignNew(PackageList, SListView<TSharedPtr<FSporeBrowserPackageItem>>)
						.ListItemsSource(&PackageItems)
						.SelectionMode(ESelectionMode::Single)
						.OnGenerateRow(this, &SSporePackageBrowser::GeneratePackageRow)
						.OnSelectionChanged_Lambda([this](TSharedPtr<FSporeBrowserPackageItem> Item, ESelectInfo::Type)
						{
							SelectedPackage = Item.IsValid() ? Item->PackageIndex : INDEX_NONE;
							RebuildResourceList();
						})
					]
					+ SSplitter::Slot()
					.Value(0.72f)
					[
						SAssignNew(ResourceList, SListView<TSharedPtr<FSporeBrowserResourceItem>>)
						.ListItemsSource(&VisibleResources)
						.SelectionMode(ESelectionMode::Single)
						.OnGenerateRow(this, &SSporePackageBrowser::GenerateResourceRow)
						.OnSelectionChanged_Lambda([this](TSharedPtr<FSporeBrowserResourceItem> Item, ESelectInfo::Type)
						{
							SelectedResource = Item;
							LastActionMessage = FText::GetEmpty();
							UpdatePropertyPreview();
						})
						.HeaderRow
						(
							SNew(SHeaderRow)
							+ SHeaderRow::Column(ColKey).DefaultLabel(LOCTEXT("ColKey", "Group ! Instance")).FillWidth(0.30f)
							+ SHeaderRow::Column(ColType).DefaultLabel(LOCTEXT("ColType", "Type")).FillWidth(0.14f)
							+ SHeaderRow::Column(ColSize).DefaultLabel(LOCTEXT("ColSize", "Size")).FillWidth(0.12f)
							+ SHeaderRow::Column(ColPacked).DefaultLabel(LOCTEXT("ColPacked", "Storage")).FillWidth(0.10f)
							+ SHeaderRow::Column(ColSource).DefaultLabel(LOCTEXT("ColSource", "Provided by")).FillWidth(0.34f)
						)
					]
				]

				// Details + actions
				+ SVerticalBox::Slot()
				.AutoHeight()
				[
					SNew(SBorder)
					.BorderImage(FAppStyle::GetBrush("WhiteBrush"))
					.BorderBackgroundColor(HeaderColor)
					.Padding(FMargin(16.0f, 10.0f))
					[
						SNew(SHorizontalBox)
						+ SHorizontalBox::Slot()
						.FillWidth(1.0f)
						.VAlign(VAlign_Center)
						[
							SNew(STextBlock)
							.Text(this, &SSporePackageBrowser::GetDetailsText)
							.AutoWrapText(true)
						]
						+ SHorizontalBox::Slot()
						.AutoWidth()
						.VAlign(VAlign_Center)
						[
							SNew(SButton)
							.ContentPadding(FMargin(14.0f, 6.0f))
							.Text(LOCTEXT("Export", "Export selected"))
							.ToolTipText(LOCTEXT("ExportTip", "Decompress the selected resource into Saved/SporeExport"))
							.IsEnabled(this, &SSporePackageBrowser::CanExport)
							.OnClicked(this, &SSporePackageBrowser::OnExportClicked)
						]
					]
				]
			]
		]
	];

	Refresh();
}

TSharedRef<SWidget> SSporePackageBrowser::MakeCategoryTab(ESporeBrowserCategory Category, const FText& Label)
{
	return SNew(SBox)
		.Padding(FMargin(0.0f, 0.0f, 4.0f, 0.0f))
		[
			SNew(SCheckBox)
			.Style(FAppStyle::Get(), "ToggleButtonCheckbox")
			.IsChecked_Lambda([this, Category]() { return ActiveCategory == Category ? ECheckBoxState::Checked : ECheckBoxState::Unchecked; })
			.OnCheckStateChanged_Lambda([this, Category](ECheckBoxState)
			{
				ActiveCategory = Category;
				RebuildResourceList();
			})
			[
				SNew(SBox)
				.Padding(FMargin(14.0f, 5.0f))
				[
					SNew(STextBlock).Text(Label)
				]
			]
		];
}

void SSporePackageBrowser::Refresh()
{
	PackageItems.Reset();
	AllResources.Reset();
	SelectedResource.Reset();

	USporeInteropSubsystem* Owner = Subsystem.Get();
	if (Owner)
	{
		const TArray<TSharedPtr<FSporeMountedPackage>>& Packages = Owner->GetPackages();

		TSharedPtr<FSporeBrowserPackageItem> AllItem = MakeShared<FSporeBrowserPackageItem>();
		AllItem->Label = TEXT("All packages");
		AllItem->EntryCount = Owner->GetRegistry().Num();
		PackageItems.Add(AllItem);

		for (int32 Index = 0; Index < Packages.Num(); ++Index)
		{
			const FSporeMountedPackage& Package = *Packages[Index];
			TSharedPtr<FSporeBrowserPackageItem> Item = MakeShared<FSporeBrowserPackageItem>();
			Item->PackageIndex = Index;
			Item->Label = FPaths::GetCleanFilename(Package.Path);
			Item->EntryCount = Package.Entries.Num();
			Item->IssueCount = Package.Issues.Num();
			Item->bIsMod = Package.bIsMod;
			Item->bFailed = !Package.Error.IsEmpty();
			PackageItems.Add(Item);
		}

		AllResources.Reserve(Owner->GetRegistry().Num());
		for (const TPair<FSporeResourceKey, FSporeResourceRef>& Pair : Owner->GetRegistry())
		{
			const sporecore::IndexEntry& Entry = Packages[Pair.Value.PackageIndex]->Entries[Pair.Value.EntryIndex];
			TSharedPtr<FSporeBrowserResourceItem> Item = MakeShared<FSporeBrowserResourceItem>();
			Item->Key = Pair.Key;
			Item->PackageIndex = Pair.Value.PackageIndex;
			Item->CompressedSize = Entry.CompressedSize;
			Item->MemSize = Entry.MemSize;
			Item->bCompressed = Entry.bCompressed;
			Item->ProviderCount = Pair.Value.ProviderCount;
			AllResources.Add(Item);
		}
		AllResources.Sort([](const TSharedPtr<FSporeBrowserResourceItem>& A, const TSharedPtr<FSporeBrowserResourceItem>& B)
		{
			if (A->Key.Type != B->Key.Type) return A->Key.Type < B->Key.Type;
			if (A->Key.Group != B->Key.Group) return A->Key.Group < B->Key.Group;
			return A->Key.Instance < B->Key.Instance;
		});
	}

	if (PackageList.IsValid())
	{
		PackageList->RequestListRefresh();
	}
	RebuildResourceList();
}

ESporeBrowserCategory SSporePackageBrowser::CategoryOf(uint32 TypeId)
{
	switch (TypeId)
	{
	case 0x00B1B104: return ESporeBrowserCategory::Properties;
	case 0x2F7D0004:
	case 0x2F4E681C: return ESporeBrowserCategory::Textures;
	case 0x2F4E681B: return ESporeBrowserCategory::Models;
	default: return ESporeBrowserCategory::Other;
	}
}

bool SSporePackageBrowser::PassesFilter(const FSporeBrowserResourceItem& Item) const
{
	if (SelectedPackage != INDEX_NONE && Item.PackageIndex != SelectedPackage)
	{
		return false;
	}
	if (ActiveCategory != ESporeBrowserCategory::All && CategoryOf(Item.Key.Type) != ActiveCategory)
	{
		return false;
	}
	return SearchText.IsEmpty() || Item.Key.ToString().Contains(SearchText, ESearchCase::IgnoreCase);
}

void SSporePackageBrowser::RebuildResourceList()
{
	VisibleResources.Reset();
	for (const TSharedPtr<FSporeBrowserResourceItem>& Item : AllResources)
	{
		if (PassesFilter(*Item))
		{
			VisibleResources.Add(Item);
		}
	}
	if (SelectedResource.IsValid() && !VisibleResources.Contains(SelectedResource))
	{
		SelectedResource.Reset();
	}
	if (ResourceList.IsValid())
	{
		ResourceList->RequestListRefresh();
	}
}

TSharedRef<ITableRow> SSporePackageBrowser::GeneratePackageRow(TSharedPtr<FSporeBrowserPackageItem> Item, const TSharedRef<STableViewBase>& OwnerTable)
{
	using namespace SporeBrowser;

	FText Badge;
	FSlateColor BadgeColor = MutedColor;
	if (Item->bFailed)
	{
		Badge = LOCTEXT("BadgeFailed", "unreadable");
		BadgeColor = ErrorColor;
	}
	else if (Item->bIsMod)
	{
		Badge = LOCTEXT("BadgeMod", "MOD");
		BadgeColor = ModColor;
	}

	FString Subtitle = FString::Printf(TEXT("%d entries"), Item->EntryCount);
	if (Item->IssueCount > 0)
	{
		Subtitle += FString::Printf(TEXT(" · %d integrity issues"), Item->IssueCount);
	}

	return SNew(STableRow<TSharedPtr<FSporeBrowserPackageItem>>, OwnerTable)
		.Padding(FMargin(8.0f, 5.0f))
		[
			SNew(SHorizontalBox)
			+ SHorizontalBox::Slot()
			.FillWidth(1.0f)
			[
				SNew(SVerticalBox)
				+ SVerticalBox::Slot().AutoHeight()
				[
					SNew(STextBlock)
					.Text(FText::FromString(Item->Label))
					.Font(FCoreStyle::GetDefaultFontStyle(Item->PackageIndex == INDEX_NONE ? "Bold" : "Regular", 11))
				]
				+ SVerticalBox::Slot().AutoHeight()
				[
					SNew(STextBlock)
					.Text(FText::FromString(Subtitle))
					.ColorAndOpacity(Item->IssueCount > 0 ? FSlateColor(ModColor) : FSlateColor(MutedColor))
					.Font(FCoreStyle::GetDefaultFontStyle("Regular", 9))
				]
			]
			+ SHorizontalBox::Slot()
			.AutoWidth()
			.VAlign(VAlign_Center)
			[
				SNew(STextBlock)
				.Text(Badge)
				.ColorAndOpacity(BadgeColor)
				.Font(FCoreStyle::GetDefaultFontStyle("Bold", 9))
			]
		];
}

TSharedRef<ITableRow> SSporePackageBrowser::GenerateResourceRow(TSharedPtr<FSporeBrowserResourceItem> Item, const TSharedRef<STableViewBase>& OwnerTable)
{
	FString Source;
	if (USporeInteropSubsystem* Owner = Subsystem.Get())
	{
		if (Owner->GetPackages().IsValidIndex(Item->PackageIndex))
		{
			Source = FPaths::GetCleanFilename(Owner->GetPackages()[Item->PackageIndex]->Path);
		}
	}
	return SNew(SporeBrowser::SResourceRow, OwnerTable).Item(Item).SourceLabel(Source);
}

FText SSporePackageBrowser::GetStatusText() const
{
	const USporeInteropSubsystem* Owner = Subsystem.Get();
	if (!Owner)
	{
		return LOCTEXT("NoSubsystem", "Interop subsystem unavailable");
	}
	if (Owner->IsMounting())
	{
		return LOCTEXT("Mounting", "Reading package indexes...");
	}
	const FSporeMountSummary Summary = Owner->GetMountSummary();
	if (Summary.PackagesMounted == 0 && Summary.PackagesFailed == 0)
	{
		return LOCTEXT("NothingMounted", "No packages found. Check InstallRoots / ModsFolder in DefaultGame.ini.");
	}
	return FText::Format(LOCTEXT("StatusFmt", "{0} packages · {1} resources · {2} overridden by later packages · {3} unreadable · showing {4}"),
		Summary.PackagesMounted, Summary.UniqueResources, Summary.OverriddenResources, Summary.PackagesFailed, VisibleResources.Num());
}

FText SSporePackageBrowser::GetDetailsText() const
{
	if (!LastActionMessage.IsEmpty())
	{
		return LastActionMessage;
	}
	if (!SelectedResource.IsValid())
	{
		return LOCTEXT("NoSelection", "Select a resource to see its details.");
	}
	const FSporeBrowserResourceItem& Item = *SelectedResource;
	return FText::FromString(FString::Printf(TEXT("%s   ·   %s on disk, %s decoded   ·   %s"),
		*Item.Key.ToString(),
		*SporeBrowser::FormatBytes(Item.CompressedSize),
		*SporeBrowser::FormatBytes(Item.MemSize),
		Item.ProviderCount > 1 ? *FString::Printf(TEXT("%d packages define this key; the last mounted one wins"), Item.ProviderCount) : TEXT("single provider")) + PropertyPreview);
}

void SSporePackageBrowser::UpdatePropertyPreview()
{
	PropertyPreview.Reset();
	USporeInteropSubsystem* Owner = Subsystem.Get();
	if (!Owner || !SelectedResource.IsValid())
	{
		return;
	}
	const uint32 Type = SelectedResource->Key.Type;
	if (Type == 0x2F4E681C || Type == 0x2F4E681B) // raster, rw4
	{
		PropertyPreview = TEXT("\n") + Owner->DescribeRw4(SelectedResource->Key);
		return;
	}
	if (CategoryOf(Type) != ESporeBrowserCategory::Properties)
	{
		return;
	}

	TArray<FSporeProperty> Properties;
	FString Error;
	const bool bOk = Owner->ReadProperties(SelectedResource->Key, Properties, &Error);
	constexpr int32 MaxLines = 8;
	for (int32 Index = 0; Index < Properties.Num() && Index < MaxLines; ++Index)
	{
		PropertyPreview += FString::Printf(TEXT("\n%s  (%s)  =  %s"), *Properties[Index].Name, *Properties[Index].Type, *Properties[Index].Value);
	}
	if (Properties.Num() > MaxLines)
	{
		PropertyPreview += FString::Printf(TEXT("\n... %d more properties (export to see all)"), Properties.Num() - MaxLines);
	}
	if (!bOk)
	{
		PropertyPreview += FString::Printf(TEXT("\nCould not fully decode: %s"), *Error);
	}
}

FReply SSporePackageBrowser::OnRescanClicked()
{
	if (USporeInteropSubsystem* Owner = Subsystem.Get())
	{
		Owner->MountAll();
	}
	return FReply::Handled();
}

bool SSporePackageBrowser::CanExport() const
{
	return SelectedResource.IsValid() && Subsystem.IsValid() && !Subsystem->IsMounting();
}

FReply SSporePackageBrowser::OnExportClicked()
{
	USporeInteropSubsystem* Owner = Subsystem.Get();
	if (!Owner || !SelectedResource.IsValid())
	{
		return FReply::Handled();
	}
	const FString FileName = SelectedResource->Key.ToString().Replace(TEXT("!"), TEXT("_"));
	const FString Target = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("SporeExport"), FileName);
	LastActionMessage = Owner->ExportResource(SelectedResource->Key, Target)
		? FText::Format(LOCTEXT("Exported", "Exported to {0}"), FText::FromString(FPaths::ConvertRelativePathToFull(Target)))
		: LOCTEXT("ExportFailed", "Export failed - see the output log (LogSporeInterop).");
	return FReply::Handled();
}

FReply SSporePackageBrowser::OnKeyDown(const FGeometry& MyGeometry, const FKeyEvent& InKeyEvent)
{
	if (InKeyEvent.GetKey() == EKeys::Escape)
	{
		OnCloseRequested.ExecuteIfBound();
		return FReply::Handled();
	}
	return SCompoundWidget::OnKeyDown(MyGeometry, InKeyEvent);
}

#undef LOCTEXT_NAMESPACE
