'use client';

import { Check, Clock } from 'lucide-react';

import { popPlanDetailMessages } from '@/config/pop.config';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils/cn';
import type { PopInstalment } from '@/types/pop/subscription-detail';

interface PopInstalmentCardProps {
  instalment: PopInstalment;
}

function PopInstalmentIcon({ kind }: { kind: PopInstalment['kind'] }) {
  if (kind === 'paid') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--pop-green-bright)] sm:size-[2.06rem]">
        <Check className="size-4 text-white sm:size-5" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'bonus') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fe9a00] sm:size-[2.06rem]">
        <span className="text-sm text-white" aria-hidden="true">
          🎁
        </span>
      </div>
    );
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#adadad] sm:size-[2.06rem]">
      <Clock className="size-4 text-white sm:size-5" aria-hidden="true" />
    </div>
  );
}

/** Single instalment row in the POP plan details timeline. */
export function PopInstalmentCard({ instalment }: PopInstalmentCardProps) {
  const { showInfo } = useToast();

  const handleReceiptClick = () => {
    if (instalment.receiptUrl) {
      window.open(instalment.receiptUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    showInfo('Receipt download coming soon.');
  };

  return (
    <article
      className={cn(
        'flex w-full gap-3 rounded-[13px] border p-4 sm:gap-[0.83rem] sm:p-[1.1rem]',
        instalment.kind === 'paid' && 'border-[var(--pop-border)] bg-[#f0fdf4]',
        instalment.kind === 'upcoming' && 'border-[var(--pop-border)] bg-[rgba(239,239,239,0.5)]',
        instalment.kind === 'bonus' &&
          'border-[#fee685] bg-[linear-gradient(90deg,#fffbeb_0%,#fefce8_100%)]',
      )}
    >
      <PopInstalmentIcon kind={instalment.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                'text-base font-normal text-[var(--pop-text-primary)] sm:text-[clamp(1.125rem,1.042vw,1.25rem)]',
                instalment.kind === 'bonus' && 'font-medium',
              )}
            >
              {instalment.title}
            </p>
            {instalment.subtitle ? (
              <p className="mt-2 text-sm font-normal text-[var(--pop-text-secondary)] sm:text-base">
                {instalment.subtitle}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                'text-base font-normal text-[var(--pop-text-primary)] sm:text-[clamp(1.125rem,1.042vw,1.25rem)]',
                instalment.kind === 'bonus' && 'font-bold text-[#fe9a00]',
              )}
            >
              {instalment.amountLabel}
            </p>
            {instalment.statusLabel ? (
              <p
                className={cn(
                  'mt-2 text-sm font-medium',
                  instalment.kind === 'paid' ? 'text-[var(--pop-green)]' : 'text-[#717171]',
                )}
              >
                {instalment.statusLabel}
              </p>
            ) : null}
          </div>
        </div>

        {instalment.kind === 'paid' ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
            {instalment.paymentMethod ? (
              <span className="inline-flex h-6 items-center rounded border border-[#e5e7eb] bg-white px-2 text-[0.72rem] font-normal text-[var(--pop-text-secondary)]">
                {instalment.paymentMethod}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleReceiptClick}
              className="text-sm font-normal text-[var(--pop-brand-tint)] underline underline-offset-2"
              aria-label={popPlanDetailMessages.viewReceiptAriaLabel.replace(
                '{title}',
                instalment.title,
              )}
            >
              {popPlanDetailMessages.viewReceipt}
            </button>
          </div>
        ) : null}

        {instalment.bonusMessage ? (
          <p className="mt-3 text-base font-normal text-[var(--pop-brand-tint)] sm:mt-4 sm:text-[clamp(1rem,0.9375vw,1.125rem)]">
            {instalment.bonusMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}

interface PopInstalmentTimelineProps {
  instalments: PopInstalment[];
}

/** Vertical instalment timeline from Figma details page. */
export function PopInstalmentTimeline({ instalments }: PopInstalmentTimelineProps) {
  return (
    <div className="flex w-full flex-col">
      {instalments.map((instalment, index) => (
        <div key={instalment.id} className="flex w-full flex-col">
          <PopInstalmentCard instalment={instalment} />
          {index < instalments.length - 1 ? (
            <div className="flex h-8 items-center px-5" aria-hidden="true">
              <div className="h-full w-0.5 bg-[var(--pop-border)]" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
