import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface WishlistState {
  items: Product[];
  count: number;
  has: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      get count() {
        return get().items.length;
      },

      has(id) {
        return get().items.some((it) => it.id === id);
      },

      toggle(product) {
        set((state) => ({
          items: state.items.some((it) => it.id === product.id)
            ? state.items.filter((it) => it.id !== product.id)
            : [...state.items, product],
        }));
      },

      remove(id) {
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        }));
      },

      clear() {
        set({ items: [] });
      },
    }),
    { name: "palmonas_wishlist" },
  ),
);
