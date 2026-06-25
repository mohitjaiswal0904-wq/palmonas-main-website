"use client";

import { useWishlistStore } from "@/stores/wishlist.store";

/**
 * Primary hook for wishlist interactions.
 * Backed by Zustand with `localStorage` persistence — no Provider needed.
 */
export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const has = useWishlistStore((s) => s.has);
  const toggle = useWishlistStore((s) => s.toggle);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const count = items.length;

  return { items, count, has, toggle, remove, clear };
}
