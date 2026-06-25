"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchBox from "@/components/search/SearchBox";
import {
  BagIcon,
  HeartIcon,
  MenuIcon,
  PinIcon,
  SearchIcon,
  StoreIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

/** Small count bubble shown on the cart / wishlist icons. */
function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-[#151515] px-1 text-[11px] font-semibold leading-[18px] text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const showCartBadge = cartCount > 0 && pathname !== "/cart";
  const showWishlistBadge = wishlistCount > 0 && pathname !== "/wishlist";

  // PDP (/product/...) and PLP (/collection...) use a compact mobile header:
  // a search icon replaces the full search bar and the profile icon is hidden.
  const isPdp = pathname?.startsWith("/product/");
  const isPlp = pathname === "/collection" || pathname?.startsWith("/collection/");
  const compact = Boolean(isPdp || isPlp);

  // The mobile bottom nav already surfaces a cart shortcut on these routes, so
  // the header cart icon is hidden on mobile there to avoid duplication. On
  // PLP/PDP/search/cart the BNB is hidden, so the header keeps the cart icon.
  const isSearch = pathname === "/search" || pathname?.startsWith("/search/");
  const isCart = pathname === "/cart" || pathname?.startsWith("/cart/");
  const bnbHasCart = !(isPdp || isPlp || isSearch || isCart);

  return (
    <>
      {/* Announcement bar — sits above the sticky bar in normal flow, so it
          scrolls away at the exact scroll speed (no JS, no transition lag). */}
      <div className="flex w-full items-center justify-center bg-black px-4 py-2.5 text-center">
        <p className="text-sm font-bold text-white">
          Buy 1 Get 1 Free · Flat ₹999 Store · Free Shipping on all orders
        </p>
      </div>

      {/* Sticky bar — logo, search, icons and nav stay pinned to the top. */}
      <div className="sticky top-0 z-50 w-full bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
        {/* Top bar */}
        <div className="mx-auto flex w-full max-w-[1714px] items-center gap-3 px-4 py-4 sm:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="shrink-0 text-black lg:hidden"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <Link href="/" aria-label="Palmonas home" className="shrink-0">
            <Image
              src="/palmonas-logo.svg"
              alt="Palmonas"
              width={208}
              height={21}
              priority
              className="h-[14px] w-auto sm:h-[15px]"
            />
          </Link>

          {/* Search */}
          {!isCart ? (
            <SearchBox className="mx-2 hidden h-[50px] max-w-[674px] flex-1 md:block" />
          ) : null}

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            {/* Pincode */}
            <div className="hidden items-center gap-1.5 xl:flex">
              <PinIcon className="text-black" />
              <span className="text-sm text-black">Update Pincode</span>
              <span className="rounded-lg bg-gradient-to-r from-[#ffccbc]/50 to-white/50 px-2 py-1.5 text-xs italic text-black">
                Delivering to <span className="font-bold not-italic">221002</span>
              </span>
            </div>

            {/* Compact-header search toggle (mobile only, PLP — hidden on PDP) */}
            {isPlp ? (
              <button
                type="button"
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
                className="shrink-0 text-black transition-opacity hover:opacity-70 md:hidden"
              >
                <SearchIcon />
              </button>
            ) : null}

            <button
              type="button"
              aria-label="Store locator"
              className="hidden shrink-0 text-black transition-opacity hover:opacity-70 sm:block"
            >
              <StoreIcon />
            </button>
            {/* Wishlist, cart and account are hidden on the cart page. */}
            {!isCart ? (
              <>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="relative shrink-0 text-black transition-opacity hover:opacity-70"
                >
                  <HeartIcon />
                  {showWishlistBadge ? <CountBadge count={wishlistCount} /> : null}
                </Link>
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className={`relative shrink-0 text-black transition-opacity hover:opacity-70 ${
                    bnbHasCart ? "hidden lg:block" : ""
                  }`}
                >
                  <BagIcon />
                  {showCartBadge ? <CountBadge count={cartCount} /> : null}
                </Link>
                <Link
                  href="/profile"
                  aria-label="Account"
                  className={`shrink-0 text-black transition-opacity hover:opacity-70 ${
                    compact ? "hidden md:block" : ""
                  }`}
                >
                  <UserIcon />
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Compact PLP search panel — kept inside the sticky bar so it stays
            usable while pinned. PDP never shows it. */}
        {compact && isPlp && searchOpen ? (
          <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
            <SearchBox
              className="h-[46px] flex-1"
              autoFocus
              defaultValue={lastQuery}
              onSearch={(q) => {
                setLastQuery(q);
                setSearchOpen(false);
              }}
              onClose={() => setSearchOpen(false)}
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e6e6e6] text-lg text-[#555] transition-colors hover:bg-[#f5f5f5]"
            >
              ✕
            </button>
          </div>
        ) : null}

        <DesktopNav />
      </div>

      {/* Mobile search — placed below the sticky bar in normal flow, so it
          scrolls up behind the header at the exact scroll speed. Hidden on the
          compact (PLP/PDP) and cart routes. */}
      {!compact && !isCart ? (
        <div className="bg-white px-4 pb-3 md:hidden">
          <SearchBox className="h-[46px]" />
        </div>
      ) : null}

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
