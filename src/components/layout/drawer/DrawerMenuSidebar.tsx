import { ExternalLink } from 'lucide-react';

import { LuxeBadge } from '@/components/layout/drawer/LuxeBadge';
import { cn } from '@/lib/utils/cn';
import type { DrawerBottomItem, DrawerMenuCategory } from '@/types/drawer-menu';

interface DrawerMenuSidebarProps {
  categories: DrawerMenuCategory[];
  activeCategory: string | null;
  onCategoryPress: (categoryId: string) => void;
  bottomItems?: DrawerBottomItem[];
  onBottomItemPress?: (itemId: string) => void;
}

/**
 * Sidebar navigation component for the mobile drawer menu.
 * Displays category tabs and bottom links.
 *
 * @param props - The properties for the DrawerMenuSidebar component.
 * @returns The rendered sidebar component.
 */
export function DrawerMenuSidebar({
  categories,
  activeCategory,
  onCategoryPress,
  bottomItems = [],
  onBottomItemPress,
}: DrawerMenuSidebarProps) {
  return (
    <aside className="h-full w-[8.125rem] shrink-0 border-r border-[#F3F4F6] bg-white">
      <div className="h-full overflow-y-auto pb-1">
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const isLastCategory = index === categories.length - 1;
          const shouldShowSeparator = !isLastCategory || bottomItems.length > 0;

          return (
            <div key={category.id}>
              <button
                type="button"
                className={cn(
                  'w-full px-3 text-left text-sm text-[#4B5563]',
                  category.id === 'fine-silver' && category.labelBadge ? 'pt-5 pb-4' : 'py-4',
                  isActive ? 'bg-[#F4F4F4]' : 'bg-transparent',
                )}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onCategoryPress(category.id)}
              >
                {category.id === 'fine-silver' && category.labelBadge ? (
                  <span className="relative inline-block max-w-full pr-6">
                    <span className="block text-sm text-[#4B5563]">{category.label}</span>
                    <span className="absolute -top-2.5 right-0 z-[2]">
                      <LuxeBadge text={category.labelBadge.text} />
                    </span>
                  </span>
                ) : category.labelBadge ? (
                  <span className="flex items-start justify-between gap-1">
                    <span className="flex-1 pr-1.5 text-sm text-[#4B5563]">{category.label}</span>
                    <LuxeBadge text={category.labelBadge.text} />
                  </span>
                ) : (
                  <span>{category.label}</span>
                )}
              </button>
              {shouldShowSeparator ? <div className="h-px bg-[#E5E7EB]" /> : null}
            </div>
          );
        })}

        {bottomItems.map((item, index) => {
          const isLastBottomItem = index === bottomItems.length - 1;

          return (
            <div key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-1 px-3 py-4 text-left text-sm text-[#4B5563]"
                onClick={() => onBottomItemPress?.(item.id)}
              >
                <span className="flex-1">{item.label}</span>
                {item.hasExternalIcon ? (
                  <ExternalLink className="h-3 w-3 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
                ) : null}
              </button>
              {!isLastBottomItem ? <div className="h-px bg-[#E5E7EB]" /> : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
