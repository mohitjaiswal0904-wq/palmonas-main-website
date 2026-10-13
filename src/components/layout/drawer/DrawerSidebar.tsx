'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { DrawerContentArea } from '@/components/layout/drawer/DrawerContentArea';
import { DrawerFooter } from '@/components/layout/drawer/DrawerFooter';
import { DrawerHeader } from '@/components/layout/drawer/DrawerHeader';
import { DrawerMenuSidebar } from '@/components/layout/drawer/DrawerMenuSidebar';
import { DrawerTabs } from '@/components/layout/drawer/DrawerTabs';
import { drawerMenusByHomeType, drawerTabs, goldPriceRanges } from '@/config/drawer-menu.config';
import { useAppNavigate } from '@/hooks/navigation/useAppNavigate';
import { prefetchAdjacentDrawerImages } from '@/lib/drawer/drawer-image-prefetch';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { DrawerCategoryItem, DrawerHomeType, DrawerSidebarProps } from '@/types/drawer-menu';

export function DrawerSidebar({ open, onClose }: DrawerSidebarProps) {
  const { navigate } = useAppNavigate();
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerHomeType>('demifine');
  const [activeCategory, setActiveCategory] = useState<string | null>('category');

  // Keep mount/visibility in sync with `open`, deferring setState so open/close can animate.
  useEffect(() => {
    if (open) {
      const showFrame = requestAnimationFrame(() => {
        setShouldRender(true);
        requestAnimationFrame(() => setIsVisible(true));
      });

      return () => cancelAnimationFrame(showFrame);
    }

    const hideFrame = requestAnimationFrame(() => setIsVisible(false));
    const timer = window.setTimeout(() => setShouldRender(false), 300);

    return () => {
      cancelAnimationFrame(hideFrame);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const { categories: allCategories, bottomItems } = drawerMenusByHomeType[activeTab];
  const menuCategories = useMemo(
    () => allCategories.filter((category) => !category.hiddenInSidebar),
    [allCategories],
  );

  const activeCategoryForContent = useMemo(() => {
    if (activeCategory && menuCategories.some((category) => category.id === activeCategory)) {
      return activeCategory;
    }

    return menuCategories[0]?.id ?? null;
  }, [activeCategory, menuCategories]);

  // Warm next sidebar + next home-pill images shortly after open (PW-566).
  // Short delay lets active-tab priority tiles claim the pipe first on Fast 4G.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      prefetchAdjacentDrawerImages({
        activeTab,
        activeCategoryId: activeCategoryForContent,
        menusByHomeType: drawerMenusByHomeType,
        tabs: drawerTabs,
        priceRanges: goldPriceRanges,
        sidebarLookahead: 2,
        signal: controller.signal,
      });
    }, 100);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [activeCategoryForContent, activeTab, open]);

  const navigateToCollection = useCallback(
    (handle: string) => {
      navigate(resolveCollectionPagePath(handle));
      onClose();
    },
    [navigate, onClose],
  );

  const handleTabChange = useCallback((tab: DrawerHomeType) => {
    setActiveTab(tab);
    setActiveCategory('category');
  }, []);

  const handleItemPress = useCallback(
    (item: DrawerCategoryItem) => {
      if (item.handle) {
        navigateToCollection(item.handle);
      }
    },
    [navigateToCollection],
  );

  const handleBottomItemPress = useCallback(
    (itemId: string) => {
      const item = bottomItems.find((entry) => entry.id === itemId);
      if (item?.handle) {
        navigateToCollection(item.handle);
      }
    },
    [bottomItems, navigateToCollection],
  );

  if (!shouldRender || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="laptop:hidden z-modal-backdrop fixed inset-0">
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close menu overlay"
        onClick={onClose}
      />
      <div
        id="header-mobile-navigation"
        className={cn(
          'absolute inset-y-0 left-0 flex w-full max-w-full flex-col bg-white shadow-lg transition-transform duration-300 ease-out',
          isVisible ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <DrawerHeader onClose={onClose} />
        <DrawerTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex min-h-0 flex-1">
          <DrawerMenuSidebar
            categories={menuCategories}
            activeCategory={activeCategoryForContent}
            onCategoryPress={setActiveCategory}
            bottomItems={bottomItems}
            onBottomItemPress={handleBottomItemPress}
          />
          <DrawerContentArea
            activeCategory={activeCategoryForContent}
            categories={allCategories}
            priceRanges={goldPriceRanges}
            onItemPress={handleItemPress}
            onViewAllPress={navigateToCollection}
            onPriceRangeChange={navigateToCollection}
          />
        </div>

        <DrawerFooter onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
