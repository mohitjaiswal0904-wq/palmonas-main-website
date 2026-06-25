import { fetchCollections, fetchCollection } from "@/lib/client/collections.client";
import type { CollectionsListData, Collection } from "@/types/collection";

export const collectionsService = {
  /** Return the paginated list of all collections. */
  async list(cursor?: string): Promise<CollectionsListData> {
    const res = await fetchCollections(cursor);
    return res.data as CollectionsListData;
  },

  /** Return a single collection (with products) by handle. */
  async getByHandle(handle: string): Promise<Collection> {
    const res = await fetchCollection(handle);
    // The API returns the collection object directly under `data`.
    return res.data;
  },
};
