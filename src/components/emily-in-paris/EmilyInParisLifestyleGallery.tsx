import Image from 'next/image';
import Link from 'next/link';

import { EmilyInParisHashtagMarquee } from '@/components/emily-in-paris/EmilyInParisHashtagMarquee';
import {
  EMILY_IN_PARIS_LISTING_SECTION_ID,
  EMILY_IN_PARIS_PAGE_PADDING_CLASS,
} from '@/components/emily-in-paris/emily-in-paris-constants';
import { emilyInParisImages } from '@/config/emily-in-paris.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';

const LIFESTYLE_CAROUSEL_CLASS = [
  'flex gap-3 overflow-x-auto',
  'snap-x snap-mandatory scroll-smooth',
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  'tab:gap-4',
].join(' ');

/** Horizontal snap carousel of lifestyle looks (mobile + desktop). */
export function EmilyInParisLifestyleGallery() {
  return (
    <section aria-label="For the Emily in you" className="pb-0">
      <EmilyInParisHashtagMarquee />

      <div className={EMILY_IN_PARIS_PAGE_PADDING_CLASS}>
        <div
          className={LIFESTYLE_CAROUSEL_CLASS}
          role="list"
          aria-label="Emily in Paris looks carousel"
          tabIndex={0}
        >
          {emilyInParisImages.looks.map((lookImage, index) => (
            <Link
              key={lookImage.src}
              href={`#${EMILY_IN_PARIS_LISTING_SECTION_ID}`}
              className="tab:w-[22vw] tab:max-w-[280px] block w-[72vw] max-w-[280px] shrink-0 snap-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
              role="listitem"
              aria-label={`Explore Emily in Paris look ${index + 1}`}
            >
              <Image
                src={lookImage.src}
                alt={lookImage.alt}
                width={lookImage.width}
                height={lookImage.height}
                className="h-auto w-full"
                sizes="(max-width: 768px) 72vw, 22vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
