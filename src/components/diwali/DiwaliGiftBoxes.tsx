import Image from 'next/image';
import Link from 'next/link';

import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import { DiwaliSectionHeading } from '@/components/diwali/DiwaliSectionHeading';
import {
  DIWALI_CARD_BAND_CLASS,
  DIWALI_CARD_COLUMN_CLASS,
  DIWALI_CARD_CTA_CLASS,
  DIWALI_OUTLINE_BUTTON_CLASS,
  DIWALI_SECTION_CLASS,
} from '@/components/diwali/diwali-constants';
import { diwaliHandles, diwaliImages, diwaliMessages } from '@/config/diwali/diwali.config';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { Product } from '@/types/product';

interface DiwaliGiftBoxesProps {
  products: Product[];
}

/**
 * Gift-box hero plus a horizontal product rail.
 */
export function DiwaliGiftBoxes({ products }: DiwaliGiftBoxesProps) {
  const copy = diwaliMessages.giftBoxes;
  const href = resolveCollectionPagePath(diwaliHandles.giftBoxes);

  return (
    <div className="diwali-festive-band my-4">
      <section aria-labelledby="diwali-gift-boxes-heading" className={DIWALI_SECTION_CLASS}>
        <DiwaliSectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          titleId="diwali-gift-boxes-heading"
        />

        <div
          className={cn(
            DIWALI_CARD_COLUMN_CLASS,
            'mt-4 flex flex-col items-center gap-3 rounded-xl border border-[#E8B84A]/60 bg-white pb-3',
          )}
        >
          <div
            className={cn(DIWALI_CARD_BAND_CLASS, 'laptop:aspect-[16/10] rounded-xl bg-[#EFEBE6]')}
          >
            <Image
              src={diwaliImages.giftBoxHero}
              alt={diwaliImages.giftBoxHeroAlt}
              fill
              sizes="328px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1 px-3 text-center">
            <p className="text-[10px] font-bold tracking-wide text-[#222222] uppercase">
              {copy.kicker}
            </p>
            <p className="font-nunito-sans text-lg font-bold text-[#222222]">{copy.price}</p>
            <Link
              href={href}
              className={cn(
                DIWALI_CARD_CTA_CLASS,
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5D0424]',
              )}
              aria-label={copy.cta}
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <div role="region" aria-label={diwaliMessages.a11y.giftRail}>
          <CmsProductGrid
            products={products}
            collectionHandle={diwaliHandles.giftBoxes}
            className="mt-4"
          />
        </div>
      ) : null}

      <div className={cn(DIWALI_SECTION_CLASS, 'pt-2')}>
        <div className="flex justify-center">
          <Link href={href} className={DIWALI_OUTLINE_BUTTON_CLASS} aria-label={copy.viewAll}>
            {copy.viewAll}
          </Link>
        </div>
      </div>
    </div>
  );
}
