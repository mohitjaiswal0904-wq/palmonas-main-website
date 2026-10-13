/**
 * Scroll the listing anchor to the top of the viewport, accounting for sticky header offset.
 *
 * @param listingEl - Listing root (toolbar / grid start), or null if unmounted
 * @param stickyOffset - Sticky site header height in px (`scroll-margin` equivalent)
 * @returns True when a scroll ran
 */
export function scrollProductListingIntoView(
  listingEl: HTMLElement | null,
  stickyOffset = 0,
): boolean {
  if (!listingEl) {
    return false;
  }

  const top = window.scrollY + listingEl.getBoundingClientRect().top - stickyOffset;
  // `auto` — instant jump; avoids unsupported `instant` on older WebKit.
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  return true;
}
