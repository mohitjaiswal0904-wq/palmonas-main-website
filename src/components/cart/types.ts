/** Shared types for the mobile cart flow (cart page + bottom sheets). */

export type DiscountKind = "percent" | "flat" | "bogo";

export interface Coupon {
  code: string;
  title: string;
  /** Short marketing line, e.g. "Buy One get one free". */
  headline: string;
  description: string;
  kind: DiscountKind;
  value: number;
  /** Group the coupon belongs to in the "All Offers" sheet. */
  group: "discount" | "other";
}

export interface GiftCard {
  /** Redeemable code shown on the card. */
  code: string;
  amount: number;
  bonus?: number;
}

export interface Address {
  id: string;
  name: string;
  lines: string[];
  isDefault: boolean;
}
