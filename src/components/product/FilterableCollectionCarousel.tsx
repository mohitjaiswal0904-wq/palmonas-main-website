"use client";

import { useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import FilterChips from "@/components/ui/FilterChips";
import ProductCarousel from "@/components/product/ProductCarousel";
import ViewAllButton from "@/components/ui/ViewAllButton";
import { useCollection } from "@/hooks/useCollection";
import { collectionProductToCard } from "@/lib/adapters";

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
}: {
  title: string;
  chips: FilterChip[];
  limit?: number;
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
    <section className="w-full px-4 py-12 sm:px-8">
      <div className="mb-5 flex flex-col gap-5">
        <SectionHeading title={title} />
        <FilterChips
          scroll
          options={chips.map((c) => c.label)}
          value={activeLabel}
          onChange={setActiveLabel}
        />
      </div>

      {loading ? <CarouselSkeleton /> : <ProductCarousel products={products} />}

      <div className="mt-6">
        <ViewAllButton href={`/collection/${activeHandle}`} />
      </div>
    </section>
  );
}
