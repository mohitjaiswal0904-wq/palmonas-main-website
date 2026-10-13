import { drawerTabs } from '@/config/drawer-menu.config';
import { cn } from '@/lib/utils/cn';
import type { DrawerHomeType } from '@/types/drawer-menu';

interface DrawerTabsProps {
  activeTab: DrawerHomeType;
  onTabChange: (tab: DrawerHomeType) => void;
}

const tabButtonClass =
  'relative z-10 flex flex-1 items-center justify-center text-xs font-medium transition-colors duration-200 ease-out';

const activePillToneClass: Record<DrawerHomeType, string> = {
  demifine: 'bg-black',
  gold: 'bg-[#502C3A]',
  silver: 'bg-black',
};

const pillOffsetClass = ['translate-x-0', 'translate-x-full', 'translate-x-[200%]'];

/** Demi-Fine / Gold segmented control with a sliding active pill (Figma 960:32123). */
export function DrawerTabs({ activeTab, onTabChange }: DrawerTabsProps) {
  const activeIndex = Math.max(
    drawerTabs.findIndex((tab) => tab.id === activeTab),
    0,
  );
  const pillWidthClass = drawerTabs.length === 2 ? 'w-1/2' : 'w-1/3';

  return (
    <div className="mx-4 my-2.5 overflow-hidden rounded-full border-4 border-[#E5E7EB]">
      <div className="relative flex h-11 bg-[#F9F9F9]">
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-y-0 left-0 rounded-full shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] transition-[transform,background-color] duration-200 ease-out',
            pillWidthClass,
            pillOffsetClass[activeIndex],
            activePillToneClass[activeTab],
          )}
        />
        {drawerTabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              className={cn(tabButtonClass, isActive ? 'text-white' : 'text-[#868686]')}
              aria-label={tab.ariaLabel}
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
