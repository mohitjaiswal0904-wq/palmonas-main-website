'use client';

import { Children, type ReactNode } from 'react';

import { DemifineProductUsp } from '@/components/product/DemifineProductUsp';
import { ProductTags } from '@/components/product/ProductTags';
import {
  productMessages,
  productTheme,
  productUspRules,
  demifinePreDealsConfig,
} from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';
import type { ProductTag, ProductUspId } from '@/types/product';

interface DemifinePreDealsSectionProps {
  quantityOrdered30Days?: number;
  /** Header tags — ships-in-24h sits with the USP strip, not under the title. */
  tags?: ProductTag[];
  /** Product API `usps` — drives the badge strip under the title. */
  usps?: readonly ProductUspId[];
  /** Offer cards grouped under the trust cluster. */
  children?: ReactNode;
}

const DEFAULT_PRE_DEALS_USPS = [
  ...productUspRules.always,
  productUspRules.defaultThird,
] as ProductUspId[];

/**
 * Replaces `{{token}}` placeholders in configured copy strings.
 *
 * @param template - Message template containing optional placeholders.
 * @param values - Token values to inject.
 * @returns Interpolated copy string.
 */
function fillMessageTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (message, [token, value]) => message.replaceAll(`{{${token}}}`, value),
    template,
  );
}

/** USP badges, selling-fast strip, then offer children. */
export function DemifinePreDealsSection({
  quantityOrdered30Days,
  tags,
  usps,
  children,
}: DemifinePreDealsSectionProps) {
  const offerChildren = Children.toArray(children).filter(Boolean);
  const sellingFastDays = String(demifinePreDealsConfig.sellingFast.days);
  const sellingFastSuffix = fillMessageTemplate(productMessages.sellingFastSuffix, {
    days: sellingFastDays,
  });

  return (
    <>
      <section
        className={productTheme.pdpRhythm.clusterClass}
        aria-label={productMessages.a11y.demifineTrustPills}
      >
        <ProductTags tags={tags} />
        <DemifineProductUsp usps={usps?.length ? usps : DEFAULT_PRE_DEALS_USPS} />

        {quantityOrdered30Days != null ? (
          <div
            className={productTheme.sellingFastBanner.wrapClass}
            role="status"
            aria-label={productMessages.a11y.sellingFastStatus}
          >
            <div className={productTheme.sellingFastBanner.barClass}>
              <p
                className={cn(
                  productTheme.typography.pdpMetaClass,
                  'relative min-w-0 leading-snug',
                )}
              >
                <span
                  className={productTheme.sellingFastBanner.countClass}
                  style={{ color: productTheme.sellingFastBanner.countColor }}
                >
                  {quantityOrdered30Days.toLocaleString('en-IN')}
                </span>
                <span style={{ color: productTheme.titleMuted }}>{sellingFastSuffix}</span>
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {offerChildren.length > 0 ? (
        <div className={productTheme.pdpRhythm.promoClusterClass}>{offerChildren}</div>
      ) : null}
    </>
  );
}
