import type { Metadata } from 'next';

import { DiwaliPageContent, DiwaliPageSkeleton } from '@/components/diwali';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import {
  DIWALI_PAGE_PATH,
  diwaliHandles,
  diwaliImages,
  diwaliMessages,
  diwaliProductLimits,
  diwaliShopTabs,
} from '@/config/diwali/diwali.config';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  getCollectionByHandle,
  getCollectionProducts,
} from '@/services/server/collection.service.server';
import type { Product } from '@/types/product';

/** Shared app-shell prefetch — page body streams after navigation. */
export const prefetch = 'partial';

/**
 * Load a collection's first product page, returning an empty list when the handle fails.
 *
 * @param handle - Collection handle.
 * @param limit - Maximum products to keep.
 * @returns Products for the section, or an empty list.
 */
async function loadDiwaliProducts(handle: string, limit: number): Promise<Product[]> {
  try {
    const page = await getCollectionProducts(handle, {
      page: 1,
      limit,
      sortBy: 'featured',
    });

    return page.items.slice(0, limit);
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const collection = await getCollectionByHandle(diwaliHandles.heroCollection);

    return buildMetadata({
      title: diwaliMessages.meta.title,
      description: collection.description ?? diwaliMessages.meta.description,
      path: DIWALI_PAGE_PATH,
      ogImage: collection.image,
    });
  } catch {
    return buildMetadata({
      title: diwaliMessages.meta.title,
      description: diwaliMessages.meta.description,
      path: DIWALI_PAGE_PATH,
    });
  }
}

async function DiwaliPageBody() {
  const shopHandles = [...new Set(diwaliShopTabs.map((tab) => tab.handle))];

  const [giftProducts, ...shopPages] = await Promise.all([
    loadDiwaliProducts(diwaliHandles.giftBoxes, diwaliProductLimits.giftBoxes),
    ...shopHandles.map((handle) => loadDiwaliProducts(handle, diwaliProductLimits.shop)),
  ]);

  const productsByHandle = new Map(
    shopHandles.map((handle, index) => [handle, shopPages[index] ?? []]),
  );
  const productsByTabId = Object.fromEntries(
    diwaliShopTabs.map((tab) => [tab.id, productsByHandle.get(tab.handle) ?? []]),
  );

  return (
    <DiwaliPageContent
      heroImageUrl={diwaliImages.hero}
      heroImageAlt={diwaliImages.heroAlt}
      giftProducts={giftProducts}
      productsByTabId={productsByTabId}
    />
  );
}

/** Sale chrome streams in-page — no route `loading.tsx` (soft-nav hang). */
export default function DiwaliPage() {
  return (
    <StreamingPageShell mainFallback={<DiwaliPageSkeleton />}>
      <DiwaliPageBody />
    </StreamingPageShell>
  );
}
