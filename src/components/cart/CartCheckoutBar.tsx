'use client';

import { CartCheckoutPaymentLogos } from '@/components/cart/CartCheckoutPaymentLogos';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { cn } from '@/lib/utils/cn';

interface CartCheckoutBarProps {
  total: number;
  currency?: string;
  loading?: boolean;
  onCheckout: () => void;
  /** When false, CTA shows label only (Figma mobile/desktop). */
  showPrice?: boolean;
  variant?: 'sticky' | 'embedded';
}

/** Checkout CTA — sticky mobile footer or embedded desktop sidebar. */
export function CartCheckoutBar({
  total,
  currency = 'INR',
  loading,
  onCheckout,
  showPrice = false,
  variant = 'sticky',
}: CartCheckoutBarProps) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(total);

  const label = showPrice
    ? `${cartMessages.continueToCheckout} · ${formatted}`
    : cartMessages.continueToCheckout;

  return (
    <div
      className={cn(
        variant === 'sticky' && 'bg-white px-2.5 pt-1 pb-[max(12px,env(safe-area-inset-bottom))]',
      )}
    >
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center rounded-lg px-2.5 text-sm tracking-wide text-white disabled:opacity-60"
        style={{ backgroundColor: cartTheme.checkoutCta }}
        disabled={loading}
        onClick={onCheckout}
        aria-label={label}
      >
        <span className="flex items-center gap-1.5">
          <span>{label}</span>
          <CartCheckoutPaymentLogos />
        </span>
      </button>
    </div>
  );
}
