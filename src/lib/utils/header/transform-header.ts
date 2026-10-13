import type { HeaderFallbackLink } from '@/config/components.config';
import { normalizeLayoutItems } from '@/lib/utils/header/layout-item';
import type { CmsSlotPayload } from '@/types/cms-slot';
import {
  DEFAULT_HEADER_CONFIG,
  type HeaderConfig,
  type HeaderRowShell,
  type HeaderSlotViewModel,
  type LayoutItem,
} from '@/types/layout';

function fallbackNavToItems(links: HeaderFallbackLink[]): LayoutItem[] {
  return links.map((link, index) => {
    if (link.collectionHandle) {
      return {
        id: `fallback-nav-${index}`,
        item_type: 'link',
        label: link.label,
        action_type: 'collection',
        action_value: link.collectionHandle,
        parent_id: null,
        stack_order: index,
      };
    }

    return {
      id: `fallback-nav-${index}`,
      item_type: 'link',
      label: link.label,
      action_value: link.href ?? '/',
      parent_id: null,
      stack_order: index,
    };
  });
}

function mergeHeaderConfig(config: HeaderConfig | undefined): HeaderConfig {
  return {
    ...DEFAULT_HEADER_CONFIG,
    ...config,
  };
}

function normalizeHeaderRows(rows: HeaderRowShell[] | undefined): HeaderRowShell[] | undefined {
  if (!rows?.length) {
    return undefined;
  }

  return rows.map((row) => ({
    ...row,
    items: normalizeLayoutItems(row.items ?? []),
  }));
}

/** Maps a successful CMS slot payload to the header view model (no fallback injection). */
export function transformHeaderSlotPayload(payload: CmsSlotPayload): HeaderSlotViewModel {
  const layout = payload.layout;

  return {
    config: mergeHeaderConfig(layout?.config as HeaderConfig | undefined),
    items: normalizeLayoutItems(layout?.items ?? []),
    rows: normalizeHeaderRows(layout?.rows as HeaderRowShell[] | undefined),
  };
}

/** Static fallback items used only when the CMS slot request fails. */
export function buildFallbackHeaderItems(options: {
  logoLabel: string;
  logoHref: string;
  navLinks: HeaderFallbackLink[];
}): LayoutItem[] {
  return [
    {
      id: 'fallback-logo',
      item_type: 'logo',
      label: options.logoLabel,
      action_value: options.logoHref,
      parent_id: null,
      stack_order: 0,
    },
    ...fallbackNavToItems(options.navLinks),
    {
      id: 'fallback-search',
      item_type: 'search',
      label: 'Search',
      action_value: '/search',
      parent_id: null,
      stack_order: 100,
    },
    {
      id: 'fallback-profile',
      item_type: 'profile',
      label: 'Login',
      action_value: '/account/login',
      parent_id: null,
      stack_order: 101,
    },
    {
      id: 'fallback-cart',
      item_type: 'cart',
      label: 'Cart',
      action_value: '/cart',
      parent_id: null,
      stack_order: 102,
    },
  ];
}
