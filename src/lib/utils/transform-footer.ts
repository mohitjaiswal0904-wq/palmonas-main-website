import type { FooterFallbackColumn } from '@/config/components.config';
import { footerCmsCopyCorrections } from '@/config/layout/footer.config';
import { normalizeLayoutItems } from '@/lib/utils/header';
import type { CmsSlotPayload } from '@/types/cms-slot';
import {
  DEFAULT_FOOTER_CONFIG,
  type FooterConfig,
  type FooterSlotViewModel,
  type LayoutItem,
} from '@/types/layout';

function fallbackColumnsToItems(columns: FooterFallbackColumn[]): LayoutItem[] {
  return columns.flatMap((column, columnIndex) => {
    const columnId = `fallback-col-${columnIndex}`;
    const columnItem: LayoutItem = {
      id: columnId,
      item_type: 'footer_column',
      label: column.title,
      parent_id: null,
      stack_order: columnIndex,
    };

    const linkItems: LayoutItem[] = column.links.map((link, linkIndex) => ({
      id: `${columnId}-link-${linkIndex}`,
      item_type: 'link',
      label: link.label,
      action_value: link.href,
      parent_id: columnId,
      stack_order: linkIndex,
    }));

    return [columnItem, ...linkItems];
  });
}

function mergeFooterConfig(config: FooterConfig | undefined): FooterConfig {
  const merged: FooterConfig = {
    ...DEFAULT_FOOTER_CONFIG,
    ...config,
    text_color: config?.text_color ?? config?.heading_color ?? DEFAULT_FOOTER_CONFIG.text_color,
    newsletter_placeholder:
      config?.newsletter_placeholder ??
      config?.newsletter_heading ??
      DEFAULT_FOOTER_CONFIG.newsletter_placeholder,
  };

  return merged;
}

/**
 * Correct known stale CMS labels while preserving their destinations and layout metadata.
 *
 * @param item - Normalized footer item supplied by CMS.
 * @returns Footer item with corrected copy, including nested children.
 */
function correctFooterItemCopy(item: LayoutItem): LayoutItem {
  const label = item.label ? (footerCmsCopyCorrections[item.label] ?? item.label) : item.label;

  return {
    ...item,
    label,
    children: item.children?.map(correctFooterItemCopy),
  };
}

/** Maps a successful CMS slot payload to the footer view model (no fallback injection). */
export function transformFooterSlotPayload(payload: CmsSlotPayload): FooterSlotViewModel {
  const layout = payload.layout;
  const items = normalizeLayoutItems(layout?.items ?? []).map(correctFooterItemCopy);

  return {
    config: mergeFooterConfig(layout?.config as FooterConfig | undefined),
    items,
  };
}

/** Static fallback items used only when the CMS slot request fails. */
export function buildFallbackFooterItems(columns: FooterFallbackColumn[]): LayoutItem[] {
  return fallbackColumnsToItems(columns);
}
