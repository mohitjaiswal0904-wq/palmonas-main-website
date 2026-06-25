"use client";

import { useEffect } from "react";
import { useCollectionsStore } from "@/stores/collections.store";

/** Fetch and return a single collection by handle. Auto-fetches on mount. */
export function useCollection(handle: string) {
  const collection = useCollectionsStore((s) => s.byHandle[handle]);
  const pending = useCollectionsStore((s) => s.loadingByHandle[handle]);
  const error = useCollectionsStore((s) => s.error);
  const fetchByHandle = useCollectionsStore((s) => s.fetchByHandle);

  useEffect(() => {
    if (handle) fetchByHandle(handle);
  }, [handle, fetchByHandle]);

  // When the fetch state is unknown, treat "no collection yet" as loading so
  // sections show a skeleton instead of disappearing before data arrives.
  const loading = pending ?? !collection;

  return { collection: collection ?? null, loading, error };
}
