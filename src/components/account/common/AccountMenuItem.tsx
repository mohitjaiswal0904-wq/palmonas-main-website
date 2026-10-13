'use client';

import type { AccountPrimaryMenuItem } from '@/components/account/common/account-menu.config';
import { AccountChevronIcon } from '@/components/account/common/icons/AccountChevronIcon';
import { cn } from '@/lib/utils/cn';

interface AccountMenuItemProps {
  item: AccountPrimaryMenuItem;
  isActive?: boolean;
  onSelect: (menuItemId: string, href: string) => void;
  className?: string;
}

export function AccountMenuItem({
  item,
  isActive = false,
  onSelect,
  className,
}: AccountMenuItemProps) {
  const { Icon, title, description, href, id } = item;

  return (
    <button
      type="button"
      onClick={() => onSelect(id, href)}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 px-4 py-4 text-left transition-colors',
        isActive
          ? 'rounded-xl bg-[#FAFAFA] shadow-[0_2px_8px_rgba(80,44,58,0.12)]'
          : 'hover:bg-[#FAFAFA]',
        className,
      )}
      aria-label={title}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5EBE6] text-[#502C3A]',
          // isActive ? 'bg-white' : 'bg-[#F5EBE6]',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn('block text-sm text-[#151515]', isActive ? 'font-bold' : 'font-semibold')}
        >
          {title}
        </span>
        <span className="text-xxs mt-1 block pb-0.5 leading-snug font-normal text-[#757575]">
          {description}
        </span>
      </span>
      <AccountChevronIcon className="h-4 w-4 shrink-0 text-[#B0B0B0]" />
    </button>
  );
}
