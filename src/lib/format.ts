/**
 * Currency parsing and formatting helpers (Indian Rupee).
 * Centralised so cart, wishlist, and product views format money identically.
 */

/** Turn a price string like "₹36,727" (or "36,727") into the number 36727. */
export function parsePrice(value: string | number): number {
  if (typeof value === "number") return value;
  const digits = value.replace(/[^0-9.]/g, "");
  return Number(digits) || 0;
}

/** Format a number as INR, e.g. 75657.62 -> "₹75,657.62". */
export function formatINR(value: number, withDecimals = false): string {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })}`;
}
