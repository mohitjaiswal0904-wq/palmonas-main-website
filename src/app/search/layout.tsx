import type { ReactNode } from 'react';

import { SearchMobileSlideShell } from '@/components/search/SearchMobileSlideShell';

interface SearchLayoutProps {
  children: ReactNode;
}

/**
 * Wraps search loading + page so the mobile slide shell stays mounted and
 * the existing search skeleton can animate in with the sheet.
 */
export default function SearchLayout({ children }: SearchLayoutProps) {
  return <SearchMobileSlideShell>{children}</SearchMobileSlideShell>;
}
