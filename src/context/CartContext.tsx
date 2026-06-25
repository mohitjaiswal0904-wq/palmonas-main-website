"use client";

/**
 * CartContext — thin compatibility shim.
 * State now lives in the Zustand store (src/stores/cart.store.ts).
 * This file keeps the `CartProvider` export so `AppProviders` keeps compiling,
 * and re-exports `useCart` from the canonical hook.
 */

import type { ReactNode } from "react";
export { useCart } from "@/hooks/useCart";

/** No-op provider — Zustand doesn't need a React context tree. */
export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
