"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

/**
 * Composes all global client-side providers in one place so the root layout
 * stays clean and new providers can be added without touching it.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
