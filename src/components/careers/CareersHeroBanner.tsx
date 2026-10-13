import Image from 'next/image';

import { CAREERS_BANNER } from '@/config/careers.config';

/** Full-bleed responsive careers hero banner. */
export function CareersHeroBanner() {
  return (
    <section className="relative w-full" aria-label="Careers hero">
      <div className="tab:hidden relative aspect-[1440/2244] w-full">
        <Image
          src={CAREERS_BANNER.mobile.src}
          alt={CAREERS_BANNER.mobile.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="tab:block relative hidden aspect-[7680/3040] w-full">
        <Image
          src={CAREERS_BANNER.desktop.src}
          alt={CAREERS_BANNER.desktop.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
