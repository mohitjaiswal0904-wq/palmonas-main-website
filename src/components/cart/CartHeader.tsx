'use client';

import { useRouter } from 'next/navigation';

import { CartBackIcon } from '@/components/icons/cart-icons';
import { cartMessages, formatCartHeaderItemCount } from '@/config/cart/cart.config';
import { themeFonts } from '@/config/theme/fonts';
import { cn } from '@/lib/utils/cn';

interface CartHeaderProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
  /** Total cart units — shown as gray `(N items)` after the title (Figma 3765:53143). */
  itemCount?: number;
  variant?: 'default' | 'empty';
}

const BACK_FALLBACK_MS = 150;

/** Cart/sub-page header — back left, title after (Figma mobile + desktop). */
export function CartHeader({
  showBack = true,
  backHref = '/',
  title = cartMessages.pageTitle,
  itemCount,
  variant = 'default',
}: CartHeaderProps) {
  const router = useRouter();
  const showItemCount = typeof itemCount === 'number' && itemCount > 0;
  const itemCountLabel = showItemCount ? formatCartHeaderItemCount(itemCount) : null;

  /**
   * Prefer history back when possible. On mobile Safari `history.length` is often > 1
   * even with no usable prior SPA entry, so `router.back()` can no-op — fall back to
   * an explicit in-app destination when the URL does not change.
   */
  function handleBack() {
    if (typeof window === 'undefined') {
      router.push(backHref);
      return;
    }

    const pathBefore = `${window.location.pathname}${window.location.search}`;

    if (window.history.length > 1) {
      router.back();
      window.setTimeout(() => {
        const pathAfter = `${window.location.pathname}${window.location.search}`;
        if (pathAfter === pathBefore) {
          router.push(backHref);
        }
      }, BACK_FALLBACK_MS);
      return;
    }

    router.push(backHref);
  }

  return (
    <div
      className={cn(
        'laptop:mb-6 laptop:gap-3 mb-3 flex items-center gap-3',
        variant === 'empty' && 'shrink-0',
      )}
      data-testid="cart-header"
    >
      {showBack ? (
        <button
          type="button"
          onClick={handleBack}
          className="laptop:h-9 laptop:w-9 laptop:rounded-lg relative z-10 flex h-10 w-10 shrink-0 items-center justify-center text-[#151515]"
          aria-label="Go back"
          data-testid="cart-header-back"
        >
          <CartBackIcon />
        </button>
      ) : null}
      <h1
        className={cn(
          themeFonts.sans.className,
          'flex items-baseline gap-1.5 text-base leading-6 font-semibold tracking-normal text-[#151515]',
        )}
      >
        <span>{title}</span>
        {itemCountLabel ? (
          <span className="text-[#9a9a9a]" data-testid="cart-header-item-count">
            {itemCountLabel}
          </span>
        ) : null}
      </h1>
    </div>
  );
}
