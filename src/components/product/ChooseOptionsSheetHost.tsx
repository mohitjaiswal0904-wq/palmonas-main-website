'use client';

import { ChooseOptionsSheet } from '@/components/product/ChooseOptionsSheet';
import { RemoveCartVariantSheet } from '@/components/product/RemoveCartVariantSheet';
import { useChooseOptions } from '@/providers/product/ChooseOptionsProvider';

/**
 * Single layout-mounted host for the choose-options picker (sheet / dialog).
 */
export function ChooseOptionsSheetHost() {
  const { isOpen, params, closeChooseOptions } = useChooseOptions();

  if (!params) {
    return null;
  }

  if (params.intent === 'removeFromCart') {
    return (
      <RemoveCartVariantSheet
        key={`${params.product.id}-remove`}
        open={isOpen}
        onClose={closeChooseOptions}
        product={params.product}
        matchingLines={params.matchingLines ?? []}
      />
    );
  }

  return (
    <ChooseOptionsSheet
      key={`${params.product.id}-${params.intent}`}
      open={isOpen}
      onClose={closeChooseOptions}
      product={params.product}
      intent={params.intent}
      onAddedToCart={params.onAddedToCart}
    />
  );
}
