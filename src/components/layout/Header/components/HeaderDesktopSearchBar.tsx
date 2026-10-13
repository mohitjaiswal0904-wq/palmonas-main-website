'use client';

import { Search } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

interface HeaderDesktopSearchBarProps {
  placeholder?: string;
  className?: string;
}

export const HeaderDesktopSearchBar = forwardRef<HTMLInputElement, HeaderDesktopSearchBarProps>(
  ({ placeholder = 'Rings', className }, ref) => {
    return (
      <form action="/search" method="get" className={cn('w-full max-w-[40vw]', className)}>
        <label className="relative block">
          <span className="sr-only">Search</span>
          <input
            ref={ref}
            type="search"
            name="q"
            placeholder={placeholder}
            className="w-full rounded-xl border border-[#e6e6e6] bg-white py-2 pr-11 pl-3 text-xs text-stone-900 capitalize transition-colors outline-none placeholder:text-[#c7c7c7] focus:border-stone-400"
            autoComplete="off"
          />
          <Search
            className="pointer-events-none absolute top-1/2 right-3 h-[1rem] w-[1rem] -translate-y-1/2 text-stone-900"
            aria-hidden="true"
          />
        </label>
      </form>
    );
  },
);

HeaderDesktopSearchBar.displayName = 'HeaderDesktopSearchBar';
