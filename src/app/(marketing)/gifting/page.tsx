import { GiftingPageContent } from '@/components/gifting';
import {
  GIFTING_BESTSELLERS,
  GIFTING_CATEGORY_COLLECTION_HANDLE,
  GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
} from '@/config/gifting/gifting.config';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { getCollectionProducts } from '@/services/server/collection.service.server';
import type { ProductListResponse } from '@/types/product';

export const metadata = buildMetadata({
  title: 'Gifting',
  path: '/gifting',
  description:
    'Thoughtful Palmonas gifts curated with love — shop by occasion, recipient, price, and category.',
});

/**
 * Fetch first products page for a collection; return null on upstream failure.
 *
 * @param handle - Shopify collection handle.
 * @param pageSize - Requested page size.
 */
async function fetchFirstProductsPage(
  handle: string,
  pageSize: number,
): Promise<ProductListResponse | null> {
  try {
    return await getCollectionProducts(handle, {
      page: 1,
      limit: pageSize,
      sortBy: 'featured',
    });
  } catch {
    return null;
  }
}

export default async function GiftingPage() {
  const pageSize = GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE;
  const categoryHandle = GIFTING_CATEGORY_COLLECTION_HANDLE;
  const bestsellersHandle = GIFTING_BESTSELLERS.collectionHandle;

  const [categoryProductsInitialPage, bestsellersInitialPage] = await Promise.all([
    fetchFirstProductsPage(categoryHandle, pageSize),
    fetchFirstProductsPage(bestsellersHandle, pageSize),
  ]);

  return (
    <GiftingPageContent
      categoryCollectionHandle={categoryHandle}
      categoryProductsInitialPage={categoryProductsInitialPage}
      bestsellersInitialPage={bestsellersInitialPage}
    />
  );
}
