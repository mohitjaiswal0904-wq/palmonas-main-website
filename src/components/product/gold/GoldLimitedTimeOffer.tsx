'use client';

import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';

import { CopyIcon } from '@/components/icons';
import { AppLink } from '@/components/navigation/AppLink';
import { FreebieImagePreview } from '@/components/product/FreebieImagePreview';
import {
  LIMITED_OFFER_RIBBON_GEOMETRY,
  LimitedOfferRibbon,
} from '@/components/product/gold/LimitedOfferRibbon';
import { productConfig, productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import type { GoldLimitedTimeOfferView } from '@/lib/product/gold-limited-time-offer';
import { cn } from '@/lib/utils/cn';

const FLAT_PERCENT_TITLE = /^(Flat\s+\d+%)(\s[\s\S]*)?$/i;
const RUPEE_AMOUNT = /(₹[\d,]+)/;

/**
 * Emphasizes "Flat N%" or a ₹ amount in a gold limited-time offer title.
 *
 * @param title - API offer name.
 * @returns Title nodes with the discount or rupee phrase emphasized when present.
 */
function formatGoldLimitedOfferTitle(title: string): ReactNode {
  const flatMatch = title.match(FLAT_PERCENT_TITLE);

  if (flatMatch) {
    return (
      <>
        <span className={productTheme.limitedOffer.titleEmphasisClass}>{flatMatch[1]}</span>
        {flatMatch[2] ?? ''}
      </>
    );
  }

  const rupeeParts = title.split(RUPEE_AMOUNT);

  if (rupeeParts.length < 3) {
    return title;
  }

  return rupeeParts.map((part, index) =>
    RUPEE_AMOUNT.test(part) ? (
      <span
        key={`${part}-${index}`}
        className={productTheme.limitedOffer.titleEmphasisClass}
        style={{ color: productTheme.limitedOffer.titleEmphasisColor }}
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
}

interface GoldLimitedTimeOfferProps {
  offer: GoldLimitedTimeOfferView;
}

/**
 * Gold PDP limited-time offer (Figma 963:62352 / 960:33505 / 3514:43443).
 *
 * Ribbon SVG left-aligned to the content column (price / title). Cream bar is
 * inset by fold width so the path fold wall lands on the bar’s top-left corner.
 * Flash PNG matches Figma 960:33507. Freebie thumb uses API `freebie_image_url`.
 * View Details navigates to `freebie_route`; thumb opens an enlarged preview.
 */
export function GoldLimitedTimeOffer({ offer }: GoldLimitedTimeOfferProps) {
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const couponCode = offer.code.trim();
  const showCoupon = offer.showCouponCode && couponCode.length > 0;
  const freebieImageUrl = offer.freebieImageUrl.trim();
  const freebieRoute = offer.freebieRoute.trim();
  const showFreebieImage = freebieImageUrl.length > 0;
  const { limitedOffer } = productTheme;
  const { mobile, desktop } = LIMITED_OFFER_RIBBON_GEOMETRY;
  const copiedResetDelayMs = productConfig.timing.copiedResetDelayMs;
  const titleColor = showFreebieImage ? productTheme.gold.accent : productTheme.ink;

  const handleCopy = useCallback(() => {
    if (!couponCode) {
      return;
    }

    navigator.clipboard
      .writeText(couponCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), copiedResetDelayMs);
      })
      .catch(() => {
        setCopied(false);
      });
  }, [copiedResetDelayMs, couponCode]);

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <section
      className={cn('relative w-full min-w-0 overflow-visible', themeFonts.sans.className)}
      aria-label={productMessages.limitedTimeOffer}
    >
      {/* Shell left = content column. pt / fold from scaled ribbon geometry. */}
      <div
        className="laptop:pt-[var(--lto-band-lg)] relative -ml-2 w-full overflow-visible pt-[var(--lto-band)]"
        style={
          {
            '--lto-band': `${mobile.bandY}px`,
            '--lto-band-lg': `${desktop.bandY}px`,
            '--lto-fold': `${mobile.foldX}px`,
            '--lto-fold-lg': `${desktop.foldX}px`,
          } as CSSProperties
        }
      >
        <LimitedOfferRibbon />

        {/* Inset by foldX so fold wall sits on the bar corner. */}
        <div
          className={cn(
            'relative z-[1] ml-[var(--lto-fold)] w-[calc(100%-var(--lto-fold))]',
            'laptop:ml-[var(--lto-fold-lg)] laptop:w-[calc(100%-var(--lto-fold-lg))]',
            limitedOffer.barClass,
          )}
          style={{ backgroundImage: limitedOffer.bannerGradient }}
        >
          {/* Figma 960:33507 / 963:61944 — cover fill matches Dev Mode background CSS */}
          <span
            className={limitedOffer.flashClass}
            style={{ backgroundImage: `url(${limitedOffer.flashSrc})` }}
            aria-hidden
          />

          <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5">
            {offer.title ? (
              freebieRoute ? (
                <AppLink
                  href={freebieRoute}
                  className={cn(limitedOffer.titleClass, 'cursor-pointer')}
                  style={{ color: titleColor }}
                >
                  {formatGoldLimitedOfferTitle(offer.title)}
                </AppLink>
              ) : (
                <p className={limitedOffer.titleClass} style={{ color: titleColor }}>
                  {formatGoldLimitedOfferTitle(offer.title)}
                </p>
              )
            ) : null}
            {offer.showViewDetails && freebieRoute ? (
              <AppLink
                href={freebieRoute}
                className={cn(limitedOffer.subtitleClass, 'cursor-pointer underline')}
                style={{ color: limitedOffer.subtitle }}
              >
                {productMessages.viewDetails}
              </AppLink>
            ) : offer.description ? (
              <p className={limitedOffer.subtitleClass} style={{ color: limitedOffer.subtitle }}>
                {offer.description}
              </p>
            ) : null}
          </div>

          {showFreebieImage ? (
            <button
              type="button"
              className="ml-auto shrink-0 cursor-pointer self-center overflow-hidden rounded-sm"
              aria-label={productMessages.a11y.enlargeFreebieImage}
              onClick={openPreview}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS/CDN freebie URLs */}
              <img
                src={freebieImageUrl}
                alt=""
                className={limitedOffer.freebieImageClass}
                data-testid="gold-limited-offer-freebie-image"
              />
            </button>
          ) : null}

          {showCoupon ? (
            <div className="ml-auto flex shrink-0 flex-col items-end justify-center self-center">
              <div
                className="laptop:gap-1 laptop:px-2.5 laptop:py-1 inline-flex items-center gap-1 border border-dashed px-2 py-1"
                style={{ borderColor: productTheme.coupon }}
              >
                <span className={limitedOffer.codeClass} style={{ color: productTheme.coupon }}>
                  {couponCode}
                </span>
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center"
                  aria-label={copied ? `Copied ${couponCode}` : `Copy coupon code ${couponCode}`}
                  onClick={handleCopy}
                >
                  <CopyIcon className="laptop:size-4 size-[14px]" />
                </button>
              </div>
              {copied ? (
                <p
                  className="mt-1 text-xs"
                  style={{ color: productTheme.success }}
                  aria-live="polite"
                >
                  {productMessages.copied}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showFreebieImage ? (
        <FreebieImagePreview open={isPreviewOpen} src={freebieImageUrl} onClose={closePreview} />
      ) : null}
    </section>
  );
}
