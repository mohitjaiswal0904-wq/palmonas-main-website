import Link from 'next/link';

import { DiwaliSectionHeading } from '@/components/diwali/DiwaliSectionHeading';
import { DIWALI_SECTION_CLASS } from '@/components/diwali/diwali-constants';
import { diwaliHandles, diwaliMessages } from '@/config/diwali/diwali.config';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

/**
 * Gifting card: title and shop link.
 */
export function DiwaliGiftingBanner() {
  const copy = diwaliMessages.giftingBanner;
  const href = resolveCollectionPagePath(diwaliHandles.giftBoxes);

  return (
    <section aria-label={diwaliMessages.a11y.giftingBanner} className={DIWALI_SECTION_CLASS}>
      <div className="laptop:aspect-auto laptop:h-auto laptop:max-w-none laptop:min-h-80 mx-auto flex aspect-[328/161] w-full overflow-hidden rounded-lg border-2 border-[#E8B84A] bg-[#5D0424]">
        <div className="laptop:justify-between laptop:gap-6 laptop:p-10 flex min-w-0 flex-1 flex-col justify-center gap-2 p-3">
          <div className="laptop:block hidden">
            <DiwaliSectionHeading
              eyebrow={copy.eyebrow}
              title={copy.title}
              titleId="diwali-gifting-heading"
            />
          </div>
          <h2
            id="diwali-gifting-heading-compact"
            className="laptop:hidden text-xl leading-7 font-semibold tracking-tight text-[#FCE7B2]"
          >
            {copy.title}
          </h2>
          <Link
            href={href}
            className="laptop:min-h-11 laptop:px-5 inline-flex w-fit items-center justify-center rounded-full border border-[#E8B84A] bg-[#FCE7B2] px-3 py-1.5 text-sm font-bold text-[#5D0424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCE7B2]"
            aria-label={copy.cta}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
