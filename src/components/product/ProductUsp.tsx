import { DemifineProductUsp } from '@/components/product/DemifineProductUsp';
import { GoldProductUsp } from '@/components/product/gold/GoldProductUsp';
import type { ProductCategory, ProductUspId } from '@/types/product';

interface ProductUspProps {
  productCategory: ProductCategory;
  usps?: readonly ProductUspId[];
}

/**
 * Gold PDP trust strip after cashback. Demifine badges live in `DemifinePreDealsSection`.
 */
export function ProductUsp({ productCategory, usps }: ProductUspProps) {
  if (productCategory === 'gold') {
    return <GoldProductUsp />;
  }

  return <DemifineProductUsp usps={usps} />;
}
