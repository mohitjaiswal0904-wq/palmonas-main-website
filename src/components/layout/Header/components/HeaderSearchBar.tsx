'use client';

import { Search } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

interface HeaderSearchBarProps {
  placeholder?: string;
  className?: string;
}

export const HeaderSearchBar = forwardRef<HTMLInputElement, HeaderSearchBarProps>(
  ({ placeholder = 'Search jewelry', className }, ref) => {
    return (
      <form
        action="/search"
        method="get"
        className={cn('w-full max-w-[280px] min-w-[140px]', className)}
      >
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            ref={ref}
            type="search"
            name="q"
            placeholder={placeholder}
            className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pr-3 pl-9 text-sm text-stone-900 transition-colors outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
            autoComplete="off"
          />
        </label>
      </form>
    );
  },
);

HeaderSearchBar.displayName = 'HeaderSearchBar';
