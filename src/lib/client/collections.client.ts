import { apiFetch } from "./base";
import type { ApiResponse } from "@/types/api";
import type { CollectionsListData, Collection } from "@/types/collection";

/** Fetch a paginated list of all collections. */
export function fetchCollections(cursor?: string): Promise<ApiResponse<CollectionsListData>> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<CollectionsListData>(`/collections${params}`);
}

/**
 * Fetch a single collection with its products by handle (e.g. "stud-earrings").
 * The API returns the collection object directly under `data`.
 */
export function fetchCollection(handle: string): Promise<ApiResponse<Collection>> {
  return apiFetch<Collection>(`/collections/${encodeURIComponent(handle)}`);
}
