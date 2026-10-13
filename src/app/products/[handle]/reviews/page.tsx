import { ProductReviewsPageContent } from '@/components/product/ProductReviewsPageContent';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { productMessages } from '@/config/product/product.config';
import { isAppError } from '@/lib/errors';
import { parseProductReviewsFilter } from '@/lib/product/product-reviews-path';
import { isTransientAppError } from '@/lib/query/retry';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import { getProductByHandle } from '@/services/server/product.service.server';
import type { Product } from '@/types/product';
import type { ProductReviewsFilter } from '@/types/product/reviews';

interface ProductReviewsPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Builds SEO metadata for the all-reviews page from product handle. */
export async function generateMetadata({ params }: ProductReviewsPageProps) {
  const { handle } = await params;

  try {
    const product = await getProductByHandle(handle);

    return buildMetadata({
      title: productMessages.reviews.formatPageTitle(product.name),
      path: `/products/${handle}/reviews`,
    });
  } catch {
    return buildMetadata({
      title: productMessages.reviews.sectionTitle,
      path: `/products/${handle}/reviews`,
    });
  }
}

async function ProductReviewsPageBody({
  handle,
  initialFilter,
}: {
  handle: string;
  initialFilter: ProductReviewsFilter;
}) {
  let product: Product;

  try {
    product = await getProductByHandle(handle);
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

  return <ProductReviewsPageContent product={product} initialFilter={initialFilter} />;
}

/** Full product reviews listing with infinite scroll. */
export default async function ProductReviewsPage({
  params,
  searchParams,
}: ProductReviewsPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;
  const initialFilter = parseProductReviewsFilter(
    resolvedSearchParams.period,
    resolvedSearchParams.rating,
  );

  return <ProductReviewsPageBody handle={handle} initialFilter={initialFilter} />;
}
