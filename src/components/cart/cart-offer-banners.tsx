'use client';

import { useState, type ReactNode } from 'react';

import { CartGiftItemRow } from '@/components/cart/CartGiftItemRow';
import {
  cartConfig,
  cartMessages,
  cartTheme,
  isCartFeatureEnabled,
} from '@/config/cart/cart.config';
import {
  buildFreeGiftProgress,
  fillCartMessageTemplate,
  isFreeGiftOneItemAway,
} from '@/lib/cart/free-gift-progress';

const FREE_GIFT_UNLOCK_HIGHLIGHT = 'Free Gift!';

function formatCartAmount(amount: number): string {
  return amount.toLocaleString('en-IN');
}

/** Gradient chip header for bundle deal (sidebar + sticky footer). */
export function CartBundleDealChip() {
  const deal = cartConfig.mock.bundleDeal;
  if (!isCartFeatureEnabled('bundleDeal') || !deal) {
    return null;
  }

  return (
    <div
      className="flex w-full items-center gap-2.5 rounded-[17px] px-[9px] py-1.5"
      style={{ backgroundImage: cartTheme.bundleChipGradient }}
      data-testid="cart-bundle-deal-chip"
    >
      <span className="text-[17px] leading-none" aria-hidden>
        🎁
      </span>
      <p className="text-xs leading-4 font-bold text-black">{deal.title}</p>
    </div>
  );
}

/** Progress banner — sticky footer or below chip in sidebar (Figma 964:83971). */
export function CartBundleDealBanner() {
  const deal = cartConfig.mock.bundleDeal;
  if (!isCartFeatureEnabled('bundleDeal') || !deal) {
    return null;
  }

  const unlockParts = deal.unlockText.split(/(20% Extra off!)/);

  return (
    <div
      className="flex h-[60px] w-full flex-col justify-center gap-1 bg-white px-4 pt-2 pb-1"
      data-testid="cart-bundle-deal-banner"
    >
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        {unlockParts.map((part, index) =>
          part === '20% Extra off!' ? (
            <strong key={index} className="font-bold text-[#5e5e5e]">
              {part}
            </strong>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
      </p>
      <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[rgba(0,160,43,0.1)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${deal.progressPercent}%`,
            backgroundColor: cartTheme.successGreen,
          }}
        />
      </div>
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        {deal.progressPercent}% complete • ₹{deal.currentAmount.toLocaleString('en-IN')} of ₹
        {deal.targetAmount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

interface CartBundleDealCardProps {
  compact?: boolean;
  variant?: 'sidebar' | 'footer';
}

/** Bundle deal — chip overlaps banner (-5px) per Figma; full-width aligned with sidebar. */
export function CartBundleDealCard({
  compact = false,
  variant = 'sidebar',
}: CartBundleDealCardProps) {
  if (!isCartFeatureEnabled('bundleDeal') || !cartConfig.mock.bundleDeal) {
    return null;
  }

  if (variant === 'footer' || compact) {
    return (
      <div className="isolate flex w-full flex-col" data-testid="cart-bundle-deal">
        <div className="relative z-[2] mb-[-5px] px-4 pt-3">
          <CartBundleDealChip />
        </div>
        <div className="relative z-[1]">
          <CartBundleDealBanner />
        </div>
      </div>
    );
  }

  return (
    <div className="isolate flex w-full flex-col" data-testid="cart-bundle-deal">
      <div className="relative z-[2] mb-[-5px] w-full">
        <CartBundleDealChip />
      </div>
      <div className="relative z-[1] w-full">
        <CartBundleDealBanner />
      </div>
    </div>
  );
}

interface CartFreeGiftChipProps {
  cartTotal?: number;
  detailsOpen?: boolean;
  onToggleDetails?: () => void;
}

/** Gradient chip header for free gift unlock (sidebar + sticky footer). */
export function CartFreeGiftChip({
  cartTotal = 0,
  detailsOpen,
  onToggleDetails,
}: CartFreeGiftChipProps) {
  const gift = cartConfig.mock.freeGift;
  if (!isCartFeatureEnabled('freeGift') || !gift) {
    return null;
  }

  const { isUnlocked } = buildFreeGiftProgress(cartTotal, gift.targetAmount);
  const title = isUnlocked ? cartMessages.freeGiftTitleUnlocked : gift.title;

  return (
    <div
      className="flex w-full items-center gap-2.5 rounded-[17px] px-2 py-1"
      style={{ backgroundImage: cartTheme.bundleChipGradient }}
      data-testid="cart-free-gift-chip"
    >
      <span className="text-[17px] leading-none" aria-hidden>
        🎁
      </span>
      <p className="min-w-0 flex-1 text-xs leading-4 font-bold text-black">{title}</p>
      {isUnlocked && onToggleDetails ? (
        <button
          type="button"
          className="flex shrink-0 items-center gap-0.5 text-[11px] leading-[16.5px] font-semibold underline"
          style={{ color: cartTheme.textPrimary }}
          onClick={onToggleDetails}
          aria-expanded={detailsOpen}
          aria-label={
            detailsOpen
              ? cartMessages.a11y.hideFreeGiftDetails
              : cartMessages.a11y.showFreeGiftDetails
          }
          data-testid="cart-free-gift-toggle"
        >
          {detailsOpen ? cartMessages.hideOffer : cartMessages.showOffer}
          <svg
            viewBox="0 0 14 14"
            width={14}
            height={14}
            className={detailsOpen ? undefined : 'rotate-180'}
            fill="none"
            aria-hidden
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke={cartTheme.textPrimary}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

interface CartFreeGiftBannerProps {
  cartTotal?: number;
  variant?: 'sidebar' | 'footer';
}

function renderHighlightedCartTotal(amount: number): ReactNode {
  return (
    <strong className="font-bold" style={{ color: cartTheme.successGreen }}>
      ₹{formatCartAmount(amount)}
    </strong>
  );
}

/** Free gift progress banner — sticky footer or below chip in sidebar. */
export function CartFreeGiftBanner({
  cartTotal = 0,
  variant = 'sidebar',
}: CartFreeGiftBannerProps) {
  const gift = cartConfig.mock.freeGift;
  if (!isCartFeatureEnabled('freeGift') || !gift) {
    return null;
  }

  const progress = buildFreeGiftProgress(cartTotal, gift.targetAmount);
  const unlockText = progress.isUnlocked
    ? cartMessages.freeGiftUnlockUnlocked
    : fillCartMessageTemplate(cartMessages.freeGiftUnlockLocked, {
        amount: formatCartAmount(progress.remainingAmount),
      });
  const unlockParts = unlockText.split(
    new RegExp(`(${FREE_GIFT_UNLOCK_HIGHLIGHT.replace('!', '\\!')})`),
  );
  const progressCopy = fillCartMessageTemplate(cartMessages.freeGiftProgress, {
    percent: progress.progressPercent,
    current: formatCartAmount(progress.currentAmount),
    target: formatCartAmount(progress.targetAmount),
  });
  const isMobileFooter = variant === 'footer';
  const progressLead = fillCartMessageTemplate(cartMessages.freeGiftProgressLead, {
    percent: progress.progressPercent,
  });
  const progressTail = fillCartMessageTemplate(cartMessages.freeGiftProgressTail, {
    target: formatCartAmount(progress.targetAmount),
  });
  const yoursWithOrder = gift.gift
    ? fillCartMessageTemplate(cartMessages.freeGiftYoursWithOrder, { name: gift.gift.name })
    : unlockText;

  const progressLine =
    isMobileFooter && progress.isUnlocked ? (
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        {progressLead}
        <strong className="font-bold text-[#5e5e5e]">
          ₹{formatCartAmount(progress.currentAmount)}
        </strong>
        {progressTail}
      </p>
    ) : isMobileFooter ? (
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        {progressLead}
        {renderHighlightedCartTotal(progress.currentAmount)}
        {progressTail}
      </p>
    ) : !progress.isUnlocked ? (
      <p className="text-[11px] leading-normal text-[#5e5e5e]">{progressCopy}</p>
    ) : null;

  const headline =
    isMobileFooter && progress.isUnlocked && gift.gift ? (
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        <strong className="font-bold">{gift.gift.name}</strong>
        {yoursWithOrder.slice(gift.gift.name.length)}
      </p>
    ) : (
      <p className="text-[11px] leading-normal text-[#5e5e5e]">
        {unlockParts.map((part, index) =>
          part === FREE_GIFT_UNLOCK_HIGHLIGHT ? (
            <strong key={index} className="font-bold text-[#5e5e5e]">
              {part}
            </strong>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
      </p>
    );

  return (
    <div
      className="flex h-[60px] w-full flex-col justify-center gap-1 bg-white px-4 pt-2 pb-1"
      data-testid="cart-free-gift-banner"
    >
      {headline}
      <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[rgba(0,160,43,0.1)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress.progressPercent}%`,
            backgroundColor: cartTheme.successGreen,
          }}
        />
      </div>
      {progressLine}
    </div>
  );
}

interface CartFreeGiftCardProps {
  compact?: boolean;
  variant?: 'sidebar' | 'footer';
  cartTotal?: number;
}

/** Earned free-gift product row under the progress banner. */
function CartFreeGiftItem() {
  const gift = cartConfig.mock.freeGift?.gift;
  if (!gift) {
    return null;
  }

  return (
    <div className="w-full px-2 pt-1.5" data-testid="cart-free-gift-item">
      <CartGiftItemRow name={gift.name} imageUrl={gift.imageUrl} worthAmount={gift.worthAmount} />
    </div>
  );
}

/** Free gift — chip + progress banner + earned gift row. */
export function CartFreeGiftCard({
  compact = false,
  variant = 'sidebar',
  cartTotal = 0,
}: CartFreeGiftCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const gift = cartConfig.mock.freeGift;
  if (!isCartFeatureEnabled('freeGift') || !gift) {
    return null;
  }

  const progress = buildFreeGiftProgress(cartTotal, gift.targetAmount);
  const oneItemAway = isFreeGiftOneItemAway(
    progress.remainingAmount,
    gift.oneItemMaxRemaining ?? 0,
  );

  if (!progress.isUnlocked && !oneItemAway) {
    return null;
  }

  if (!progress.isUnlocked && oneItemAway) {
    const remaining = formatCartAmount(progress.remainingAmount);
    const nudge = fillCartMessageTemplate(cartMessages.freeGiftOneItemNudge, {
      amount: remaining,
    });
    const amountLabel = `₹${remaining}`;
    const amountIndex = nudge.indexOf(amountLabel);

    return (
      <div className="px-2 pt-1" data-testid="cart-free-gift-nudge">
        <p
          className="flex w-full items-center justify-center gap-2 rounded-[17px] px-2 py-1.5 text-center text-xs leading-4 font-semibold"
          style={{
            backgroundImage: cartTheme.bundleChipGradient,
            color: cartTheme.textPrimary,
          }}
        >
          <span className="text-[17px] leading-none" aria-hidden>
            🎁
          </span>
          <span>
            {amountIndex >= 0 ? (
              <>
                {nudge.slice(0, amountIndex)}
                <strong className="font-bold" style={{ color: cartTheme.successGreen }}>
                  {amountLabel}
                </strong>
                {nudge.slice(amountIndex + amountLabel.length)}
              </>
            ) : (
              nudge
            )}
          </span>
        </p>
      </div>
    );
  }

  if (variant === 'footer' || compact) {
    return (
      <div className="isolate flex w-full flex-col" data-testid="cart-free-gift">
        <div className="relative z-[2] px-2 pt-1">
          <CartFreeGiftChip
            cartTotal={cartTotal}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((open) => !open)}
          />
        </div>
        {detailsOpen ? <CartFreeGiftItem /> : null}
      </div>
    );
  }

  return (
    <div className="isolate flex w-full flex-col" data-testid="cart-free-gift">
      <div className="relative z-[2] mb-[-5px] w-full">
        <CartFreeGiftChip cartTotal={cartTotal} />
      </div>
      <CartFreeGiftItem />
      <div className="relative z-[1] w-full">
        <CartFreeGiftBanner cartTotal={cartTotal} variant="sidebar" />
      </div>
    </div>
  );
}
