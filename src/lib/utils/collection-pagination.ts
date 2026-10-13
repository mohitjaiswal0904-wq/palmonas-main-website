import type { ProductListResponse } from '@/types/product';

export function collectionPageHasMore(page: ProductListResponse): boolean {
  if (page.hasNext === false) {
    return false;
  }

  if (page.hasNext === true) {
    return true;
  }

  if (page.nextCursor) {
    return true;
  }

  if (page.page < page.totalPages) {
    return true;
  }

  return false;
}

export function getNextCollectionPageParam(
  page: ProductListResponse,
  nextPageNumber: number,
): { page: number; cursor?: string } {
  return {
    page: nextPageNumber,
    ...(page.nextCursor ? { cursor: page.nextCursor } : {}),
  };
}

/**
 * Index after which to place the infinite-scroll sentinel — halfway through the
 * most recently loaded page so the next RSC chunk can prefetch early.
 */
export function getCollectionLoadMoreTriggerIndex(
  totalProductCount: number,
  loadedPageCount: number,
  pageSize: number,
): number | undefined {
  if (totalProductCount === 0 || loadedPageCount < 1 || pageSize < 1) {
    return undefined;
  }

  const previousPagesCount = Math.max(0, (loadedPageCount - 1) * pageSize);
  const currentPageProductCount = Math.max(1, totalProductCount - previousPagesCount);
  const halfOfCurrentPage = Math.max(1, Math.floor(currentPageProductCount / 2));
  const triggerIndex = previousPagesCount + halfOfCurrentPage - 1;

  return Math.max(0, Math.min(triggerIndex, totalProductCount - 1));
}
