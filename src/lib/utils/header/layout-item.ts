import { canonicalizeAppPath } from '@/lib/navigation/canonical-app-path';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { LayoutItem } from '@/types/layout';

function canonicalizeLayoutPath(path: string): string {
  return path.startsWith('http') ? path : canonicalizeAppPath(path);
}

export function headerItemLabel(item: LayoutItem): string {
  const label = item.label ?? item.title ?? item.name ?? '';

  if (label.trim().length > 0) {
    return label;
  }

  switch (item.icon_key) {
    case 'search':
      return 'Search';
    case 'cart':
      return 'Cart';
    case 'profile':
      return 'Account';
    case 'wishlist':
      return 'Wishlist';
    case 'logo':
      return 'Palmonas';
    default:
      return '';
  }
}

export function resolveLayoutItemHref(item: LayoutItem): string | null {
  const actionType = item.action_type;
  const actionValue = item.action_value;

  if (actionValue == null || actionValue === '') {
    return null;
  }

  switch (actionType) {
    case 'collection':
      return resolveCollectionPagePath(actionValue);
    case 'product':
      return `/products/${actionValue}`;
    case 'navigate':
    case 'redirect': {
      const path = actionValue.startsWith('/') ? actionValue : `/${actionValue}`;
      const resolved = path.startsWith('/collections/') ? resolveCollectionPagePath(path) : path;

      return canonicalizeLayoutPath(resolved);
    }
    case 'external':
      return actionValue;
    case 'open':
      return null;
    default:
      if (actionValue.startsWith('/') || actionValue.startsWith('http')) {
        const resolved = actionValue.startsWith('/collections/')
          ? resolveCollectionPagePath(actionValue)
          : actionValue;

        return canonicalizeLayoutPath(resolved);
      }

      return null;
  }
}

export function normalizeLayoutItem(item: LayoutItem): LayoutItem {
  return {
    ...item,
    label: item.label ?? undefined,
    title: item.title ?? undefined,
    name: item.name ?? undefined,
    stack_order: item.stack_order ?? item.sort_order,
    extra_metadata:
      item.extra_metadata && typeof item.extra_metadata === 'object'
        ? item.extra_metadata
        : undefined,
    children: item.children?.map(normalizeLayoutItem),
  };
}

export function normalizeLayoutItems(items: LayoutItem[]): LayoutItem[] {
  return items.map(normalizeLayoutItem);
}
