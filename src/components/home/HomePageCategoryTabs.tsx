'use client';

import Image from 'next/image';

import { homePageCategories, type HomePageCategoryId } from '@/config/home-page-categories.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';

interface HomePageCategoryTabsProps {
  activeCategory: HomePageCategoryId;
  onSelect: (categoryId: HomePageCategoryId) => void;
  /** Warm RSC cache on hover/focus before click. */
  onPrefetch?: (categoryId: HomePageCategoryId) => void;
  isPending?: boolean;
}

/** Shared pill tabs for switching home page jewellery categories. */
export function HomePageCategoryTabs({
  activeCategory,
  onSelect,
  onPrefetch,
  isPending = false,
}: HomePageCategoryTabsProps) {
  return (
    <div
      className={cn(
        'scrollbar-hide relative overflow-x-auto rounded-full bg-[#fff7ef] p-1.5 shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]',
        HORIZONTAL_SCROLL_PASS_VERTICAL,
        isPending && 'opacity-80',
      )}
    >
      <div
        className="flex min-w-max items-center gap-1"
        role="tablist"
        aria-label="Jewellery categories"
      >
        {homePageCategories.map((category) => {
          const isActive = category.id === activeCategory;
          const isPromo = category.variant === 'promo';

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={category.label}
              onPointerEnter={() => {
                onPrefetch?.(category.id);
              }}
              onFocus={() => {
                onPrefetch?.(category.id);
              }}
              onClick={() => {
                onSelect(category.id);
              }}
              className={cn(
                'flex min-w-[15vw] flex-1 items-center justify-center rounded-full px-4 py-1.5 transition-colors',
                isActive && !isPromo
                  ? 'border border-[#D8AD5B] bg-[#FFE8D0F9] text-black'
                  : !isPromo && 'text-[#868686] hover:text-stone-900',
                isPromo && 'gap-1 px-3',
              )}
            >
              {isPromo ? (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Image
                    src="/icons/home-now-delivery.png"
                    alt=""
                    width={25}
                    height={15}
                    className="h-[15px] w-[25px] shrink-0"
                  />
                  <span className="text-sm font-bold text-[#e86e48] italic">
                    {category.promoHighlight}
                  </span>
                  <span className="text-base font-medium text-black capitalize italic">
                    {category.label}
                  </span>
                </span>
              ) : (
                <span className="text-sm font-semibold whitespace-nowrap capitalize">
                  {category.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
