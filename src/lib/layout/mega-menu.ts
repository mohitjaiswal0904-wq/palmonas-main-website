import type { LayoutItem } from '@/types/layout';

/** Desktop mega-menu surface: compact card (gold) vs full-bleed bar (demifine). */
export type MegaMenuVariant = 'compact' | 'wide';

/**
 * Resolve mega-menu chrome from CMS column count.
 * Five-or-more columns match the demifine full-width panel; fewer match the gold floating card.
 *
 * @param columnCount - Top-level `mini_menu` / `link` children under `large_page`.
 * @returns Visual variant for panel + link colours.
 */
export function resolveMegaMenuVariant(columnCount: number): MegaMenuVariant {
  return columnCount >= 5 ? 'wide' : 'compact';
}

/**
 * Place each CMS section in its own column on a single row (no auto-stacking).
 * Nested `mini_menu` children inside a section still stack via the renderer.
 *
 * @param columns - Filtered `large_page` children.
 * @returns One grid cell per section.
 */
export function groupMegaMenuColumns(columns: LayoutItem[]): LayoutItem[][] {
  return columns.map((column) => [column]);
}
