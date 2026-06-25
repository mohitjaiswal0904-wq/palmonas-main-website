"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "@/components/layout/Footer";
import FilterChips from "@/components/ui/FilterChips";
import ProductCard from "@/components/product/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

const FILTERS = ["All", "Gold", "Silver", "Demi-fine"] as const;

function HeartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

export default function WishlistPage() {
  const { items, count } = useWishlist();
  const [filter, setFilter] = useState<string>("All");

  const visibleItems = useMemo(
    () =>
      filter === "All"
        ? items
        : items.filter((product) => product.collection === filter),
    [items, filter],
  );

  return (
    <>
      <main className="w-full bg-white">
        {/* Heading */}
        <div className="border-b border-[#e2e8f0]">
          <div className="mx-auto flex max-w-[1714px] flex-col gap-5 px-4 py-6 sm:px-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#151515] sm:text-3xl">
                My Wishlist
              </h1>
              <p className="text-sm text-[#62748e]">
                {count} {count === 1 ? "item" : "items"} saved
              </p>
            </div>
            {count > 0 ? (
              <FilterChips
                options={[...FILTERS]}
                value={filter}
                onChange={setFilter}
                align="start"
              />
            ) : null}
          </div>
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
            <HeartIcon />
            <div>
              <p className="text-lg font-medium text-[#151515]">
                Your wishlist is empty
              </p>
              <p className="mt-1 text-sm text-[#64748b]">
                Tap the heart on any product to save it here for later.
              </p>
            </div>
            <Link
              href="/collection"
              className="rounded-lg bg-[#151515] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start Shopping
            </Link>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="px-6 py-24 text-center">
            <p className="text-base text-[#64748b]">
              No {filter} items in your wishlist yet.
            </p>
          </div>
        ) : (
          <div className="w-full px-4 py-8 sm:px-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {visibleItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
