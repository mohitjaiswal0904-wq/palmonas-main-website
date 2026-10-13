import Image from 'next/image';

import { shraddhasFavouriteImages } from '@/config/shraddhas-favourite.config';

export function ShraddhasFavouriteStoryTitle() {
  return (
    <div className="tab:mb-10 laptop:mb-12 mb-8 flex justify-center">
      <Image
        src={shraddhasFavouriteImages.storyTitle}
        alt="Shraddha Kapoor X Palmonas"
        width={800}
        height={48}
        className="tab:max-w-[640px] laptop:max-w-[800px] h-auto w-full max-w-[480px]"
        sizes="(max-width: 768px) 480px, 800px"
        priority={false}
      />
    </div>
  );
}
