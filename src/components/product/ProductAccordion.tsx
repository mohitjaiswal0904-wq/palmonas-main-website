import { ProductAccordionItem } from '@/components/product/ProductAccordionItem';
import { GoldPriceBreakupContent } from '@/components/product/gold/GoldPriceBreakdown';
import { GoldProductDetailsContent } from '@/components/product/gold/GoldProductDetailsContent';
import { productMessages, productTheme } from '@/config/product/product.config';
import { hasGoldPriceBreakup } from '@/lib/product/gold-price-breakup';
import { cn } from '@/lib/utils/cn';
import type { GoldProductDetails } from '@/types/gold-product-details';
import type { MtoPrice } from '@/types/mto-price';
import type { Product } from '@/types/product';

interface ProductAccordionProps {
  product: Product;
  goldProductDetails?: GoldProductDetails;
  mtoPrice?: MtoPrice;
}

export function ProductAccordion({ product, goldProductDetails, mtoPrice }: ProductAccordionProps) {
  const isGold = product.productCategory === 'gold';
  const tone = isGold ? 'gold' : 'default';

  return (
    <section
      className={cn(
        isGold ? 'laptop:rounded-[17px] overflow-hidden rounded-[12px] p-1.5' : undefined,
      )}
      style={{
        backgroundColor: isGold ? productTheme.stickyBarBg : undefined,
      }}
      aria-label={productMessages.a11y.productDetails}
    >
      {isGold && goldProductDetails ? (
        <ProductAccordionItem title="Product Details" tone={tone}>
          <GoldProductDetailsContent details={goldProductDetails} />
        </ProductAccordionItem>
      ) : null}

      {isGold && hasGoldPriceBreakup(mtoPrice) ? (
        <ProductAccordionItem
          title={productMessages.priceDetails}
          tone={tone}
          chevronColor={productTheme.gold.accent}
        >
          <GoldPriceBreakupContent price={mtoPrice} />
        </ProductAccordionItem>
      ) : null}

      <ProductAccordionItem title="Description" content={product.description} tone={tone} />

      {!isGold ? (
        <ProductAccordionItem title="Specifications" content={product.specifications ?? ''} />
      ) : null}

      <ProductAccordionItem
        title="Supplier Information"
        content={product.supplierInfo ?? ''}
        tone={tone}
      />
      <ProductAccordionItem title="Return Policy" content={product.returnInfo ?? ''} tone={tone} />
    </section>
  );
}
