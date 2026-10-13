import Image from 'next/image';
import Link from 'next/link';

import { SHRADDHAS_FAVOURITE_BESTSELLERS_SECTION_ID } from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import { shraddhasFavouriteImages } from '@/config/shraddhas-favourite.config';

export function ShraddhasFavouriteHero() {
  return (
    <section aria-label="Shraddha's Favourite hero" className="w-full overflow-hidden bg-[#f8e4e9]">
      <Link
        href={`#${SHRADDHAS_FAVOURITE_BESTSELLERS_SECTION_ID}`}
        className="laptop:hidden relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
        aria-label="Shop Shraddha's Favourite collection"
      >
        <Image
          src={shraddhasFavouriteImages.heroMobile}
          alt="Shraddha's Favourite — The Personal Edit"
          width={750}
          height={1000}
          priority
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </Link>

      <Link
        href={`#${SHRADDHAS_FAVOURITE_BESTSELLERS_SECTION_ID}`}
        className="laptop:block relative hidden w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
        aria-label="Shop Shraddha's Favourite collection"
      >
        <Image
          src={shraddhasFavouriteImages.heroDesktop}
          alt="Shraddha's Favourite — The Personal Edit"
          width={1920}
          height={640}
          priority
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </Link>
    </section>
  );
}
