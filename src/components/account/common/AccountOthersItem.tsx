'use client';

import type { AccountOthersMenuItem } from '@/components/account/common/account-menu.config';
import type { AccountSelectPanelHandler } from '@/components/account/common/account-panels';
import { AccountChevronIcon } from '@/components/account/common/icons/AccountChevronIcon';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils/cn';

interface AccountOthersItemProps {
  item: AccountOthersMenuItem;
  isActive?: boolean;
  onSelectPanel: AccountSelectPanelHandler;
  className?: string;
}

const OTHER_ROW_CLASS =
  'flex w-full items-center justify-between rounded-xl border border-[#EFEFEF] bg-white px-4 py-4 text-left text-sm text-[#151515] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]';

export function AccountOthersItem({
  item,
  isActive = false,
  onSelectPanel,
  className,
}: AccountOthersItemProps) {
  const { logout, isLoggingOut } = useAuth();

  if (item.action === 'logout') {
    return (
      <button
        type="button"
        className={cn(OTHER_ROW_CLASS, 'font-normal', className)}
        aria-label={item.title}
        disabled={isLoggingOut}
        onClick={() => void logout()}
      >
        <span>{item.title}</span>
        <AccountChevronIcon className="h-4 w-4 shrink-0 text-[#B0B0B0]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectPanel(item.id, item.href)}
      className={cn(
        OTHER_ROW_CLASS,
        isActive &&
          'border-[#F5EBE6] bg-[#FAFAFA] font-medium shadow-[0_2px_8px_rgba(80,44,58,0.12)]',
        !isActive && 'font-normal',
        className,
      )}
      aria-label={item.title}
      aria-current={isActive ? 'page' : undefined}
    >
      <span>{item.title}</span>
      <AccountChevronIcon className="h-4 w-4 shrink-0 text-[#B0B0B0]" />
    </button>
  );
}
