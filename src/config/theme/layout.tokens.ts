/** Layout chrome tokens (bottom nav, mega menu, etc.). */
export const layoutTokens = {
  bottomNav: {
    /** Active tab icon stroke/fill. */
    iconActive: '#151515',
    /** Inactive tab icon stroke/fill. */
    iconInactive: '#A4A4A4',
  },
  /**
   * Header nav titles + dropdown items (prototype peach/gold hover).
   * PW-848 — not used for Sort by or utility icon buttons.
   */
  headerNav: {
    hoverBg: '#faf3ec',
    hoverText: '#b8956a',
    /**
     * Shared interactive surface for top nav + dropdown/mega links.
     * Uses Tailwind `palmonas-headerHover*` colors mapped from these tokens.
     */
    interactiveClass:
      'rounded-md transition-colors hover:bg-palmonas-headerHover hover:text-palmonas-headerHoverText active:bg-palmonas-headerHover active:text-palmonas-headerHoverText focus-visible:bg-palmonas-headerHover focus-visible:text-palmonas-headerHoverText',
    /**
     * Dropdown / mega item row — fills column width (not whole mega panel), inset via px.
     */
    dropdownItemClass:
      'flex w-full items-center gap-1 rounded-md px-3 py-2 text-left transition-colors hover:bg-palmonas-headerHover hover:text-palmonas-headerHoverText active:bg-palmonas-headerHover active:text-palmonas-headerHoverText focus-visible:bg-palmonas-headerHover focus-visible:text-palmonas-headerHoverText',
  },
  /** Desktop `large_page` mega-menu (gold compact card + demifine wide bar). */
  megaMenu: {
    heading: '#151515',
    headingBorder: '#E5E5E5',
    /** Gold / compact panel list links. */
    linkCompact: '#151515',
    /** Demifine / wide panel list links. */
    linkWide: '#757575',
    linkHover: '#151515',
    panelBg: '#FFFFFF',
    /** Column heading — small bold, single line, rule hugs label. */
    headingClass:
      'inline-block min-w-max shrink-0 border-b pb-2 text-[13px] leading-none font-bold whitespace-nowrap',
    /** Link stack under the heading rule — stretch to column width. */
    listClass: 'mt-5 flex w-full flex-col gap-y-1',
    /**
     * Single link row — fills column width so peach hover is a column row (not text-hug).
     */
    linkClass:
      'flex w-full items-center px-2 py-1.5 text-[12px] leading-4 font-normal whitespace-nowrap',
    /** Compact (gold): columns hug content on one row. */
    columnsClassCompact: 'flex w-max max-w-none flex-nowrap gap-x-14',
    /** Wide (demifine): spread columns across the panel on one row. */
    columnsClassWide: 'flex w-full flex-nowrap justify-between gap-x-10',
    /** Gap between stacked sections inside one column. */
    stackClass: 'flex min-w-max flex-col gap-10',
    /** One mega-menu section (heading + links) — column width from content. */
    sectionClass: 'flex min-w-max flex-col',
    panelClassCompact: 'rounded-xl border border-[var(--header-border)] px-8 py-7',
    panelClassWide: 'border-b border-[var(--header-border)] px-[15vw] py-8',
  },
} as const;
