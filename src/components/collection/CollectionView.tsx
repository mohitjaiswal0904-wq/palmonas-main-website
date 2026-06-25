"use client";

import { useMemo } from "react";
import CollectionLayout from "./CollectionLayout";
import { useProducts } from "@/hooks/useProducts";
import { searchProductToCard } from "@/lib/adapters";

/** All-products listing (backed by the products/search endpoint). */
export default function CollectionView() {
  const { products: apiProducts, loading } = useProducts();

  const products = useMemo(
    () => apiProducts.map(searchProductToCard),
    [apiProducts],
  );

  return (
    <CollectionLayout
      products={products}
      loading={loading}
      title="Collection"
      subtitle="For the most precious moments"
    />
  );
}
