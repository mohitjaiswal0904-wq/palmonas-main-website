'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isAppError, type AppError } from '@/lib/errors';
import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import { getCollectionProducts } from '@/services/collection.service';
import type { Product, ProductListResponse } from '@/types/product';

interface UseGiftingCategoryProductsOptions {
  pageSize: number;
  /** Collection handle whose products were SSR-seeded. */
  initialHandle: string;
  /** First page for `initialHandle` (null when SSR fetch failed). */
  initialPage: ProductListResponse | null;
}

function dedupeProducts(pages: ProductListResponse[]): Product[] {
  const productIds = new Set<string>();

  return pages
    .flatMap((page) => page.items)
    .filter((product) => {
      if (productIds.has(product.id)) {
        return false;
      }

      productIds.add(product.id);
      return true;
    });
}

function mergeProductPages(
  existingPages: ProductListResponse[],
  incomingPage: ProductListResponse,
): ProductListResponse[] {
  const pagesByNumber = new Map<number, ProductListResponse>();

  for (const page of existingPages) {
    pagesByNumber.set(page.page, page);
  }

  pagesByNumber.set(incomingPage.page, incomingPage);

  return Array.from(pagesByNumber.values()).sort((left, right) => left.page - right.page);
}

/**
 * Gifting category rail — switches collection handle on tab change and paginates on demand.
 * Isolated from `useCollection` so PLP filter/sort remount semantics stay untouched.
 */
export function useGiftingCategoryProducts(
  handle: string,
  { pageSize, initialHandle, initialPage }: UseGiftingCategoryProductsOptions,
): {
  products: Product[];
  hasMoreProducts: boolean;
  isLoading: boolean;
  isLoadingMoreProducts: boolean;
  loadMoreProducts: () => Promise<void>;
  error: AppError | null;
} {
  const initialHandleRef = useRef(initialHandle);
  const initialPageRef = useRef(initialPage);

  // Keep SSR seed refs current without re-subscribing the load effect.
  useEffect(() => {
    initialHandleRef.current = initialHandle;
    initialPageRef.current = initialPage;
  }, [initialHandle, initialPage]);

  const canUseInitialPage = handle === initialHandle && initialPage != null;

  const [accumulatedPages, setAccumulatedPages] = useState<ProductListResponse[]>(() =>
    canUseInitialPage && initialPage ? [initialPage] : [],
  );
  const [hasMoreProducts, setHasMoreProducts] = useState(() =>
    canUseInitialPage && initialPage ? collectionPageHasMore(initialPage) : false,
  );
  const [isLoading, setIsLoading] = useState(!canUseInitialPage);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Reload page 1 whenever the category tab's collection handle changes.
  useEffect(() => {
    let cancelled = false;
    const seedHandle = initialHandleRef.current;
    const seedPage = initialPageRef.current;

    if (handle === seedHandle && seedPage) {
      setAccumulatedPages([seedPage]);
      setHasMoreProducts(collectionPageHasMore(seedPage));
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setError(null);
    setAccumulatedPages([]);
    setHasMoreProducts(false);

    void getCollectionProducts(handle, {
      page: 1,
      limit: pageSize,
      sortBy: 'featured',
    })
      .then((page) => {
        if (cancelled) {
          return;
        }

        setAccumulatedPages([{ ...page, page: 1 }]);
        setHasMoreProducts(collectionPageHasMore(page));
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        setAccumulatedPages([]);
        setHasMoreProducts(false);
        setError(isAppError(err) ? err : null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handle, pageSize]);

  const products = useMemo(() => dedupeProducts(accumulatedPages), [accumulatedPages]);

  const loadedPageCount =
    accumulatedPages.length > 0 ? Math.max(...accumulatedPages.map((page) => page.page)) : 0;

  const latestPage = accumulatedPages[accumulatedPages.length - 1];

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMoreProducts || isLoading || !latestPage) {
      return;
    }

    setIsLoadingMoreProducts(true);

    try {
      const nextPageNumber = loadedPageCount + 1;
      const nextPage = await getCollectionProducts(handle, {
        page: nextPageNumber,
        ...(latestPage.nextCursor ? { cursor: latestPage.nextCursor } : {}),
        limit: pageSize,
        sortBy: 'featured',
      });

      setAccumulatedPages((previousPages) =>
        mergeProductPages(previousPages, { ...nextPage, page: nextPageNumber }),
      );
      setHasMoreProducts(collectionPageHasMore(nextPage));
    } catch (err: unknown) {
      setHasMoreProducts(false);
      setError(isAppError(err) ? err : null);
    } finally {
      setIsLoadingMoreProducts(false);
    }
  }, [
    handle,
    hasMoreProducts,
    isLoading,
    isLoadingMoreProducts,
    latestPage,
    loadedPageCount,
    pageSize,
  ]);

  return {
    products,
    hasMoreProducts,
    isLoading,
    isLoadingMoreProducts,
    loadMoreProducts,
    error,
  };
}
