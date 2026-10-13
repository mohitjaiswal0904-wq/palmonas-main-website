import Image from 'next/image';
import Link from 'next/link';

import { EMILY_IN_PARIS_LISTING_SECTION_ID } from '@/components/emily-in-paris/emily-in-paris-constants';
import { emilyInParisImages } from '@/config/emily-in-paris.config';

export function EmilyInParisPromoBanner() {
  return (
    <section
      aria-label="Emily in Paris collection banner"
      className="tab:py-10 laptop:py-12 w-full py-8"
    >
      <Link
        href={`#${EMILY_IN_PARIS_LISTING_SECTION_ID}`}
        className="relative block w-full overflow-hidden bg-[#FCEBF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
        aria-label="Shop the full Emily in Paris collection"
      >
        <Image
          src={emilyInParisImages.hero}
          alt="Emily in Paris x Palmonas collection"
          width={1920}
          height={800}
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </Link>
    </section>
  );
}
