/** Default page size for GET /api/v2/search/products. */
export const SEARCH_PRODUCTS_PAGE_SIZE = 20;

/** Debounce delay for search typing (header autocomplete fetch; search-page live navigate). */
export const SEARCH_INPUT_DEBOUNCE_MS = 300;

/** Max product rows shown in the header search autocomplete panel. */
export const SEARCH_AUTOCOMPLETE_PRODUCT_LIMIT = 6;

/** Max matching terms shown while typing in header/mobile search. */
export const SEARCH_AUTOCOMPLETE_TERM_LIMIT = 6;

/** Product-list pages fetched on initial SSR search load. */
export const SEARCH_SSR_PAGE_BATCH_SIZE = 1;

/** Product-list pages prefetched per client load-more action. */
export const SEARCH_LOAD_MORE_BATCH_SIZE = 2;

/** Five product cards per row on laptop and larger screens. */
export const SEARCH_PRODUCT_GRID_CLASS = 'laptop:grid-cols-5 desktop:grid-cols-5';

/** Matches product listing horizontal padding on the search page. */
export const SEARCH_PAGE_HORIZONTAL_PADDING_CLASS = 'px-3 tab:px-4 laptop:px-5';

/** Tighter vertical spacing for the search hero on larger screens. */
export const SEARCH_PAGE_HERO_SECTION_CLASS = 'py-6 tab:py-8 laptop:py-4';

/** Placeholder rows while recent search history is fetching. */
export const SEARCH_RECENT_SKELETON_ROWS = 3;
