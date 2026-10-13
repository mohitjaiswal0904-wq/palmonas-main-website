import { DemifineProductPage } from '@/components/product/DemifineProductPage';
import { GoldProductPage } from '@/components/product/GoldProductPage';
import type { MtoPrice } from '@/types/mto-price';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { Product } from '@/types/product';

interface ProductPageContentProps {
  product: Product;
  initialGoldPrice?: MtoPrice;
  initialGoldPriceSku?: string;
}

export function ProductPageContent({
  product,
  initialGoldPrice,
  initialGoldPriceSku,
}: ProductPageContentProps) {
  if (product.productCategory === PRODUCT_CATEGORY.GOLD) {
    return (
      <GoldProductPage
        product={product}
        initialGoldPrice={initialGoldPrice}
        initialGoldPriceSku={initialGoldPriceSku}
      />
    );
  }

  return <DemifineProductPage product={product} />;
}
