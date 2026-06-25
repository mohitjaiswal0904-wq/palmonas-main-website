"use client";

import { useMemo, useState } from "react";
import CollectionMobileBar from "./CollectionMobileBar";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

/* ---------- static config ---------- */

const filterGroups: { label: string; options: string[] }[] = [
  {
    label: "Category",
    options: ["All", "Necklaces", "Earrings", "Rings", "Bracelets"],
  },
  {
    label: "Metal",
    options: ["All", "Rose Gold", "Yellow Gold", "White Gold", "Silver"],
  },
  { label: "Purity", options: ["All", "9KT Gold", "14KT Gold"] },
  {
    label: "Price",
    options: ["All", "Under ₹1,000", "₹1,000 – ₹2,000", "₹2,000 – ₹3,000", "₹3,000+"],
  },
  {
    label: "Occasion",
    options: ["All", "Daily Wear", "Party", "Wedding", "Gifting"],
  },
];

const offerTabs = ["Buy 1 Get 1 Free", "Free Gift", "Buy 2 at ₹3,499"];

const sortOptions = [
  "Popular",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
  "Top Rated",
];

/* ---------- local components ---------- */

function Chip({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-[#151515] bg-[#151515] text-white"
          : "border-black/15 bg-white text-[#3a3a3a] hover:border-[#151515] hover:text-[#151515]",
        className,
      )}
    >
      {label}
    </button>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-[#f5f5f5]">
      <div className="aspect-[3/4] bg-[#e8e8e8]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-[#e0e0e0]" />
        <div className="h-3 w-1/2 rounded bg-[#e0e0e0]" />
      </div>
    </div>
  );
}

/* ---------- shared presentational layout ---------- */

export interface CollectionLayoutProps {
  products: Product[];
  loading: boolean;
  title: string;
  subtitle?: string;
  /** Optional content rendered between the hero and the filters/grid. */
  headerSlot?: React.ReactNode;
}

export default function CollectionLayout({
  products,
  loading,
  title,
  subtitle,
  headerSlot,
}: CollectionLayoutProps) {
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(filterGroups.map((g) => [g.label, "All"])),
  );
  const [activeOffer, setActiveOffer] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState(sortOptions[0]);

  const selectFilter = (group: string, option: string) =>
    setSelected((prev) => ({ ...prev, [group]: option }));

  const sortedProducts = useMemo(() => {
    const parseRaw = (p: string) => Number(p.replace(/[^\d]/g, ""));
    const list = [...products];
    switch (sortBy) {
      case "Price: Low to High":
      case "Price Low to High":
        return list.sort((a, b) => parseRaw(a.price) - parseRaw(b.price));
      case "Price: High to Low":
      case "Price High to Low":
        return list.sort((a, b) => parseRaw(b.price) - parseRaw(a.price));
      case "Top Rated":
      case "Best Selling":
        return list.sort((a, b) => b.reviews - a.reviews);
      case "Alphabetically A - Z":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "Alphabetically Z - A":
        return list.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return list;
    }
  }, [sortBy, products]);

  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#151515]">
      {/* Hero banner */}
      <section className="relative flex h-[156px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7e9e9] via-[#f3dede] to-[#ead2d2] sm:h-[218px]">
        <div className="pointer-events-none absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 size-72 rounded-full bg-[#d9b8b8]/40 blur-3xl" />
        <div className="relative flex flex-col items-center px-6 text-center">
          <h1 className="text-4xl text-[#b48c8c] sm:text-6xl">{title}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base text-[#a07878] sm:text-xl">
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>

      {headerSlot}

      <div className="mx-auto flex w-full max-w-[1714px] flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        {/* Filters sidebar — desktop only */}
        <aside className="hidden w-full shrink-0 lg:block lg:w-[300px]">
          <h2 className="mb-6 text-2xl font-medium">Filters</h2>
          <div className="flex flex-col gap-7">
            {filterGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 text-base font-semibold text-[#151515]">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {group.options.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      active={selected[group.label] === option}
                      onClick={() => selectFilter(group.label, option)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Offer tabs + sort */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto [scrollbar-width:none] lg:flex-none [&::-webkit-scrollbar]:hidden">
              {offerTabs.map((offer) => (
                <Chip
                  key={offer}
                  label={offer}
                  active={activeOffer === offer}
                  onClick={() =>
                    setActiveOffer((prev) => (prev === offer ? null : offer))
                  }
                />
              ))}
            </div>

            {/* Desktop sort dropdown */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-[#151515] transition-colors hover:border-[#b48c8c]"
              >
                <span>
                  Sort By: <span className="font-semibold">{sortBy}</span>
                </span>
                <ChevronDown
                  className={cn("transition-transform", sortOpen && "rotate-180")}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSortBy(option);
                        setSortOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f7e9e9]",
                        sortBy === option
                          ? "font-semibold text-[#b48c8c]"
                          : "text-[#3a3a3a]",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="-mx-4 grid grid-cols-2 gap-px border-y border-black/10 bg-black/10 sm:-mx-6 md:grid-cols-3 lg:mx-0 lg:border xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="-mx-4 grid grid-cols-2 gap-px border-y border-black/10 bg-black/10 sm:-mx-6 md:grid-cols-3 lg:mx-0 lg:border xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-[#8a8a8a]">
              No products found in this collection.
            </p>
          )}
        </div>
      </div>

      <footer className="border-t border-black/10 px-6 py-10 text-center text-sm text-[#151515]/40">
        <p>© {new Date().getFullYear()} Palmonas · Collection</p>
      </footer>

      <CollectionMobileBar sortBy={sortBy} onSortChange={setSortBy} />
    </div>
  );
}
