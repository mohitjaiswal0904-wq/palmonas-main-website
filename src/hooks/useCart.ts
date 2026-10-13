"use client";

import { useCartStore } from "@/stores/cart.store";

/**
 * Primary hook for cart interactions.
 * Backed by Zustand with `localStorage` persistence — no Provider needed.
 */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);

  const count = items.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return { items, count, subtotal, addItem, removeItem, updateQty, clear };
}
