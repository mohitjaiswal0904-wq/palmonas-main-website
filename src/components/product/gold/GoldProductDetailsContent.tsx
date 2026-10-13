'use client';

import { DiamondGuideIcon } from '@/components/icons/DiamondGuideIcon';
import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { useSizeGuide } from '@/providers/product/SizeGuideProvider';
import type { GoldProductDetails } from '@/types/gold-product-details';

interface GoldProductDetailsContentProps {
  details: GoldProductDetails;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="laptop:gap-2 laptop:px-3 laptop:py-0.5 laptop:text-sm flex items-center justify-between gap-1.5 px-2 py-1 text-xs leading-normal">
      <span style={{ color: productTheme.titleMuted }}>{label}</span>
      <span className="text-right font-normal" style={{ color: productTheme.titleMuted }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Gold PDP product-details accordion body (Figma panel + Diamond Guide CTA).
 *
 * @param details - Built metal / diamond / dimension sections.
 */
export function GoldProductDetailsContent({ details }: GoldProductDetailsContentProps) {
  const { openSizeGuide } = useSizeGuide();
  const showDiamondGuide = isProductFeatureEnabled('diamondGuide');

  return (
    <div className="laptop:space-y-3 laptop:px-1 laptop:pb-3 space-y-0.5 px-1 pb-3">
      {details.sections.map((section, sectionIndex) => {
        const isDiamondSection = section.title.toLowerCase().includes('diamond');

        return (
          <div key={section.title} className="laptop:space-y-2">
            {sectionIndex > 0 ? (
              <div
                className="laptop:mx-3 laptop:my-2 mx-2 my-1.5 h-px"
                style={{ backgroundColor: productTheme.borderHairline }}
              />
            ) : null}
            <div className="laptop:gap-1.5 laptop:px-3 laptop:py-1 flex items-center gap-1 px-2 py-0.5">
              <h4
                className="laptop:text-sm min-w-0 flex-1 text-xs font-normal"
                style={{ color: productTheme.ink }}
              >
                {section.title}
              </h4>
              {isDiamondSection && showDiamondGuide ? (
                <button
                  type="button"
                  className="laptop:text-sm inline-flex shrink-0 items-center gap-1 text-xs font-medium"
                  style={{ color: productTheme.gold.link }}
                  aria-label={productMessages.a11y.openDiamondGuide}
                  onClick={() => openSizeGuide({ kind: 'diamond' })}
                >
                  <DiamondGuideIcon className="laptop:size-4 size-[11px]" />
                  {productMessages.diamondGuide}
                </button>
              ) : null}
            </div>
            <div className="laptop:flex laptop:flex-col laptop:gap-2">
              {section.rows.map((row) => (
                <DetailRow
                  key={`${section.title}-${row.label}`}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
