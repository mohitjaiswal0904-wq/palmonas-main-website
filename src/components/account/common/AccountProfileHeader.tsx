'use client';

import { cn } from '@/lib/utils/cn';

interface AccountProfileHeaderProps {
  name: string;
  isActive?: boolean;
  onSelectProfile: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AccountProfileHeader({
  name,
  isActive = false,
  onSelectProfile,
  className,
}: AccountProfileHeaderProps) {
  const initials = getInitials(name);

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-[#F5EBE6]">
        <span className="text-lg font-medium text-[#502C3A]">{initials || 'U'}</span>
      </div>
      <h1 className="text-xl font-bold text-[#151515]">{name}</h1>
      <button
        type="button"
        onClick={onSelectProfile}
        className={cn(
          'mt-1 text-xs font-normal text-[#151515] underline underline-offset-2',
          isActive && 'font-medium',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        View Profile
      </button>
    </div>
  );
}
