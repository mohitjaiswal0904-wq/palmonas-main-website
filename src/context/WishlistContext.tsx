"use client";

/**
 * WishlistContext — thin compatibility shim.
 * State now lives in the Zustand store (src/stores/wishlist.store.ts).
 * This file keeps the `WishlistProvider` export so `AppProviders` keeps compiling,
 * and re-exports `useWishlist` from the canonical hook.
 */

import type { ReactNode } from "react";
export { useWishlist } from "@/hooks/useWishlist";

/** No-op provider — Zustand doesn't need a React context tree. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
