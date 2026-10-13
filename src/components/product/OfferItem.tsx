'use client';

import { useCallback, useState } from 'react';

import { AppLink } from '@/components/navigation/AppLink';
import { FreebieImagePreview } from '@/components/product/FreebieImagePreview';
import { productConfig, productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/format-price';
import { parseBuyNAtOffer } from '@/lib/product/bundle-offer';
import { cn } from '@/lib/utils/cn';
import type { ProductOffer } from '@/types/product';

interface OfferItemProps {
  offer: ProductOffer;
}

/** Renders one PDP offer card with name, optional description, and copyable coupon code. */
export function OfferItem({ offer }: OfferItemProps) {
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { showSuccess } = useToast();
  const couponKey = (offer.code || offer.key || '').trim();
  const bundleOffer = parseBuyNAtOffer(offer);
  const title = bundleOffer
    ? productMessages.formatBundleUnitTitle(formatPrice(bundleOffer.unitPrice))
    : offer.name;
  const apiDescription =
    (offer.description ?? '').trim() ||
    (offer.placeholder ?? []).find((entry) => entry.text?.trim())?.text.trim() ||
    '';
  const description =
    apiDescription ||
    (bundleOffer
      ? productMessages.formatBundleUnitHint(
          bundleOffer.quantity - 1,
          formatPrice(bundleOffer.unitPrice),
        )
      : '');
  const showCouponCode = offer.discountCategory !== 'display';
  const freebieImageUrl = offer.freebieImageUrl?.trim() ?? '';
  const freebieRoute = offer.freebieRoute?.trim() ?? '';
  const showFreebieImage = freebieImageUrl.length > 0;
  const copyLabel = copied ? `Copied ${couponKey}` : `Copy coupon code ${couponKey}`;

  /** Copies the coupon code to the clipboard and confirms with a toast. */
  const handleCopy = useCallback(() => {
    if (!couponKey) {
      return;
    }

    navigator.clipboard
      .writeText(couponKey)
      .then(() => {
        setCopied(true);
        showSuccess(productMessages.copied);
        window.setTimeout(() => setCopied(false), productConfig.timing.copiedResetDelayMs);
      })
      .catch(() => {
        setCopied(false);
      });
  }, [couponKey, showSuccess]);

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <article
      className={cn(productTheme.offerCard.cardClass, themeFonts.sans.className)}
      style={{
        borderColor: productTheme.offerCard.border,
        boxShadow: productTheme.offerCard.shadow,
        backgroundImage: productTheme.offerCard.wash,
      }}
    >
      <div className="flex min-w-0 items-start gap-3">
        {showFreebieImage ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer overflow-hidden rounded-md"
            aria-label={productMessages.a11y.enlargeFreebieImage}
            onClick={openPreview}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS/CDN freebie URLs */}
            <img
              src={freebieImageUrl}
              alt=""
              className="size-10 shrink-0 object-cover"
              data-testid="offer-item-freebie-image"
            />
          </button>
        ) : (
          <span className="relative mt-0.5 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 40 40" className="h-10 w-10">
              <rect
                x="6"
                y="11"
                width="24"
                height="18"
                rx="3"
                fill={productTheme.offerCard.ticketFill}
                stroke={productTheme.offerCard.ticketStroke}
                strokeWidth="1.6"
              />
              <path
                d="M10 20h16"
                stroke={productTheme.offerCard.ticketStroke}
                strokeWidth="1.4"
                strokeDasharray="2 2"
              />
            </svg>
            <span
              className="absolute -right-0.5 bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: productTheme.offerCard.percentBg }}
            >
              %
            </span>
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {freebieRoute ? (
            <AppLink
              href={freebieRoute}
              className={cn(productTheme.offerCard.titleClass, 'cursor-pointer')}
              style={{ color: productTheme.ink }}
            >
              {title}
            </AppLink>
          ) : (
            <p className={productTheme.offerCard.titleClass} style={{ color: productTheme.ink }}>
              {title}
            </p>
          )}

          {description || freebieRoute ? (
            <p
              className={cn(productTheme.offerCard.bodyClass, description && 'line-clamp-2')}
              style={{ color: productTheme.offerDescription }}
            >
              {description}
              {description && freebieRoute ? ' ' : null}
              {freebieRoute ? (
                <AppLink
                  href={freebieRoute}
                  className="cursor-pointer font-semibold whitespace-nowrap"
                  style={{ color: productTheme.ink }}
                >
                  {productMessages.seeDetails}
                </AppLink>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      {showCouponCode ? (
        <div
          className={productTheme.offerCard.stripClass}
          style={{
            backgroundColor: productTheme.offerCard.stripBg,
            borderColor: productTheme.offerCard.stripBorder,
          }}
        >
          <span
            className={productTheme.offerCard.notchClass}
            style={{
              left: '-7px',
              borderColor: productTheme.offerCard.stripBorder,
            }}
            aria-hidden="true"
          />
          <span
            className={productTheme.offerCard.notchClass}
            style={{
              right: '-7px',
              borderColor: productTheme.offerCard.stripBorder,
            }}
            aria-hidden="true"
          />
          <span
            className="text-[13px] font-semibold tracking-wide"
            style={{ color: productTheme.ink }}
          >
            {couponKey}
          </span>
          <button
            type="button"
            className="text-[13px] font-semibold"
            style={{ color: productTheme.offerCard.collect }}
            aria-label={copyLabel}
            onClick={handleCopy}
            disabled={!couponKey}
          >
            {copied ? productMessages.copied : productMessages.collectOffer}
          </button>
        </div>
      ) : null}

      {showFreebieImage ? (
        <FreebieImagePreview open={isPreviewOpen} src={freebieImageUrl} onClose={closePreview} />
      ) : null}
    </article>
  );
}
