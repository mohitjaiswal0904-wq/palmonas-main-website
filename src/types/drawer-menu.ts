export type DrawerHomeType = 'demifine' | 'gold' | 'silver';

export type DrawerLayoutType = 'grid-3' | 'grid-2-banner' | 'banner-list' | 'price-range';

export interface DrawerCategoryItem {
  id: string;
  label: string;
  imageUrl: string;
  handle?: string;
  type?: 'handle' | 'screen';
  isFullWidth?: boolean;
}

export interface DrawerMenuCategoryLabelBadge {
  text: string;
}

export interface DrawerMenuCategory {
  id: string;
  label: string;
  items: DrawerCategoryItem[];
  layoutType: DrawerLayoutType;
  hasViewAll?: boolean;
  viewAllHandle?: string;
  hiddenInSidebar?: boolean;
  labelBadge?: DrawerMenuCategoryLabelBadge;
}

export interface DrawerPriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
  isSelected?: boolean;
  imageUrl?: string;
  handle?: string;
  isFullWidth?: boolean;
}

export interface DrawerBottomItem {
  id: string;
  label: string;
  hasExternalIcon?: boolean;
  handle?: string;
}

export interface DrawerTab {
  id: DrawerHomeType;
  /** Short label shown inside the segmented control. */
  label: string;
  ariaLabel: string;
}

export interface DrawerMenuForHomeType {
  categories: DrawerMenuCategory[];
  bottomItems: DrawerBottomItem[];
}

export interface DrawerSidebarProps {
  open: boolean;
  onClose: () => void;
}
