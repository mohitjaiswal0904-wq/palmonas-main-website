'use client';

import { SizeGuideIcon } from '@/components/icons';
import { productMessages, productTheme, sizeGuideContent } from '@/config/product/product.config';
import { getProductVariantTokens } from '@/config/theme/product.tokens';
import { cn } from '@/lib/utils/cn';
import { useSizeGuide } from '@/providers/product/SizeGuideProvider';
import { PRODUCT_CATEGORY, type ProductCategory } from '@/types/product';

interface VariantSizeSelectorProps {
  name: string;
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  title?: string;
  productCategory?: ProductCategory;
}

export function VariantSizeSelector({
  name,
  values,
  selectedValue,
  onChange,
  title = productMessages.selectRingSize,
  productCategory,
}: VariantSizeSelectorProps) {
  const { openSizeGuide } = useSizeGuide();
  const isGoldProduct = productCategory === PRODUCT_CATEGORY.GOLD;
  const accents = getProductVariantTokens(isGoldProduct ? 'gold' : 'demifine');

  return (
    <section aria-label={`Choose ${name}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="laptop:text-base text-sm font-normal" style={{ color: productTheme.ink }}>
          {title}
        </p>
        <button
          type="button"
          className="laptop:text-sm inline-flex shrink-0 items-center gap-1 text-xs font-normal tracking-wide"
          style={{ color: productTheme.ink }}
          aria-label={productMessages.a11y.openSizeGuide}
          onClick={() => openSizeGuide({ kind: 'ring', title: sizeGuideContent.title })}
        >
          <SizeGuideIcon />
          {productMessages.sizeGuide}
        </button>
      </div>
      <div className={cn('mt-1 flex flex-wrap', isGoldProduct ? 'gap-3' : 'laptop:gap-3 gap-2.5')}>
        {values.map((value) => {
          const isSelected = value === selectedValue;

          return (
            <button
              key={value}
              type="button"
              className={cn(
                productTheme.typography.pdpMetaClass,
                'laptop:size-8 flex size-[26px] items-center justify-center rounded-full',
                isSelected ? 'font-bold' : 'font-normal',
              )}
              style={
                isGoldProduct
                  ? isSelected
                    ? {
                        backgroundColor: accents.accent,
                        borderColor: accents.accent,
                        color: productTheme.surfaceWhite,
                        borderWidth: 1,
                        borderStyle: 'solid',
                      }
                    : {
                        backgroundColor: productTheme.chipIdle,
                        color: productTheme.ink,
                      }
                  : isSelected
                    ? {
                        backgroundColor: productTheme.demifine.chipSelectedBg,
                        borderColor: productTheme.demifine.chipSelected,
                        color: productTheme.ink,
                        borderWidth: 1.2,
                        borderStyle: 'solid',
                      }
                    : {
                        backgroundColor: productTheme.surfaceWhite,
                        borderColor: productTheme.chipBorderIdle,
                        color: productTheme.ink,
                        borderWidth: 1.2,
                        borderStyle: 'solid',
                      }
              }
              aria-label={`Select size ${value}`}
              aria-pressed={isSelected}
              onClick={() => onChange(value)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}
