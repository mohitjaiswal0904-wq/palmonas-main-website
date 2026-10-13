/**
 * Tailwind classes for horizontal scroll tracks that must not block vertical page scroll.
 * Do not add `touch-pan-x` — it restricts touch to the horizontal axis only (PW-567).
 */
export const HORIZONTAL_SCROLL_PASS_VERTICAL =
  'overscroll-x-contain [-webkit-overflow-scrolling:touch]';

/**
 * Prefer `overflow-y-visible` (not `overflow-y-hidden`) on horizontal rails so a
 * vertical swipe that starts on the track still scrolls the page (PW-567 / PDP reviews).
 */

/** Hide scrollbars on horizontal overflow tracks while keeping swipe/scroll. */
export const HORIZONTAL_SCROLLBAR_HIDDEN =
  'scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

/**
 * Cursor hint for mouse-draggable horizontal rails (pair with `useHorizontalMouseScroll`).
 * `overflow-y-clip` keeps overflow-x-auto from becoming a vertical scrollport.
 */
export const HORIZONTAL_SCROLL_MOUSE =
  'cursor-grab overflow-y-clip [&_img]:pointer-events-auto [&_img]:[-webkit-user-drag:none]';
