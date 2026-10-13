import { transformProductList } from '@/services/product-transform';
import type { CmsCollectionProduct } from '@/types/cms-section';
import { PRODUCT_CATEGORY, type Product, type ProductApiResponse } from '@/types/product';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (isRecord(value) && 'amount' in value) {
    return toNumber(value.amount);
  }

  return 0;
}

function normaliseId(id: string): string {
  return id.split('/').pop() ?? id;
}

export function transformCmsProduct(
  raw: CmsCollectionProduct | Record<string, unknown>,
): Product | null {
  const id = typeof raw.id === 'string' ? normaliseId(raw.id) : '';
  const handle = typeof raw.handle === 'string' && raw.handle.length > 0 ? raw.handle : id;

  if (!handle) {
    return null;
  }

  const name =
    (typeof raw.name === 'string' && raw.name) ||
    (typeof raw.title === 'string' && raw.title) ||
    'Untitled product';

  const imageUrl =
    (typeof raw.imageUrl === 'string' && raw.imageUrl) ||
    (isRecord(raw.image) && typeof raw.image.url === 'string' ? raw.image.url : '') ||
    '';

  const price = toNumber(raw.price);
  const compareAtPrice = toNumber(raw.originalPrice);

  return {
    id: id || handle,
    handle,
    name,
    description: '',
    price,
    compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
    image: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    category: '',
    productCategory: PRODUCT_CATEGORY.DEMIFINE,
    offers: [],
    variants: [],
  };
}

export function transformCmsProducts(products: unknown, maxProducts?: number): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }

  const transformed = products
    .filter((product): product is CmsCollectionProduct | Record<string, unknown> =>
      isRecord(product),
    )
    .map(transformCmsProduct)
    .filter((product): product is Product => product !== null);

  if (typeof maxProducts === 'number' && maxProducts > 0) {
    return transformed.slice(0, maxProducts);
  }

  return transformed;
}

export function getCollectionHandle(content: Record<string, unknown>): string | null {
  const handle = content.collectionHandle ?? content.handle;

  return typeof handle === 'string' && handle.length > 0 ? handle : null;
}

/**
 * Maps embedded collection product payloads into storefront products using the
 * same transform as collection listing APIs.
 *
 * @param products - Raw product list from CMS section content.
 * @param maxProducts - Optional cap on returned products.
 * @returns Normalised products for cards and grids.
 */
export function transformCollectionProducts(products: unknown, maxProducts?: number): Product[] {
  const source = Array.isArray(products) ? (products as ProductApiResponse[]) : [];
  const items = transformProductList({ items: source }).items;

  if (typeof maxProducts === 'number' && maxProducts > 0) {
    return items.slice(0, maxProducts);
  }

  return items;
}
