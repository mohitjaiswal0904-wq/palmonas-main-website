"use client";

import { useEffect } from "react";
import { useProductsStore } from "@/stores/products.store";
import type { SearchParams } from "@/types/search";

/**
 * Search/list products.
 * Re-fetches whenever `params` reference changes — memoize the object in the
 * calling component to avoid unnecessary requests.
 */
export function useProducts(params: SearchParams = {}) {
  const results = useProductsStore((s) => s.results);
  const meta = useProductsStore((s) => s.meta);
  const loading = useProductsStore((s) => s.loading);
  const error = useProductsStore((s) => s.error);
  const search = useProductsStore((s) => s.search);

  // Stringify for stable comparison.
  const key = JSON.stringify(params);

  useEffect(() => {
    search(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { products: results, meta, loading, error };
}
