'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, type KeyboardEvent } from 'react';

import { cn } from '@/lib/utils/cn';
import type { BlogArticle } from '@/types/blog';

interface BlogCardProps {
  article: BlogArticle;
  className?: string;
}

/**
 * Listing / related-article card with full-bleed image and floating date badge.
 */
export function BlogCard({ article, className }: BlogCardProps) {
  const router = useRouter();
  const articleHref = `/blogs/${article.handle}`;

  const handleNavigate = useCallback(() => {
    router.push(articleHref);
  }, [articleHref, router]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavigate();
      }
    },
    [handleNavigate],
  );

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Read ${article.title}`}
      className={cn(
        'relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[#0000001A] bg-white',
        className,
      )}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-palmonas-soft h-full w-full" aria-hidden="true" />
        )}
        <div
          className="laptop:size-[73px] absolute top-3 right-3 flex size-[50px] flex-col items-center justify-center rounded-full bg-white shadow-sm"
          aria-hidden="true"
        >
          <div className="border-palmonas-border laptop:h-[35px] laptop:min-w-[37px] flex h-[25px] min-w-[27px] items-center justify-center border-b">
            <span className="font-nunito-sans laptop:text-xl text-base leading-none font-bold text-black">
              {article.publishedDay}
            </span>
          </div>
          <span className="font-nunito-sans pt-1 text-xs leading-none tracking-[1px] text-black uppercase">
            {article.publishedMonth}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-4 pb-5">
        <h2 className="font-nunito-sans line-clamp-2 text-xl leading-6 font-semibold text-black">
          {article.title}
        </h2>
        <p className="font-nunito-sans line-clamp-2 min-h-[3rem] text-[13px] leading-6 text-[#868686]">
          {article.excerpt}
        </p>
      </div>
    </article>
  );
}
