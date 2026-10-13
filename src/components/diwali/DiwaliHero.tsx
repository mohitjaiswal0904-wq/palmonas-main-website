import Image from 'next/image';

import { diwaliMessages } from '@/config/diwali/diwali.config';

interface DiwaliHeroProps {
  imageUrl: string;
  imageAlt: string;
}

/**
 * Full-width Friday Drop banner. Height follows the artwork so the headline is not cropped.
 */
export function DiwaliHero({ imageUrl, imageAlt }: DiwaliHeroProps) {
  return (
    <section aria-label={diwaliMessages.a11y.hero} className="overflow-hidden bg-white">
      <Image
        src={imageUrl}
        alt={imageAlt}
        width={2512}
        height={3154}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
    </section>
  );
}
