"use client";

import { useMemo } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCarousel from "@/components/product/ProductCarousel";
import ViewAllButton from "@/components/ui/ViewAllButton";
import { useCollection } from "@/hooks/useCollection";
import { collectionProductToCard } from "@/lib/adapters";
import { cn } from "@/lib/cn";

/** Horizontal skeleton shown while a collection's products load. */
function CarouselSkeleton() {
  return (
    <div className="-mx-4 overflow-hidden sm:-mx-8">
      <div className="flex w-max border-y border-black/10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-[43vw] shrink-0 sm:w-[264px] lg:w-[288px] ${
              i !== 0 ? "border-l border-black/10" : ""
            }`}
          >
            <div className="animate-pulse">
              <div className="aspect-[3/4] bg-[#eee]" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-3/4 rounded bg-[#e8e8e8]" />
                <div className="h-3 w-1/2 rounded bg-[#e8e8e8]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface CollectionCarouselProps {
  /** Backend collection handle, e.g. "9kt-gold-bestsellers". */
  handle: string;
  /** Section heading. Falls back to the collection's own title. */
  title?: string;
  subtitle?: string;
  /** Limit the number of cards rendered (default 12). */
  limit?: number;
  /** Hide the "View All" button. */
  hideViewAll?: boolean;
  /** Hide the built-in section heading (use an external themed heading). */
  hideHeading?: boolean;
  className?: string;
}

/**
 * Reusable showcase carousel backed by a real collection. Fetches the
 * collection by handle, maps its products to cards, and links "View All" to
 * the matching `/collection/{handle}` page.
 */
export default function CollectionCarousel({
  handle,
  title,
  subtitle,
  limit = 12,
  hideViewAll = false,
  hideHeading = false,
  className,
}: CollectionCarouselProps) {
  const { collection, loading } = useCollection(handle);

  const products = useMemo(
    () =>
      (collection?.products ?? []).slice(0, limit).map(collectionProductToCard),
    [collection, limit],
  );

  // Don't render an empty section once loading has finished with no products.
  if (!loading && products.length === 0) return null;

  return (
    <section className={cn("w-full px-4 py-12 sm:px-8", className)}>
      {!hideHeading ? (
        <div className="mb-8">
          <SectionHeading
            title={title ?? collection?.title ?? ""}
            subtitle={subtitle}
          />
        </div>
      ) : null}

      {loading ? <CarouselSkeleton /> : <ProductCarousel products={products} />}

      {!hideViewAll ? (
        <div className="mt-10">
          <ViewAllButton href={`/collection/${handle}`} />
        </div>
      ) : null}
    </section>
  );
}
