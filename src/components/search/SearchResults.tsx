"use client";

import Link from "next/link";
import { useMemo } from "react";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import { useProducts } from "@/hooks/useProducts";
import { searchProductToCard } from "@/lib/adapters";
import { popularSearches, searchCollections } from "@/data/catalog";

const collectionStyles: Record<string, string> = {
  Gold: "bg-[#f6e7c1] text-[#7a5a08]",
  Silver: "bg-[#e6ebf0] text-[#3a444f]",
  "Demi-fine": "bg-[#fbe4e7] text-[#8a3a4a]",
};

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

interface Props {
  query: string;
}

export default function SearchResults({ query }: Props) {
  const params = useMemo(() => ({ q: query || undefined }), [query]);
  const { products: apiProducts, loading } = useProducts(params);

  const products = useMemo(
    () => apiProducts.map(searchProductToCard),
    [apiProducts],
  );

  const matchedCollections = query ? searchCollections(query) : [];
  const total = products.length + matchedCollections.length;

  return (
    <main className="flex flex-1 flex-col bg-white text-[#111]">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        {query ? (
          <>
            <p className="text-sm text-[#777]">
              {loading ? "Searching…" : `${total} result${total === 1 ? "" : "s"} for`}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              &ldquo;{query}&rdquo;
            </h1>
          </>
        ) : (
          <h1 className="text-3xl font-semibold tracking-tight">
            Search Palmonas
          </h1>
        )}

        {/* Popular searches */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#999]">Popular:</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-[#e6e6e6] px-3 py-1 text-sm text-[#555] transition-colors hover:border-[#b8956a] hover:text-[#b8956a]"
            >
              {term}
            </Link>
          ))}
        </div>

        {/* Product results */}
        {loading ? (
          <section className="mt-10">
            <div className="-mx-6 grid grid-cols-2 gap-px border-y border-black/10 bg-black/10 md:grid-cols-3 lg:mx-0 lg:border xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : products.length > 0 ? (
          <section className="mt-10">
            {matchedCollections.length > 0 && (
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#999]">
                Top results
              </h2>
            )}
            <div className="-mx-6 grid grid-cols-2 gap-px border-y border-black/10 bg-black/10 md:grid-cols-3 lg:mx-0 lg:border xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Matching collections */}
        {matchedCollections.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#999]">
              Explore collections
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchedCollections.map((c) => (
                <Link
                  key={c.name}
                  href={c.href}
                  className="group flex items-center justify-between rounded-2xl border border-[#eee] p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  <div>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-[11px] font-medium",
                        collectionStyles[c.name] ?? "bg-[#eee] text-[#555]",
                      )}
                    >
                      {c.name}
                    </span>
                    <p className="mt-2 text-sm text-[#555]">{c.description}</p>
                  </div>
                  <span className="text-xl text-[#b8956a] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {query && !loading && total === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg font-medium text-[#111]">
              No matches for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-2 text-sm text-[#777]">
              Try a different term, or explore one of our collections.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/gold"
                className="rounded-full bg-[#1a1408] px-5 py-2 text-sm text-[#f6e7c1]"
              >
                Gold
              </Link>
              <Link
                href="/silver"
                className="rounded-full bg-[#eef1f4] px-5 py-2 text-sm text-[#1c2127]"
              >
                Silver
              </Link>
              <Link
                href="/demifine"
                className="rounded-full bg-[#2a121a] px-5 py-2 text-sm text-[#fbe4e7]"
              >
                Demi-Fine
              </Link>
            </div>
          </div>
        )}

        {!query && (
          <p className="mt-10 text-sm text-[#777]">
            Start typing in the search bar above, or pick a popular search.
          </p>
        )}
      </div>
    </main>
  );
}
