"use client";

import { useEffect } from "react";
import { useCollectionsStore } from "@/stores/collections.store";

/** Fetch and return the list of all collections. Auto-fetches on mount. */
export function useCollections() {
  const list = useCollectionsStore((s) => s.list);
  const loading = useCollectionsStore((s) => s.loading);
  const error = useCollectionsStore((s) => s.error);
  const fetchList = useCollectionsStore((s) => s.fetchList);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { collections: list, loading, error };
}
