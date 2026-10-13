'use client';

import { DiamondGuideIcon } from '@/components/icons/DiamondGuideIcon';
import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';
import { getColorSwatchClass, getColorSwatchStyle } from '@/lib/utils/variant-options';
import { useSizeGuide } from '@/providers/product/SizeGuideProvider';
import { PRODUCT_CATEGORY, type ProductCategory } from '@/types/product';

interface VariantColorSelectorProps {
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  title?: string;
  productCategory?: ProductCategory;
  inStock?: boolean;
}

function StockCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden="true" fill="none">
      <circle cx="6" cy="6" r="5" stroke={productTheme.success} strokeWidth="1" />
      <path
        d="M3.5 6.2 5.2 7.8 8.5 4.2"
        stroke={productTheme.success}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VariantColorSelector({
  values,
  selectedValue,
  onChange,
  title = productMessages.selectMetalColour,
  productCategory,
  inStock,
}: VariantColorSelectorProps) {
  const { openSizeGuide } = useSizeGuide();
  const isGold = productCategory === PRODUCT_CATEGORY.GOLD;
  const showDiamondGuide = isGold && isProductFeatureEnabled('diamondGuide');
  const showStock = isProductFeatureEnabled('stockLabel') && typeof inStock === 'boolean';

  const selectedColourLabel = selectedValue.trim();
  const showSelectedColour = isGold && selectedColourLabel.length > 0;

  return (
    <section aria-label={productMessages.a11y.chooseColor}>
      <div className="flex items-center gap-1">
        <p
          className="shrink-0 text-sm font-normal tracking-wide"
          style={{ color: productTheme.ink }}
        >
          {title}
        </p>
        {showSelectedColour ? (
          <p
            className={cn(productTheme.typography.pdpMetaClass, 'min-w-0 flex-1 font-medium')}
            style={{ color: productTheme.selectedColourHint }}
            data-testid="selected-metal-colour"
          >
            ({selectedColourLabel})
          </p>
        ) : (
          <span className="min-w-0 flex-1" aria-hidden="true" />
        )}
        {showDiamondGuide ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-normal tracking-wide"
            style={{ color: productTheme.gold.link }}
            aria-label={productMessages.a11y.openDiamondGuide}
            onClick={() => openSizeGuide({ kind: 'diamond' })}
          >
            <DiamondGuideIcon className="size-4" />
            {productMessages.diamondGuide}
          </button>
        ) : null}
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-[11px]">
          {values.map((value) => {
            const isSelected = value === selectedValue;
            const swatchStyle = getColorSwatchStyle(value);

            return (
              <button
                key={value}
                type="button"
                className={cn(
                  'inline-flex size-[26px] shrink-0 items-center justify-center rounded-full border-[1.6px] border-solid bg-white outline-none',
                )}
                style={{
                  borderColor: isSelected
                    ? isGold
                      ? productTheme.gold.accent
                      : productTheme.ink
                    : productTheme.chipIdle,
                }}
                aria-label={`Select ${value}`}
                aria-pressed={isSelected}
                onClick={() => onChange(value)}
              >
                <span
                  className={cn(
                    'block size-[18px] shrink-0 rounded-full',
                    getColorSwatchClass(value),
                  )}
                  style={swatchStyle}
                />
              </button>
            );
          })}
        </div>
        {showStock ? (
          <div className="flex items-center gap-1">
            <StockCheckIcon />
            <span
              className={cn(productTheme.typography.pdpMetaClass, 'font-medium')}
              style={{ color: inStock ? productTheme.success : productTheme.compareAt }}
            >
              {inStock ? productMessages.inStock : productMessages.outOfStock}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
