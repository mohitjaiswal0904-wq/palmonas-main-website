'use client';

import { useEffect, useMemo, useState } from 'react';

import { VariantColorSelector } from '@/components/product/VariantColorSelector';
import { VariantSizeSelector } from '@/components/product/VariantSizeSelector';
import { productMessages, productTheme } from '@/config/product/product.config';
import {
  buildOptionGroups,
  findVariantBySelections,
  formatSizeOptionLabel,
  getDefaultSelections,
  isVariantPurchasable,
} from '@/lib/utils/variant-options';
import type { ProductCategory, ProductVariant } from '@/types/product';

interface VariantSelectorProps {
  variants: ProductVariant[];
  productCategory?: ProductCategory;
  onVariantChange?: (variant: ProductVariant | undefined) => void;
  showStock?: boolean;
}

export function VariantSelector({
  variants,
  productCategory,
  onVariantChange,
  showStock = true,
}: VariantSelectorProps) {
  const optionGroups = useMemo(() => buildOptionGroups(variants), [variants]);
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    getDefaultSelections(optionGroups),
  );

  const selectedVariant = useMemo(
    () => findVariantBySelections(variants, selections),
    [selections, variants],
  );

  // Notify parent when resolved variant changes from option selections.
  useEffect(() => {
    onVariantChange?.(selectedVariant);
  }, [onVariantChange, selectedVariant]);

  if (optionGroups.length === 0) {
    return null;
  }

  const handleChange = (name: string, value: string) => {
    setSelections((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="space-y-3" aria-label={productMessages.a11y.chooseVariant}>
      {optionGroups.map((group) => {
        const selectedValue = selections[group.name] ?? group.values[0] ?? '';

        if (group.type === 'color') {
          return (
            <VariantColorSelector
              key={group.name}
              values={group.values}
              selectedValue={selectedValue}
              productCategory={productCategory}
              inStock={
                showStock ? isVariantPurchasable(selectedVariant, productCategory) : undefined
              }
              onChange={(value) => handleChange(group.name, value)}
            />
          );
        }

        if (group.type === 'size') {
          return (
            <VariantSizeSelector
              key={group.name}
              name={group.name}
              values={group.values}
              selectedValue={selectedValue}
              title={formatSizeOptionLabel(group.name)}
              productCategory={productCategory}
              onChange={(value) => handleChange(group.name, value)}
            />
          );
        }

        return (
          <section key={group.name} aria-label={`Choose ${group.name}`}>
            <p className="text-sm font-medium" style={{ color: productTheme.ink }}>
              {group.name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = value === selectedValue;

                return (
                  <button
                    key={value}
                    type="button"
                    className="relative rounded-full border px-3 py-1.5 text-sm"
                    style={{
                      borderColor: isSelected ? productTheme.ink : productTheme.borderHairline,
                      boxShadow: isSelected ? `inset 0 0 0 1px ${productTheme.ink}` : undefined,
                      color: productTheme.ink,
                    }}
                    aria-pressed={isSelected}
                    onClick={() => handleChange(group.name, value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
