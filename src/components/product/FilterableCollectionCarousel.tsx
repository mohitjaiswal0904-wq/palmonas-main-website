"use client";

import { useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import FilterChips from "@/components/ui/FilterChips";
import ProductCarousel from "@/components/product/ProductCarousel";
import ViewAllButton from "@/components/ui/ViewAllButton";
import { ArrowIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useCollection } from "@/hooks/useCollection";
import { collectionProductToCard } from "@/lib/adapters";
import { cn } from "@/lib/cn";

export interface FilterChip {
  label: string;
  /** Backend collection handle this chip loads. */
  handle: string;
}

/** Skeleton row shown while the active collection loads. */
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

/**
 * Showcase carousel with category chips. Selecting a chip loads that
 * collection's products from the API and updates the "View All" target.
 */
export default function FilterableCollectionCarousel({
  title,
  chips,
  limit = 12,
  chipVariant = "default",
  hideHeading = false,
  className,
}: {
  title: string;
  chips: FilterChip[];
  limit?: number;
  chipVariant?: "default" | "new-arrival";
  hideHeading?: boolean;
  className?: string;
}) {
  const [activeLabel, setActiveLabel] = useState(chips[0]?.label ?? "");

  const activeHandle =
    chips.find((c) => c.label === activeLabel)?.handle ?? chips[0]?.handle ?? "";

  const { collection, loading } = useCollection(activeHandle);

  const products = useMemo(
    () =>
      (collection?.products ?? []).slice(0, limit).map(collectionProductToCard),
    [collection, limit],
  );

  return (
    <section className={cn("w-full px-4 py-12 sm:px-8", className)}>
      <div className="mb-5 flex flex-col gap-5">
        {!hideHeading && title ? <SectionHeading title={title} /> : null}
        <FilterChips
          scroll
          variant={chipVariant}
          options={chips.map((c) => c.label)}
          value={activeLabel}
          onChange={setActiveLabel}
        />
      </div>

      {loading ? <CarouselSkeleton /> : <ProductCarousel products={products} />}

      <div className="mt-6">
        {chipVariant === "new-arrival" ? (
          <div className="flex justify-center">
            <Link
              href={`/collection/${activeHandle}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5D5DC] bg-[#EDE4EA] px-7 py-2.5 text-sm font-medium text-[#8B6B75] transition-transform hover:scale-[1.03]"
            >
              View All
              <ArrowIcon />
            </Link>
          </div>
        ) : (
          <ViewAllButton href={`/collection/${activeHandle}`} />
        )}
      </div>
    </section>
  );
}
