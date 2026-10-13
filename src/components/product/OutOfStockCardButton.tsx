'use client';

import type { MouseEvent } from 'react';

import { PlusIcon } from '@/components/icons';
import { productTokens } from '@/config/theme/product.tokens';
import { wishlistMessages } from '@/config/wishlist';
import { useToast } from '@/hooks/useToast';

/** Disabled card plus that surfaces the shared OOS toast. */
export function OutOfStockCardButton() {
  const { showWarning } = useToast();

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    showWarning(wishlistMessages.toasts.outOfStock);
  };

  return (
    <button
      type="button"
      className={productTokens.cardCta.oosButtonClass}
      aria-label={wishlistMessages.a11y.outOfStock}
      onClick={handleClick}
    >
      <PlusIcon className={productTokens.cardCta.oosIconClass} />
    </button>
  );
}
