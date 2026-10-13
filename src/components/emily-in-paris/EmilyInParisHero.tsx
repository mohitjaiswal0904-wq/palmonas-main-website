import Link from 'next/link';

import { EMILY_IN_PARIS_LISTING_SECTION_ID } from '@/components/emily-in-paris/emily-in-paris-constants';
import { emilyInParisImages } from '@/config/emily-in-paris.config';

export function EmilyInParisHero() {
  return (
    <section aria-label="Emily in Paris hero" className="w-full overflow-hidden bg-[#151515]">
      <Link
        href={`#${EMILY_IN_PARIS_LISTING_SECTION_ID}`}
        className="relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
        aria-label="Shop Emily in Paris collection"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={emilyInParisImages.hero}
          src={emilyInParisImages.heroVideo}
          className="h-auto w-full object-cover"
          aria-label="Emily in Paris x Palmonas campaign video"
        />
      </Link>
    </section>
  );
}
