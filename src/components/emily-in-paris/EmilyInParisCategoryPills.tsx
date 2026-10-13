import Image from 'next/image';
import Link from 'next/link';

import {
  EMILY_IN_PARIS_HEADING_FONT_CLASS,
  EMILY_IN_PARIS_LISTING_SECTION_ID,
  EMILY_IN_PARIS_SECTION_CLASS,
} from '@/components/emily-in-paris/emily-in-paris-constants';
import { emilyInParisCategories } from '@/config/emily-in-paris.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';

const CATEGORY_CAROUSEL_CLASS = [
  'flex gap-3 overflow-x-auto pb-2',
  'snap-x snap-mandatory scroll-smooth',
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  'tab:grid tab:grid-cols-3 tab:gap-3 tab:overflow-visible tab:pb-0',
  'laptop:grid-cols-5 laptop:gap-4',
].join(' ');

/**
 * Mobile: two category cards visible with remaining items in a snap carousel.
 * Tablet+: original grid (3 cols on tab, 5 on laptop).
 */
export function EmilyInParisCategoryPills() {
  return (
    <section aria-label="Shop Emily in Paris by category" className={EMILY_IN_PARIS_SECTION_CLASS}>
      <div
        className={CATEGORY_CAROUSEL_CLASS}
        role="list"
        aria-label="Emily in Paris categories"
        tabIndex={0}
      >
        {emilyInParisCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group tab:w-full tab:max-w-none flex w-[calc((100%-0.75rem)/2)] shrink-0 snap-start flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
            role="listitem"
            aria-label={`Shop ${category.label}`}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-white">
              <Image
                src={category.imageSrc}
                alt={category.imageAlt}
                fill
                sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span
              className={cn(
                'tab:py-4 tab:text-sm laptop:text-base py-3 text-center text-xs leading-tight tracking-wide text-[#151515] uppercase',
                EMILY_IN_PARIS_HEADING_FONT_CLASS,
              )}
            >
              {category.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="tab:mt-8 mt-6 flex justify-center">
        <Link
          href={`#${EMILY_IN_PARIS_LISTING_SECTION_ID}`}
          className={cn(
            'tab:min-h-14 tab:px-10 tab:text-base inline-flex min-h-12 items-center justify-center rounded-sm border border-[#151515] bg-[#151515] px-8 py-3 text-sm tracking-wide text-white uppercase transition-colors hover:bg-[#2A2A2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]',
            EMILY_IN_PARIS_HEADING_FONT_CLASS,
          )}
          aria-label="Explore all Emily in Paris products"
        >
          Explore All
        </Link>
      </div>
    </section>
  );
}
