import {
  DrawerBannerList,
  DrawerCategoryGrid2Banner,
  DrawerCategoryGrid3,
  DrawerPriceRangeList,
  DrawerViewAllLink,
} from '@/components/layout/drawer/DrawerLayouts';
import type { DrawerCategoryItem, DrawerMenuCategory, DrawerPriceRange } from '@/types/drawer-menu';

interface DrawerContentAreaProps {
  activeCategory: string | null;
  categories: DrawerMenuCategory[];
  priceRanges?: DrawerPriceRange[];
  onItemPress: (item: DrawerCategoryItem) => void;
  onViewAllPress: (handle: string) => void;
  onPriceRangeChange?: (handle: string, label: string) => void;
}

export function DrawerContentArea({
  activeCategory,
  categories,
  priceRanges = [],
  onItemPress,
  onViewAllPress,
  onPriceRangeChange,
}: DrawerContentAreaProps) {
  const activeCategoryData = categories.find((category) => category.id === activeCategory);

  if (!activeCategoryData) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#F4F4F4]">
        <p className="text-sm text-[#9CA3AF]">Select a category</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeCategoryData.layoutType) {
      case 'grid-3':
        return (
          <DrawerCategoryGrid3
            items={activeCategoryData.items}
            categoryId={activeCategoryData.id}
            onItemPress={onItemPress}
          />
        );
      case 'grid-2-banner':
        return (
          <DrawerCategoryGrid2Banner
            items={activeCategoryData.items}
            categoryId={activeCategoryData.id}
            onItemPress={onItemPress}
          />
        );
      case 'banner-list':
        return <DrawerBannerList items={activeCategoryData.items} onItemPress={onItemPress} />;
      case 'price-range':
        return (
          <DrawerPriceRangeList
            priceRanges={priceRanges}
            onPriceRangeChange={onPriceRangeChange ?? (() => undefined)}
          />
        );
      default:
        return (
          <DrawerCategoryGrid3
            items={activeCategoryData.items}
            categoryId={activeCategoryData.id}
            onItemPress={onItemPress}
          />
        );
    }
  };

  return (
    <div className="min-h-0 flex-1 bg-[#F4F4F4]">
      <div className="h-full overflow-y-auto pb-2">
        {renderContent()}
        {activeCategoryData.hasViewAll && activeCategoryData.viewAllHandle ? (
          <DrawerViewAllLink handle={activeCategoryData.viewAllHandle} onPress={onViewAllPress} />
        ) : null}
      </div>
    </div>
  );
}
