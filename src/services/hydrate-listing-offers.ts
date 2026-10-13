import { applyListingOfferFallback } from '@/services/product-transform';
import { PRODUCT_CATEGORY, type Product, type ProductListResponse } from '@/types/product';

/**
 * Fill empty demifine listing offers from one product-detail payload.
 *
 * Collection list APIs omit demifine `offers` / `discount_info`. Gold list rows
 * already include `discounts`, so they are left untouched.
 *
 * @param list - Transformed collection products page.
 * @param fetchProduct - Product detail loader (same HTTP client as the listing).
 * @returns Listing with demifine card offers filled when detail fetch succeeds.
 */
export async function hydrateListingOffers(
  list: ProductListResponse,
  fetchProduct: (id: string) => Promise<Product>,
): Promise<ProductListResponse> {
  const source = list.items.find(
    (product) =>
      product.productCategory === PRODUCT_CATEGORY.DEMIFINE &&
      product.offers.length === 0 &&
      Boolean(product.id),
  );

  if (!source) {
    return list;
  }

  try {
    const detail = await fetchProduct(source.id);
    return applyListingOfferFallback(list, detail.offers);
  } catch {
    return list;
  }
}
