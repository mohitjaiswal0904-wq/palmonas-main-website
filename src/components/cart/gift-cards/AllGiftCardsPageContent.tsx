'use client';

import { useCallback, useState } from 'react';

import { CartHeader } from '@/components/cart/CartHeader';
import { cartConfig, cartMessages, cartTheme } from '@/config/cart/cart.config';
import { useToast } from '@/hooks/useToast';

interface GiftCardListItemProps {
  amount: number;
  bonusAmount: number;
  code: string;
  expiresAt: string;
}

/** Gold gradient gift card row for All Gift Cards page. */
function GiftCardListItem({ amount, bonusAmount, code, expiresAt }: GiftCardListItemProps) {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      showSuccess(cartMessages.toasts.giftCardCopied);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }, [code, showSuccess]);

  return (
    <article
      className="relative overflow-hidden rounded-xl p-3"
      style={{ backgroundImage: cartTheme.giftCardGradient }}
      data-testid="gift-card-list-item"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-40px] right-[-20px] size-24 rounded-full bg-[rgba(255,146,146,0.1)]"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 tracking-tight">
            <p className="min-w-0 flex-1 text-sm leading-5 font-normal text-[#151515]">
              {cartMessages.giftCardReady}
            </p>
            <p className="shrink-0 text-[8px] leading-normal font-normal text-[#989898]">
              {cartMessages.expires} {expiresAt}
            </p>
          </div>
          <p className="text-[20.5px] leading-6 font-bold tracking-wide text-[#151515]">
            ₹{amount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs leading-4 font-normal" style={{ color: cartTheme.giftCardBonus }}>
            {cartMessages.includingBonus.replace('{amount}', bonusAmount.toLocaleString('en-IN'))}
          </p>
        </div>
        <div className="flex h-[34px] items-stretch">
          <div className="flex min-w-0 flex-1 items-center rounded-l-lg border border-r-0 border-dashed border-[#151515] bg-white px-3 text-sm font-medium tracking-tight text-[#151515]">
            {code}
          </div>
          <button
            type="button"
            className="w-[85px] shrink-0 rounded-r-lg border border-dashed border-[#151515] bg-[#151515] text-sm font-medium tracking-tight text-white"
            onClick={handleCopy}
            aria-label={cartMessages.a11y.copyGiftCard}
          >
            {copied ? cartMessages.copied : cartMessages.copy}
          </button>
        </div>
      </div>
    </article>
  );
}

/** All Gift Cards page with redemption info panel. */
export function AllGiftCardsPageContent() {
  const cards = cartConfig.mock.allGiftCards ?? [];
  const notePrefix = 'Note : ';
  const noteBody = cartMessages.redemptionNote.startsWith(notePrefix)
    ? cartMessages.redemptionNote.slice(notePrefix.length)
    : cartMessages.redemptionNote;

  return (
    <div className="laptop:max-w-4xl mx-auto flex max-w-2xl flex-col gap-3">
      <CartHeader title={cartMessages.allGiftCards} backHref="/cart" />
      <div className="laptop:grid laptop:grid-cols-2 laptop:gap-4 laptop:space-y-0 flex flex-col gap-6">
        {cards.map((card) => (
          <GiftCardListItem
            key={card.id}
            amount={card.amount}
            bonusAmount={card.bonusAmount}
            code={card.code}
            expiresAt={card.expiresAt}
          />
        ))}
      </div>
      <section
        className="laptop:col-span-2 flex flex-col gap-2 rounded-[10px] p-3"
        style={{ backgroundColor: cartTheme.redemptionPanelBg }}
        data-testid="gift-card-redemption-panel"
      >
        <h2 className="text-base leading-6 font-bold tracking-tight text-[#1a1a1a]">
          {cartMessages.howRedemptionWorks}
        </h2>
        <ul className="flex flex-col gap-2">
          {cartMessages.redemptionBullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-sm leading-5 tracking-tight text-[#8e8e8e]">
              <span aria-hidden className="shrink-0 text-[#979797]">
                •
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-[#d5d5d5] bg-white p-2 text-[10px] leading-[15px]">
          <span className="font-bold text-black">{notePrefix}</span>
          <span className="font-normal text-[#616161]">{noteBody}</span>
        </div>
      </section>
    </div>
  );
}
