/** White page canvas. */
export const DIWALI_PAGE_ROOT_CLASS = 'bg-white text-[#3A1A12]';

/** Section inset. Wider from laptop so desktop is not a stretched phone column. */
export const DIWALI_SECTION_CLASS =
  'tab:px-6 laptop:max-w-7xl laptop:px-8 laptop:py-12 desktop:max-w-[90rem] mx-auto w-full max-w-5xl px-4 py-8';

/** Card row. Fills the section so the 328px Figma frame scales with the screen. */
export const DIWALI_CARD_COLUMN_CLASS = 'w-full';

/** Square offer tile. 158×158 on the 328px Figma frame, then grows with the column. */
export const DIWALI_CARD_MEDIA_CLASS = 'relative aspect-square w-full overflow-hidden';

/** Full-width tile. 328×158 on that frame. */
export const DIWALI_CARD_BAND_CLASS = 'relative aspect-[328/158] w-full overflow-hidden';
export const DIWALI_GRID_CARD_CLASS = 'h-full w-full tab:w-full laptop:w-full desktop:w-full';

/**
 * Sale hero frame from the Diwali 2026 mobile layout: 360×528.
 * Laptop keeps the wide 3:1 frame so the same banner does not become a full-screen crop.
 */
export const DIWALI_HERO_FRAME_CLASS =
  'relative aspect-[360/528] w-full bg-[#f8e4e9] laptop:aspect-[3/1]';

/** Eyebrow used on home section titles. */
export const DIWALI_EYEBROW_CLASS =
  'text-xs font-semibold uppercase tracking-palmonas-wider text-[#9A3412]';

/** Filled campaign button, matching Emily in Paris CTAs. */
export const DIWALI_PRIMARY_BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-sm bg-[#151515] px-5 py-2.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#2A2A2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]';

/** Small card button: maroon fill, gold edge, cream label. */
export const DIWALI_CARD_CTA_CLASS =
  'rounded-full border border-[#E8B84A] bg-[#5D0424] px-3 py-1 text-[10px] font-semibold tracking-wide text-[#FCE7B2]';

/** Outline button used for view-all actions on the gifting page. */
export const DIWALI_OUTLINE_BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-[#E8B84A] bg-white px-10 py-2.5 text-sm font-medium text-[#7A1F2B] transition-colors hover:border-[#7A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1F2B]';

export const DIWALI_SHOP_SECTION_ID = 'diwali-collection';
