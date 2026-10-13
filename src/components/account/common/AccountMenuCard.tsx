'use client';

import { AccountMenuItem } from '@/components/account/common/AccountMenuItem';
import { ACCOUNT_PRIMARY_MENU_ITEMS } from '@/components/account/common/account-menu.config';
import type {
  AccountPanelId,
  AccountSelectPanelHandler,
} from '@/components/account/common/account-panels';
import { cn } from '@/lib/utils/cn';

interface AccountMenuCardProps {
  className?: string;
  activePanelId?: AccountPanelId | null;
  onSelectPanel: AccountSelectPanelHandler;
}

export function AccountMenuCard({
  className,
  activePanelId = null,
  onSelectPanel,
}: AccountMenuCardProps) {
  return (
    <nav
      className={cn('overflow-hidden rounded-2xl border border-[#EFEFEF] bg-white', className)}
      aria-label="Account menu"
    >
      <ul>
        {ACCOUNT_PRIMARY_MENU_ITEMS.map((item, index) => {
          const isActive = activePanelId === item.id;
          const isLast = index === ACCOUNT_PRIMARY_MENU_ITEMS.length - 1;

          return (
            <li
              key={item.id}
              className={cn(
                !isLast && !isActive && 'border-b border-[#EFEFEF]',
                isActive && 'my-1',
              )}
            >
              <AccountMenuItem item={item} isActive={isActive} onSelect={onSelectPanel} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
