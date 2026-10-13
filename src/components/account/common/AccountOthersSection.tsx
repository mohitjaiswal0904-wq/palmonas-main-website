'use client';

import { AccountOthersItem } from '@/components/account/common/AccountOthersItem';
import { ACCOUNT_OTHERS_MENU_ITEMS } from '@/components/account/common/account-menu.config';
import type {
  AccountPanelId,
  AccountSelectPanelHandler,
} from '@/components/account/common/account-panels';
import { cn } from '@/lib/utils/cn';

interface AccountOthersSectionProps {
  className?: string;
  activePanelId?: AccountPanelId | null;
  onSelectPanel: AccountSelectPanelHandler;
}

export function AccountOthersSection({
  className,
  activePanelId = null,
  onSelectPanel,
}: AccountOthersSectionProps) {
  return (
    <section className={cn('mt-8', className)} aria-label="Other account options">
      <p className="mb-3 text-center text-sm font-normal text-[#757575]">Others</p>
      <nav aria-label="Other account links">
        <ul className="flex flex-col gap-2">
          {ACCOUNT_OTHERS_MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <AccountOthersItem
                item={item}
                isActive={activePanelId === item.id}
                onSelectPanel={onSelectPanel}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
