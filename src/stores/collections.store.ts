import { create } from "zustand";
import type { CollectionSummary, Collection } from "@/types/collection";
import { collectionsService } from "@/services/collections.service";

interface CollectionsState {
  list: CollectionSummary[];
  byHandle: Record<string, Collection>;
  /** List-level loading flag. */
  loading: boolean;
  /** Per-handle loading flags, so concurrent detail fetches don't clash. */
  loadingByHandle: Record<string, boolean>;
  error: string | null;

  fetchList: () => Promise<void>;
  fetchByHandle: (handle: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  list: [],
  byHandle: {},
  loading: false,
  loadingByHandle: {},
  error: null,

  async fetchList() {
    if (get().list.length > 0) return; // already loaded
    set({ loading: true, error: null });
    try {
      const data = await collectionsService.list();
      set({ list: data.collections, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async fetchByHandle(handle) {
    const state = get();
    // Skip if already cached or a fetch is already in flight for this handle.
    if (state.byHandle[handle] || state.loadingByHandle[handle]) return;
    set((s) => ({
      loadingByHandle: { ...s.loadingByHandle, [handle]: true },
      error: null,
    }));
    try {
      const collection = await collectionsService.getByHandle(handle);
      set((s) => ({
        byHandle: { ...s.byHandle, [handle]: collection },
        loadingByHandle: { ...s.loadingByHandle, [handle]: false },
      }));
    } catch (e) {
      set((s) => ({
        error: (e as Error).message,
        loadingByHandle: { ...s.loadingByHandle, [handle]: false },
      }));
    }
  },
}));
