"use client";

import { useMemo } from "react";
import CollectionLayout from "./CollectionLayout";
import { useCollection } from "@/hooks/useCollection";
import { collectionProductToCard } from "@/lib/adapters";

/** Single-collection listing (backed by the collections/:handle endpoint). */
export default function CollectionDetailView({ handle }: { handle: string }) {
  const { collection, loading } = useCollection(handle);

  const products = useMemo(
    () => (collection?.products ?? []).map(collectionProductToCard),
    [collection],
  );

  // Humanise the handle as a fallback title until the API responds.
  const fallbackTitle = handle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <CollectionLayout
      products={products}
      loading={loading}
      title={collection?.title ?? fallbackTitle}
      subtitle={
        collection?.description
          ? collection.description.slice(0, 140) +
            (collection.description.length > 140 ? "…" : "")
          : undefined
      }
    />
  );
}
