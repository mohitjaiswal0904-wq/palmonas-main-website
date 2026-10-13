import Image from 'next/image';

import { hasCollectionBannerImage } from '@/lib/utils/collection-banner';
import type { Collection } from '@/types/collection';

interface CollectionBannerProps {
  collection: Collection;
}

export function CollectionBanner({ collection }: CollectionBannerProps) {
  if (!hasCollectionBannerImage(collection)) {
    return null;
  }

  const bannerSrc = collection.image?.trim() ?? '';

  return (
    <section className="overflow-hidden bg-white">
      <div className="tab:aspect-[3/1] laptop:aspect-[3/1] relative aspect-[3/1] w-screen bg-[#f8e4e9]">
        {/* <div className="absolute top-4 left-4 z-10 text-white [&_button]:text-white">
          <CollectionBackButton />
        </div> */}
        <Image
          src={bannerSrc}
          alt={collection.imageAlt ?? collection.title}
          fill
          priority
          sizes="100vw"
          className="h-auto w-full object-cover"
        />
        {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/70 to-transparent p-5 text-center">
          <div className="container">
            <p className="font-eb-garamond tab:text-5xl text-3xl tracking-wide text-white">
              {collection.title}
            </p>
            <p className="tab:text-sm mt-1 text-[10px] text-white/80">
              For the most precious everyday glow
            </p>
          </div>
        </div> */}
      </div>
    </section>
  );
}
