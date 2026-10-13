'use client';

import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { cn } from '@/lib/utils/cn';

interface CartAddressBarProps {
  name?: string;
  addressLine?: string;
  onChange: () => void;
  className?: string;
  variant?: 'mobile' | 'desktop';
}

/** Delivery address row — Figma grey strip with Delivery Address | Add/Change. */
export function CartAddressBar({
  name,
  addressLine,
  onChange,
  className,
  variant = 'desktop',
}: CartAddressBarProps) {
  const hasAddress = Boolean(name && addressLine);
  const isMobile = variant === 'mobile';

  const bgStyle = hasAddress
    ? { backgroundColor: isMobile ? cartTheme.addressBarFilledBg : cartTheme.addressBarBg }
    : { backgroundColor: cartTheme.addressBarEmptyBg };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-4 py-3',
        !isMobile && 'rounded-lg',
        isMobile && 'w-full',
        className,
      )}
      style={bgStyle}
      data-testid="cart-address-bar"
    >
      <div className="min-w-0">
        {isMobile && hasAddress ? (
          <>
            <p className="text-xs text-[#9b9b9b]">
              {cartMessages.deliveryAddress}{' '}
              <span className="font-medium text-[#151515]">{name}</span>
            </p>
            <p className="mt-2 text-[10px] text-[#151515]">{addressLine}</p>
          </>
        ) : (
          <>
            <p className={cn('text-xs', hasAddress ? 'text-[#1f1f1f]' : 'text-[#9b9b9b]')}>
              {cartMessages.deliveryAddress}
            </p>
            {hasAddress ? (
              <>
                <p className="text-sm font-medium text-[#151515]">{name}</p>
                <p className="truncate text-xs text-[#5e5e5e]">{addressLine}</p>
              </>
            ) : null}
          </>
        )}
      </div>
      <button
        type="button"
        className="shrink-0 text-[10px] font-bold text-[#151515]"
        onClick={onChange}
      >
        {hasAddress ? cartMessages.changeAddress : cartMessages.addAddress}
      </button>
    </div>
  );
}
