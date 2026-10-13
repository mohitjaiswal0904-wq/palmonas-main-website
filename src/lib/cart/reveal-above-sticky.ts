/**
 * Pixels to scroll so `card` sits fully above a fixed `footer`.
 *
 * @param card - Element that must stay visible (Order Summary).
 * @param footer - Fixed sticky footer, or null.
 * @param extraGap - Extra space between card bottom and footer top.
 * @returns Scroll delta in CSS pixels; 0 when already clear or footer is hidden.
 */
export function revealAboveStickyDelta(
  card: Element | null,
  footer: Element | null,
  extraGap = 16,
): number {
  if (!(card instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
    return 0;
  }

  if (footer.offsetHeight <= 0) {
    return 0;
  }

  const overlap =
    card.getBoundingClientRect().bottom - footer.getBoundingClientRect().top + extraGap;
  return overlap > 0 ? Math.ceil(overlap) : 0;
}
