import Image from 'next/image';
import Link from 'next/link';

import type { ShraddhasFavouriteStoryItem } from '@/config/shraddhas-favourite.config';
import { cn } from '@/lib/utils/cn';

interface ShraddhasFavouriteStoryMilestoneCardProps {
  item: ShraddhasFavouriteStoryItem;
  rotationClass: string;
  offsetClass: string;
}

export function ShraddhasFavouriteStoryMilestoneCard({
  item,
  rotationClass,
  offsetClass,
}: ShraddhasFavouriteStoryMilestoneCardProps) {
  return (
    <article className={`flex flex-col items-center ${offsetClass}`}>
      <div
        className={cn(
          'tab:max-w-[240px] laptop:max-w-[260px] relative mx-auto w-full max-w-[220px]',
          rotationClass,
        )}
      >
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          width={520}
          height={620}
          className="h-auto w-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          sizes="(max-width: 768px) 220px, 260px"
        />
      </div>

      <div className="tab:mt-6 mt-5 flex w-full max-w-[280px] flex-col items-center text-center">
        <h3 className="font-nunito-sans tab:text-xl text-lg leading-snug font-bold text-[#151515]">
          {item.title}
        </h3>
        <p className="font-nunito-sans tab:text-base mt-2 text-sm leading-normal font-normal text-[#666]">
          {item.description}
        </p>
        <Link
          href={item.href}
          className="font-nunito-sans tab:mt-5 tab:px-6 tab:text-base mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#151515] px-5 py-2 text-sm leading-normal font-normal text-white transition-colors hover:bg-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
          aria-label={item.ctaLabel}
        >
          {item.ctaLabel} →
        </Link>
      </div>
    </article>
  );
}
