/**
 * Shared product-related types used across product cards, grids,
 * the cart, and the wishlist.
 */

/** A product as rendered by the visual product card / grid. */
export type Product = {
  id: string;
  title: string;
  image: string;
  price: string;
  mrp: string;
  discount: string;
  extraOffers: number;
  rating: number;
  reviews: number;
  badge?: string;
  /** True when the product is part of the new-arrivals assortment. */
  isNewArrival?: boolean;
  metals: string[];
  /** Collection the product belongs to, used for wishlist / listing filters. */
  collection?: "Gold" | "Silver" | "Demi-fine";
};

/** A single line in the shopping cart (a product plus its variant + quantity). */
export type CartItem = {
  lineId: string;
  id: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  colour?: string;
  size?: string;
  qty: number;
};
