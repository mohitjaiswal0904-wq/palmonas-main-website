"use client";

import { useEffect } from "react";
import { useProductsStore } from "@/stores/products.store";

/** Fetch and return a single product's full detail by numeric ID. */
export function useProduct(productId: string) {
  const data = useProductsStore((s) => s.detail[productId]);
  const loading = useProductsStore((s) => s.loading);
  const error = useProductsStore((s) => s.error);
  const fetchDetail = useProductsStore((s) => s.fetchDetail);

  useEffect(() => {
    if (productId) fetchDetail(productId);
  }, [productId, fetchDetail]);

  return {
    product: data?.product ?? null,
    reviews: data?.reviews ?? null,
    discounts: data?.discount_info ?? [],
    metafields: data?.metafields ?? [],
    loading,
    error,
  };
}
