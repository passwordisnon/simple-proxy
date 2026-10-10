// Spore 2.0 interop layer - in-game browser for mounted Spore packages.

#pragma once

#include "CoreMinimal.h"
#include "SporeInteropSubsystem.h"
#include "Widgets/SCompoundWidget.h"
#include "Widgets/Views/SListView.h"

class ITableRow;
class STableViewBase;
class STextBlock;

enum class ESporeBrowserCategory : uint8
{
	All,
	Properties,
	Textures,
	Models,
	Other,
};

struct FSporeBrowserPackageItem
{
	int32 PackageIndex = INDEX_NONE; // INDEX_NONE = "all packages"
	FString Label;
	int32 EntryCount = 0;
	int32 IssueCount = 0;
	bool bIsMod = false;
	bool bFailed = false;
};

struct FSporeBrowserResourceItem
{
	FSporeResourceKey Key;
	int32 PackageIndex = INDEX_NONE;
	uint32 CompressedSize = 0;
	uint32 MemSize = 0;
	bool bCompressed = false;
	int32 ProviderCount = 0;
};

class SSporePackageBrowser : public SCompoundWidget
{
public:
	SLATE_BEGIN_ARGS(SSporePackageBrowser) {}
		SLATE_ARGUMENT(TWeakObjectPtr<USporeInteropSubsystem>, Subsystem)
		SLATE_EVENT(FSimpleDelegate, OnCloseRequested)
	SLATE_END_ARGS()

	void Construct(const FArguments& InArgs);

	// Rebuilds package and resource lists from the subsystem registry.
	void Refresh();

	virtual bool SupportsKeyboardFocus() const override { return true; }
	virtual FReply OnKeyDown(const FGeometry& MyGeometry, const FKeyEvent& InKeyEvent) override;

private:
	TSharedRef<SWidget> MakeCategoryTab(ESporeBrowserCategory Category, const FText& Label);
	TSharedRef<ITableRow> GeneratePackageRow(TSharedPtr<FSporeBrowserPackageItem> Item, const TSharedRef<STableViewBase>& OwnerTable);
	TSharedRef<ITableRow> GenerateResourceRow(TSharedPtr<FSporeBrowserResourceItem> Item, const TSharedRef<STableViewBase>& OwnerTable);

	void RebuildResourceList();
	bool PassesFilter(const FSporeBrowserResourceItem& Item) const;
	static ESporeBrowserCategory CategoryOf(uint32 TypeId);

	FText GetStatusText() const;
	FText GetDetailsText() const;
	FReply OnRescanClicked();
	FReply OnExportClicked();
	bool CanExport() const;
	void UpdatePropertyPreview();

	TWeakObjectPtr<USporeInteropSubsystem> Subsystem;
	FSimpleDelegate OnCloseRequested;

	ESporeBrowserCategory ActiveCategory = ESporeBrowserCategory::All;
	FString SearchText;
	int32 SelectedPackage = INDEX_NONE;
	TSharedPtr<FSporeBrowserResourceItem> SelectedResource;
	FText LastActionMessage;
	FString PropertyPreview;

	TArray<TSharedPtr<FSporeBrowserPackageItem>> PackageItems;
	TArray<TSharedPtr<FSporeBrowserResourceItem>> AllResources;
	TArray<TSharedPtr<FSporeBrowserResourceItem>> VisibleResources;

	TSharedPtr<SListView<TSharedPtr<FSporeBrowserPackageItem>>> PackageList;
	TSharedPtr<SListView<TSharedPtr<FSporeBrowserResourceItem>>> ResourceList;
};
