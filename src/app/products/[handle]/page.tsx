import { ProductPageAnalytics } from '@/components/analytics/ProductPageAnalytics';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { ProductPageContent, ProductPageSkeleton } from '@/components/product';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { productMessages } from '@/config/product/product.config';
import { isAppError } from '@/lib/errors';
import { isTransientAppError } from '@/lib/query/retry';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import { getProductPageServerData } from '@/services/server/product-page.service.server';

export const metadata = buildMetadata({ title: 'Product', path: '/products' });

/** Shared app-shell prefetch — PDP body streams after navigation. */
export const prefetch = 'partial';

async function ProductPageBody({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  let serverData;

  try {
    serverData = await getProductPageServerData(handle);
  } catch (err) {
    if (isAppError(err) && err.code === 'NOT_FOUND') {
      return (
        <ResourceNotFound
          title="Product not found"
          description="This product may no longer be available, or the link you followed may be incorrect."
          ctaHref={resolveCollectionPagePath('best-sellers')}
          ctaLabel="Continue shopping"
        />
      );
    }

    if (isTransientAppError(err)) {
      return (
        <ResourceNotFound
          kicker={productMessages.loadErrorKicker}
          title={productMessages.loadErrorTitle}
          description={productMessages.loadErrorDescription}
          ctaHref={`/products/${handle}`}
          ctaLabel={productMessages.loadErrorCta}
        />
      );
    }

    throw err;
  }

  return (
    <>
      <ProductPageAnalytics product={serverData.product} />
      <ProductPageContent
        product={serverData.product}
        initialGoldPrice={serverData.initialGoldPrice}
        initialGoldPriceSku={serverData.initialGoldPriceSku}
      />
    </>
  );
}

/**
 * Product PDP — chrome streams ahead of product SSR.
 * No route `loading.tsx`: Cache Components + that file replaces the Activity-preserved
 * previous page on swipe-back and leaves the PDP skeleton up while RSC re-streams.
 */
export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  return (
    <StreamingPageShell mainFallback={<ProductPageSkeleton />}>
      <ProductPageBody params={params} />
    </StreamingPageShell>
  );
}
