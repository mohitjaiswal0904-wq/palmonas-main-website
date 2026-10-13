'use client';

import type { ReactNode } from 'react';

import { HomePageCategoryTabs } from '@/components/home/HomePageCategoryTabs';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import type { HomePageCategoryId } from '@/config/home-page-categories.config';
import { useHomePageCategoryNavigation } from '@/hooks/home/useHomePageCategoryNavigation';

interface HomeCmsPageContentProps {
  activeCategory: HomePageCategoryId;
  children: ReactNode;
}

/**
 * Home main column: persistent category tabs + CMS body (or body skeleton while switching).
 * Inactive categories are prefetched so the skeleton window stays short.
 */
export function HomeCmsPageContent({ activeCategory, children }: HomeCmsPageContentProps) {
  const {
    activeCategory: displayCategory,
    handleSelect,
    prefetchCategory,
    isPending,
  } = useHomePageCategoryNavigation(activeCategory);

  return (
    <>
      <div className="tab:mt-4 tab:mb-5 flex justify-center">
        <section
          className="tab:block tab:px-6 tab:pt-3 laptop:px-8 hidden px-4 pt-4"
          aria-label="Home page categories"
        >
          <HomePageCategoryTabs
            activeCategory={displayCategory}
            onSelect={handleSelect}
            onPrefetch={prefetchCategory}
            isPending={isPending}
          />
        </section>
      </div>
      {isPending ? <HomePageSkeleton variant="body" /> : children}
    </>
  );
}
