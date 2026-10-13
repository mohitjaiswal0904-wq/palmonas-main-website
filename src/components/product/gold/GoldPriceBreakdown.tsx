'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { formatPrice } from '@/lib/format-price';
import { resolveGoldFinalPrice } from '@/lib/product/gold-display-price';
import { cn } from '@/lib/utils/cn';
import type { MtoPrice } from '@/types/mto-price';

interface GoldPriceBreakupContentProps {
  price: MtoPrice;
}

/**
 * Figma: hairlines and the Grand Total band run edge to edge, while every text row
 * (gold, diamond, charges) shares one inset — so padding sits on content, not wrappers.
 */
const rowSideInset = 'px-2 laptop:px-3';

type MetricAlign = 'start' | 'center' | 'end';

function MetricColumn({
  label,
  value,
  align = 'start',
}: {
  label: string;
  value: string;
  align?: MetricAlign;
}) {
  return (
    <div
      className={cn('min-w-0 flex-1', {
        'text-left': align === 'start',
        'text-center': align === 'center',
        'text-right': align === 'end',
      })}
    >
      <p className="laptop:text-sm text-xs font-normal" style={{ color: productTheme.ink }}>
        {value}
      </p>
      <p
        className="laptop:mt-1 laptop:text-xs mt-0.5 text-[10px]"
        style={{ color: productTheme.titleMuted }}
      >
        {label}
      </p>
    </div>
  );
}

function ChargeRow({
  label,
  value,
  emphasis = false,
  infoLabel,
  infoText,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  infoLabel?: string;
  infoText?: string;
}) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div
      className="w-full border-b"
      style={{
        borderColor: productTheme.borderHairline,
        backgroundColor: emphasis ? productTheme.chipIdle : 'transparent',
      }}
    >
      <div
        className={cn(
          'laptop:py-2.5 laptop:text-sm flex w-full min-w-0 items-center justify-between gap-4 py-2 text-xs leading-normal',
          rowSideInset,
        )}
      >
        <span
          className="relative inline-flex items-center gap-1.5"
          style={{
            color: emphasis ? productTheme.ink : productTheme.titleMuted,
            fontWeight: emphasis ? 700 : 400,
          }}
        >
          {label}
          {infoLabel && infoText ? (
            <>
              <button
                type="button"
                className="laptop:size-4 inline-flex size-3.5 cursor-pointer items-center justify-center rounded-full border text-[9px]"
                style={{ borderColor: productTheme.chipBorderIdle, color: productTheme.titleMuted }}
                aria-label={infoLabel}
                aria-expanded={infoOpen}
                onClick={() => setInfoOpen((open) => !open)}
              >
                i
              </button>
              {infoOpen ? (
                <div
                  className="absolute bottom-full left-0 z-10 mb-1 w-[min(16rem,calc(100vw-3rem))] rounded-lg p-2.5"
                  style={{ backgroundColor: productTheme.eddTooltipBg }}
                  role="status"
                >
                  <p
                    className={cn('text-xs leading-normal font-normal', themeFonts.sans.className)}
                    style={{ color: productTheme.ink }}
                  >
                    {infoText}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </span>
        <span
          style={{
            color: productTheme.ink,
            fontWeight: emphasis ? 700 : 400,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function getGstPercent(gst: number, subtotal: number): number {
  if (subtotal <= 0) {
    return 3;
  }

  const percent = Math.round((gst / subtotal) * 100);

  return percent > 0 ? percent : 3;
}

function MetricSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full" style={{ borderBottom: `0.5px solid ${productTheme.borderHairline}` }}>
      <h3
        className={cn('laptop:py-1 laptop:text-sm py-0.5 text-xs font-normal', rowSideInset)}
        style={{ color: productTheme.ink }}
      >
        {title}
      </h3>
      <div
        className={cn(
          'laptop:mt-2 laptop:pb-3 mt-1 flex w-full min-w-0 items-start justify-between gap-2 pb-1.5',
          rowSideInset,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function getMetalTitle(price: MtoPrice): string {
  if (price.title.trim()) {
    return price.title;
  }

  return [price.purityDisplay, price.metal].filter(Boolean).join(' ').trim() || 'Gold';
}

export function GoldPriceBreakupContent({ price }: GoldPriceBreakupContentProps) {
  const metalTitle = getMetalTitle(price);
  const gstPercent = getGstPercent(price.gst, price.subtotal);
  const showDiamondSection = price.diamondPrice > 0 || price.noOfDiamonds > 0;
  const finalPrice = resolveGoldFinalPrice(price);

  return (
    <div className="laptop:pb-3 w-full min-w-0 pb-2">
      <div className="laptop:space-y-3 w-full min-w-0 space-y-2">
        <MetricSection title={metalTitle}>
          <MetricColumn label="Rate" value={formatPrice(price.pricePerGram)} align="start" />
          <MetricColumn label="Weight" value={`${price.goldWeightGrams} g`} align="center" />
          <MetricColumn label="Final Value" value={formatPrice(price.basePrice)} align="end" />
        </MetricSection>

        {showDiamondSection ? (
          <MetricSection title="Diamond">
            <MetricColumn label="Weight" value={`${price.diamondWeightCarat} ct`} align="start" />
            <MetricColumn label="Count" value={String(price.noOfDiamonds)} align="center" />
            <MetricColumn label="Final Value" value={formatPrice(price.diamondPrice)} align="end" />
          </MetricSection>
        ) : null}

        <div className="laptop:space-y-0 w-full">
          <ChargeRow label="Making Charges" value={formatPrice(price.makingCharge)} />
          <ChargeRow label={`GST(${gstPercent}%)`} value={formatPrice(price.gst)} />
          <ChargeRow
            label={productMessages.grandTotal}
            value={formatPrice(price.totalPrice)}
            emphasis
            infoLabel={productMessages.a11y.grandTotalInfo}
            infoText={productMessages.grandTotalInfo}
          />
          {finalPrice != null ? (
            <ChargeRow
              label={productMessages.finalPrice}
              value={formatPrice(finalPrice)}
              emphasis
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
