'use client';

/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */

import { cn } from '@/lib/utils/cn';

interface CmsCategoryTileProps {
  label: string;
  imageUrl?: string;
  onClick: () => void;
  className?: string;
}

export function CmsCategoryTile({ label, imageUrl, onClick, className }: CmsCategoryTileProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full cursor-pointer flex-col items-center gap-2.5 text-center transition-opacity hover:opacity-90',
        className,
      )}
      onClick={onClick}
      aria-label={label}
    >
      <div className="relative aspect-square w-full max-w-[12.5rem] bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-stone-100" />
        )}
      </div>
      <span className="w-full max-w-[9rem] text-center text-lg leading-normal font-normal break-words text-stone-950">
        {label}
      </span>
    </button>
  );
}
