import { transformHeaderSlotPayload } from '@/lib/utils/header';
import { transformFooterSlotPayload } from '@/lib/utils/transform-footer';
import { sanitizeLayoutSpacingConfig } from '@/lib/utils/unwrap-cms-slot-response';
import type { CmsPageShellResponse } from '@/types/cms-page';
import { CmsSlotLayoutSchema, type CmsSlotPayload } from '@/types/cms-slot';
import type { FooterSlotViewModel, HeaderSlotViewModel, LayoutItem } from '@/types/layout';

export interface CmsAnnouncementBarViewModel {
  id: string;
  config: Record<string, unknown>;
  items: LayoutItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalizes a shell `ResolvedLayout` (or slot payload fragment) into a CMS slot payload.
 *
 * @param layout - Raw layout from `shell.layouts` or a slot API body
 * @param slot - Slot name when the layout omits `slot`
 * @returns Parsed slot payload, or `null` when the shape is unusable
 */
export function shellLayoutToSlotPayload(layout: unknown, slot: string): CmsSlotPayload | null {
  if (!isRecord(layout)) {
    return null;
  }

  if (typeof layout.slot === 'string' && isRecord(layout.layout)) {
    const nested = { ...layout.layout };
    if (nested.config !== undefined) {
      nested.config = sanitizeLayoutSpacingConfig(nested.config);
    }

    const nestedLayout = CmsSlotLayoutSchema.safeParse(nested);

    if (!nestedLayout.success) {
      return null;
    }

    return {
      slot: layout.slot,
      layout: nestedLayout.data,
    };
  }

  const candidate = {
    ...layout,
    slot: typeof layout.slot === 'string' ? layout.slot : slot,
    ...(layout.config !== undefined ? { config: sanitizeLayoutSpacingConfig(layout.config) } : {}),
  };

  const parsedLayout = CmsSlotLayoutSchema.safeParse(candidate);

  if (!parsedLayout.success) {
    return null;
  }

  return {
    slot: typeof layout.slot === 'string' ? layout.slot : slot,
    layout: parsedLayout.data,
  };
}

/**
 * Maps `shell.layouts.header` to the header view model when present.
 *
 * @param layout - Raw header layout from a CMS page shell
 * @returns Header view model, or `null` when the layout is missing or invalid
 */
export function transformShellHeaderLayout(layout: unknown): HeaderSlotViewModel | null {
  const payload = shellLayoutToSlotPayload(layout, 'header');

  if (!payload?.layout) {
    return null;
  }

  return transformHeaderSlotPayload(payload);
}

/**
 * Maps `shell.layouts.footer` to the footer view model when present.
 *
 * @param layout - Raw footer layout from a CMS page shell
 * @returns Footer view model, or `null` when the layout is missing or invalid
 */
export function transformShellFooterLayout(layout: unknown): FooterSlotViewModel | null {
  const payload = shellLayoutToSlotPayload(layout, 'footer');

  if (!payload?.layout) {
    return null;
  }

  return transformFooterSlotPayload(payload);
}

/**
 * Maps `shell.layouts.announcement_bars` to renderable announcement bar view models.
 *
 * @param bars - Raw announcement bar layouts from a CMS page shell
 * @returns Parsed announcement bars with normalized items
 */
export function transformShellAnnouncementBars(bars: unknown[]): CmsAnnouncementBarViewModel[] {
  const viewModels: CmsAnnouncementBarViewModel[] = [];

  bars.forEach((bar, index) => {
    const payload = shellLayoutToSlotPayload(bar, 'announcement_bar');

    if (!payload?.layout) {
      return;
    }

    const items = payload.layout.items ?? [];

    if (items.length === 0) {
      return;
    }

    viewModels.push({
      id: payload.layout.layout_id ?? `announcement-bar-${index}`,
      config: isRecord(payload.layout.config) ? payload.layout.config : {},
      items,
    });
  });

  return viewModels;
}

/**
 * Resolves header chrome from a page shell, falling back to the default slot API.
 *
 * @param shell - CMS page shell response
 * @param fallback - Slot-default header data when shell layout is absent
 * @returns Header view model from shell or fallback
 */
export function resolveShellHeaderData(
  shell: CmsPageShellResponse,
  fallback: HeaderSlotViewModel,
): HeaderSlotViewModel {
  return transformShellHeaderLayout(shell.layouts.header) ?? fallback;
}

/**
 * Resolves footer chrome from a page shell, falling back to the default slot API.
 *
 * @param shell - CMS page shell response
 * @param fallback - Slot-default footer data when shell layout is absent
 * @returns Footer view model from shell or fallback
 */
export function resolveShellFooterData(
  shell: CmsPageShellResponse,
  fallback: FooterSlotViewModel,
): FooterSlotViewModel {
  return transformShellFooterLayout(shell.layouts.footer) ?? fallback;
}
