'use client';

import { Nunito_Sans as NunitoSans } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

import { PincodeInfoIcon, PincodePhoneIcon, PincodeStoreIcon } from '@/components/icons';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';
import { formatOrdinalDeliveryDate } from '@/lib/utils/format';
import type { EddResult, EddStoreDetails } from '@/types/edd';
import { PRODUCT_CATEGORY, type ProductCategory } from '@/types/product';

const nunitoSansBold = NunitoSans({
  subsets: ['latin'],
  weight: '700',
});

const nunitoSansRegular = NunitoSans({
  subsets: ['latin'],
  weight: '400',
});

interface PincodeDeliveryResultProps {
  result: EddResult;
  onChange: () => void;
  productCategory?: ProductCategory;
}

/**
 * Build a tel: href from store phone digits.
 *
 * @param phone - Raw phone string from EDD store payload.
 * @returns Normalized `tel:` URL.
 */
function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    return `tel:+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `tel:+91${digits.slice(1)}`;
  }

  return `tel:${digits}`;
}

interface StoreActionsProps {
  store: EddStoreDetails;
  storeCtaColor: string;
}

/** Call / visit CTAs for the nearest-store block. */
function StoreActions({ store, storeCtaColor }: StoreActionsProps) {
  return (
    <div className="flex">
      <a
        href={toTelHref(store.phone)}
        className={cn(
          'flex h-[33px] flex-1 items-center justify-center gap-1 rounded-bl-lg border-[0.5px] bg-white text-xs font-normal',
          nunitoSansRegular.className,
        )}
        style={{
          borderColor: productTheme.borderSubtle,
          color: storeCtaColor,
        }}
        aria-label={`Call ${store.storeName} store`}
        data-analytics-event={analyticsCanonicalEvents.callStoreClicked}
        data-analytics-props={JSON.stringify({ store_name: store.storeName })}
      >
        <PincodePhoneIcon />
        {productMessages.callStore}
      </a>
      <a
        href={store.mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex h-[33px] flex-1 items-center justify-center gap-1 rounded-br-lg border-[0.5px] bg-white text-xs font-normal',
          nunitoSansRegular.className,
        )}
        style={{
          borderColor: productTheme.borderSubtle,
          color: storeCtaColor,
        }}
        aria-label={`Visit ${store.storeName} store on map`}
        data-analytics-event={analyticsCanonicalEvents.visitStoreClicked}
        data-analytics-props={JSON.stringify({ store_name: store.storeName })}
      >
        <PincodeStoreIcon />
        {productMessages.visitStore}
      </a>
    </div>
  );
}

/**
 * Checked-pincode delivery card (Figma mobile + desktop).
 * Gold: simplified delivery row + sticky MTO tooltip. Demifine: NOW strip + prior layout.
 */
export function PincodeDeliveryResult({
  result,
  onChange,
  productCategory = PRODUCT_CATEGORY.DEMIFINE,
}: PincodeDeliveryResultProps) {
  const deliveryDate = formatOrdinalDeliveryDate(result.edd);
  const store = result.store;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRootRef = useRef<HTMLDivElement>(null);
  const isGold = productCategory === PRODUCT_CATEGORY.GOLD;
  const showGoldTooltip = isGold && isProductFeatureEnabled('eddInfoTooltip');
  const orderWithin = result.orderWithin.trim();
  const goldTooltipText = productMessages.eddInfoTooltip;
  const pincodeColor = isGold ? productTheme.gold.accent : productTheme.ink;
  const storeCtaColor = isGold ? productTheme.gold.accent : productTheme.ink;

  // Gold PDP: dismiss sticky tooltip when the shopper taps or clicks outside the info control.
  useEffect(() => {
    if (!showGoldTooltip || !tooltipOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (tooltipRootRef.current?.contains(target)) {
        return;
      }

      setTooltipOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [showGoldTooltip, tooltipOpen]);

  return (
    <div className="laptop:space-y-2 space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <p className="laptop:text-base text-sm capitalize">
          <span
            className={cn('font-normal', nunitoSansRegular.className)}
            style={{ color: productTheme.ink }}
          >
            {productMessages.deliverTo}
          </span>
          <span
            className={cn('font-bold', nunitoSansBold.className)}
            style={{ color: pincodeColor }}
          >
            {result.pincode}
          </span>
        </p>
        <button
          type="button"
          onClick={onChange}
          className={cn('laptop:text-sm text-xs font-bold', nunitoSansBold.className)}
          style={{ color: productTheme.ink }}
          aria-label={productMessages.a11y.changePincode}
        >
          {productMessages.changePincode}
        </button>
      </div>

      {isGold ? (
        <div className="relative" ref={tooltipRootRef}>
          <div
            className={cn(
              'laptop:rounded-[12px] laptop:p-3 flex items-center gap-2 rounded-[8px] border-[0.5px] bg-white p-2',
            )}
            style={{ borderColor: productTheme.borderSubtle }}
          >
            <p
              className={cn(
                productTheme.typography.pdpBodyClass,
                'min-w-0 flex-1 leading-normal',
                nunitoSansRegular.className,
              )}
              style={{ color: productTheme.ink }}
            >
              {productMessages.freeDeliveryBy}
              <span className={cn('font-bold', nunitoSansBold.className)}>{deliveryDate}</span>.
            </p>
            {showGoldTooltip ? (
              <button
                type="button"
                className="shrink-0 cursor-pointer"
                aria-label={goldTooltipText}
                aria-expanded={tooltipOpen}
                onClick={() => setTooltipOpen((open) => !open)}
              >
                <PincodeInfoIcon />
              </button>
            ) : null}
          </div>

          {showGoldTooltip && tooltipOpen ? (
            <div
              className="absolute top-full right-0 z-20 mt-1.5 w-[min(291px,calc(100vw-2rem))]"
              role="status"
            >
              <div
                className="laptop:right-[14.5px] absolute -top-1.5 right-[10.5px] size-3 rotate-45"
                style={{ backgroundColor: productTheme.eddTooltipBg }}
                aria-hidden
              />
              <div
                className="laptop:px-4 laptop:py-3 relative rounded-xl px-3.5 py-2.5"
                style={{ backgroundColor: productTheme.eddTooltipBg }}
              >
                <p
                  className={cn(
                    'laptop:text-sm text-center text-xs leading-normal tracking-wide',
                    nunitoSansRegular.className,
                  )}
                  style={{ color: productTheme.ink }}
                >
                  {goldTooltipText}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative">
          <div
            className="laptop:rounded-[12px] overflow-hidden rounded-[8px] border-[0.5px]"
            style={{ borderColor: productTheme.borderSubtle }}
          >
            <div
              className="laptop:px-2.5 laptop:py-1.5 flex items-center gap-1 px-2 py-1"
              style={{ backgroundImage: productTheme.nowBannerGradient }}
            >
              <span
                className={cn(
                  productTheme.typography.pdpMetaClass,
                  'font-bold italic',
                  nunitoSansBold.className,
                )}
                style={{ color: productTheme.nowAccent }}
              >
                {productMessages.nowLabel}
              </span>
            </div>

            <div className="laptop:p-3 flex items-start gap-1 bg-white p-2">
              <p
                className={cn(
                  productTheme.typography.pdpBodyClass,
                  'min-w-0 flex-1 leading-normal',
                  nunitoSansRegular.className,
                )}
                style={{ color: productTheme.ink }}
              >
                {productMessages.freeDeliveryBy}
                <span className={cn('font-bold', nunitoSansBold.className)}>{deliveryDate}</span>
                {orderWithin ? (
                  <>
                    . {productMessages.orderWithin}
                    <span className={cn('font-bold', nunitoSansBold.className)}>{orderWithin}</span>
                    .
                  </>
                ) : (
                  '.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {store ? (
        isGold ? (
          <div className="overflow-hidden rounded-[8px]">
            <div className="px-1.5 py-1" style={{ backgroundColor: productTheme.gold.accent }}>
              <p
                className={cn(
                  productTheme.typography.pdpMetaClass,
                  'leading-normal text-white',
                  nunitoSansRegular.className,
                )}
              >
                {productMessages.visitNearestStore}
                <span className={cn('font-bold', nunitoSansBold.className)}>{store.storeName}</span>
              </p>
            </div>
            <StoreActions store={store} storeCtaColor={storeCtaColor} />
          </div>
        ) : (
          <div
            className="laptop:rounded-[12px] overflow-hidden rounded-[8px] border-[0.5px]"
            style={{ borderColor: productTheme.borderSubtle }}
          >
            <div className="px-1.5 py-1" style={{ backgroundColor: productTheme.nowSurface }}>
              <p
                className={cn(
                  productTheme.typography.pdpMetaClass,
                  'leading-normal',
                  nunitoSansRegular.className,
                )}
                style={{ color: productTheme.ink }}
              >
                {productMessages.visitNearestStore}
                <span className={cn('font-bold', nunitoSansBold.className)}>{store.storeName}</span>
              </p>
            </div>
            <StoreActions store={store} storeCtaColor={storeCtaColor} />
          </div>
        )
      ) : null}
    </div>
  );
}
