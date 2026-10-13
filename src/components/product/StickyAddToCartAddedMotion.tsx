import { ShoppingCart } from 'lucide-react';

import { cartMessages } from '@/config/cart/cart.config';
import { productTheme } from '@/config/product/product.config';

/**
 * Reference ATC beat: cart in from left, beads drop in, cart slides right, mint “Added”.
 */
export function StickyAddToCartAddedMotion() {
  return (
    <span
      className={productTheme.stickyBarAdded.wrapClass}
      style={{
        ['--sticky-atc-cart' as string]: productTheme.stickyBarAdded.cartColor,
        ['--sticky-atc-success' as string]: productTheme.stickyBarAdded.cartSuccess,
      }}
      aria-hidden="true"
    >
      <span className={productTheme.stickyBarAdded.rippleClass} />
      <span className={productTheme.stickyBarAdded.beadsClass}>
        {productTheme.stickyBarAdded.dotColors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className={productTheme.stickyBarAdded.dotClass}
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <ShoppingCart className={productTheme.stickyBarAdded.cartClass} strokeWidth={1.75} />
      <span className={productTheme.stickyBarAdded.labelClass}>{cartMessages.added}</span>
    </span>
  );
}
