'use client';

import Link from 'next/link';

import { CouponTicketStub } from '@/components/cart/CouponTicketStub';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';

interface OfferListCardProps {
  badge?: string;
  subtitle: string;
  code: string;
  description: string;
  onApply?: () => void;
  disabled?: boolean;
  viewOnly?: boolean;
  applied?: boolean;
  logoUrl?: string;
  applying?: boolean;
  /** Collection route for unlocking an unavailable offer. */
  unlockHref?: string;
  unlockAriaLabel?: string;
}

/** Ticket-style offer card for All Offers page. */
export function OfferListCard({
  badge,
  subtitle,
  code,
  description,
  onApply,
  disabled = false,
  viewOnly = false,
  applied = false,
  logoUrl,
  applying = false,
  unlockHref,
  unlockAriaLabel,
}: OfferListCardProps) {
  const displayCode = toOfferDisplayCaps(code);
  const displaySubtitle = toOfferDisplayCaps(subtitle);
  const displayBadge = badge ? toOfferDisplayCaps(badge) : badge;
  const showUnlock = Boolean(unlockHref) && !applied;
  const showApply = !viewOnly && (Boolean(onApply) || applied) && !showUnlock;

  return (
    <article
      className={`flex min-h-[164px] overflow-hidden rounded-xl ${disabled && !showUnlock ? 'opacity-60' : ''}`}
      style={{ backgroundColor: '#f2f2f2' }}
      data-testid="offer-list-card"
      data-applied={applied || undefined}
    >
      <CouponTicketStub label={displayBadge} />
      <div className="flex flex-1 flex-col justify-center gap-3 rounded-r-xl border border-[#f7f7f7] bg-[#f2f2f2] p-3">
        {logoUrl ? (
          // External partner cashback logos from discount API.
          // eslint-disable-next-line @next/next/no-img-element -- remote offer logos
          <img src={logoUrl} alt="" className="h-6 w-auto self-start object-contain" />
        ) : null}
        <p className="text-[13px] font-medium text-[#5b5760]">{displaySubtitle}</p>
        <p className="text-[17px] font-bold text-[#232027]">{displayCode}</p>
        <p className="text-[10px] leading-normal font-medium text-[#5b5760]">{description}</p>
        {showUnlock && unlockHref ? (
          <Link
            href={unlockHref}
            className="w-full rounded-full px-6 py-1.5 text-center text-[11px] font-bold no-underline"
            style={{
              backgroundColor: cartTheme.couponAddItemsBg,
              color: cartTheme.couponAddItemsText,
            }}
            aria-label={
              unlockAriaLabel ?? cartMessages.a11y.addItemsForOffer.replace('{code}', displayCode)
            }
          >
            {cartMessages.addItems}
          </Link>
        ) : showApply ? (
          <button
            type="button"
            className="w-full rounded-full border border-[#151515] bg-white px-6 py-1.5 text-[11px] font-bold text-[#232027] disabled:opacity-60"
            onClick={applied ? undefined : onApply}
            disabled={disabled || applying || applied}
            aria-label={
              applied
                ? `${cartMessages.applied} ${displayCode}`
                : `${cartMessages.applyCode} ${displayCode}`
            }
          >
            {applied ? cartMessages.applied : cartMessages.applyCode}
          </button>
        ) : null}
      </div>
    </article>
  );
}

/** Skeleton placeholder matching OfferListCard layout. */
export function OfferListCardSkeleton() {
  return (
    <div
      className="flex min-h-[164px] animate-pulse overflow-hidden rounded-xl bg-[#f2f2f2]"
      data-testid="offer-list-card-skeleton"
      aria-hidden
    >
      <div className="w-[69px] bg-[#e8e8e8]" />
      <div className="flex flex-1 flex-col justify-center gap-3 p-3">
        <div className="h-3 w-2/3 rounded bg-[#e8e8e8]" />
        <div className="h-5 w-1/3 rounded bg-[#e8e8e8]" />
        <div className="h-3 w-full rounded bg-[#e8e8e8]" />
        <div className="h-8 w-full rounded-full bg-[#e8e8e8]" />
      </div>
    </div>
  );
}
