import { buildItemTree, itemLabel } from '@/lib/utils/footer-layout';
import { HEADER_UTILITY_ANALYTICS_KEYS } from '@/lib/utils/header/constants';
import type { HeaderConfig, HeaderRowShell, LayoutItem } from '@/types/layout';

export { buildItemTree, itemLabel };

const TAB_TYPES = new Set(['link', 'mini_menu', 'large_page', 'more']);
const UTILITY_TYPES = new Set(['logo', 'search', 'cart', 'profile', 'social', 'divider', 'spacer']);

const NAV_TAB_MIN_ORDER = 10;

export function isUtilityItem(item: LayoutItem): boolean {
  const type = item.item_type || '';

  if (UTILITY_TYPES.has(type)) {
    return true;
  }

  const key = item.extra_metadata?.analytics_key;
  return typeof key === 'string' && HEADER_UTILITY_ANALYTICS_KEYS.has(key);
}

export function isTabItem(item: LayoutItem): boolean {
  const type = item.item_type || '';
  return TAB_TYPES.has(type) && !isUtilityItem(item);
}

function isNavTabByOrder(item: LayoutItem): boolean {
  if (
    item.item_type === 'mini_menu' ||
    item.item_type === 'large_page' ||
    item.item_type === 'more'
  ) {
    return true;
  }

  if (item.item_type === 'link') {
    return (item.stack_order ?? item.sort_order ?? 0) >= NAV_TAB_MIN_ORDER;
  }

  return false;
}

export function shouldUseMultiRowLayout(items: LayoutItem[], config?: HeaderConfig): boolean {
  const roots = buildItemTree(items);
  const hasUtility = roots.some(isUtilityItem);
  const hasTabs = roots.some((item) => isTabItem(item) || isNavTabByOrder(item));

  if (hasUtility && hasTabs) {
    return true;
  }

  return config?.logo_position === 'center' && hasTabs;
}

export function buildHeaderRows(items: LayoutItem[], _config?: HeaderConfig): HeaderRowShell[] {
  const sorted = [...items].sort(
    (a, b) => (a.stack_order ?? a.sort_order ?? 0) - (b.stack_order ?? b.sort_order ?? 0),
  );

  const utilities = sorted.filter(
    (item) => isUtilityItem(item) || (!isTabItem(item) && !isNavTabByOrder(item)),
  );
  const tabs = sorted.filter((item) => isTabItem(item) || isNavTabByOrder(item));

  const utilityRow: HeaderRowShell = {
    row: 0,
    justify: 'space-evenly',
    wrap: false,
    items: utilities,
  };

  const tabRow: HeaderRowShell = {
    row: 1,
    justify: 'space-evenly',
    wrap: false,
    items: tabs,
  };

  if (utilities.length === 0) {
    return [tabRow];
  }

  if (tabs.length === 0) {
    return [utilityRow];
  }

  return [utilityRow, tabRow];
}

export function justifyClass(justify?: string | null): string {
  switch (justify) {
    case 'center':
      return 'justify-center';
    case 'flex-end':
      return 'justify-end';
    case 'space-between':
      return 'justify-between';
    case 'space-around':
      return 'justify-around';
    case 'space-evenly':
    case 'evenly':
      return 'justify-evenly';
    default:
      return 'justify-evenly';
  }
}

export function applyTabOverflow(
  rowItems: LayoutItem[],
  maxTabs: number | undefined,
): { items: LayoutItem[]; overflowTabs: LayoutItem[] } {
  const tabs = rowItems.filter(isTabItem);
  const nonTabs = rowItems.filter((item) => !isTabItem(item));
  const moreItem = tabs.find((item) => item.item_type === 'more');
  const tabItems = tabs.filter((item) => item.item_type !== 'more');
  const limit = maxTabs ?? tabItems.length;
  const inlineTabs = tabItems.slice(0, limit);
  const overflowTabs = tabItems.slice(limit);

  if (moreItem) {
    return { items: [...nonTabs, ...inlineTabs, moreItem], overflowTabs };
  }

  return { items: [...nonTabs, ...inlineTabs, ...overflowTabs], overflowTabs };
}
