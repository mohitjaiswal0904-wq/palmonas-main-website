import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/product";

type AddItemInput = Omit<CartItem, "lineId" | "qty"> & { qty?: number };

const makeLineId = (id: string, colour?: string, size?: string) =>
  `${id}__${colour ?? ""}__${size ?? ""}`;

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (input: AddItemInput) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      get count() {
        return get().items.reduce((sum, it) => sum + it.qty, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, it) => sum + it.price * it.qty, 0);
      },

      addItem(input) {
        const lineId = makeLineId(input.id, input.colour, input.size);
        const addQty = input.qty ?? 1;
        set((state) => {
          const existing = state.items.find((it) => it.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((it) =>
                it.lineId === lineId ? { ...it, qty: it.qty + addQty } : it,
              ),
            };
          }
          return { items: [...state.items, { ...input, lineId, qty: addQty }] };
        });
      },

      removeItem(lineId) {
        set((state) => ({
          items: state.items.filter((it) => it.lineId !== lineId),
        }));
      },

      updateQty(lineId, qty) {
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((it) => it.lineId !== lineId)
              : state.items.map((it) =>
                  it.lineId === lineId ? { ...it, qty } : it,
                ),
        }));
      },

      clear() {
        set({ items: [] });
      },
    }),
    { name: "palmonas_cart" },
  ),
);
