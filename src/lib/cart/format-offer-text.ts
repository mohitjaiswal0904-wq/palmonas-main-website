/**
 * Uppercases offer titles/codes from the offers API for cart + all-offers UI (PW-610).
 *
 * @param value - Raw offer string from API or config.
 * @returns Uppercased display string; empty input stays empty.
 */
export function toOfferDisplayCaps(value: string): string {
  return value.toUpperCase();
}
