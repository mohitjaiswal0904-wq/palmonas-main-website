'use client';

import { HeaderActions } from '@/components/layout/HeaderActions';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function HeaderNavigation() {
  const isLaptop = useMediaQuery('laptop');

  return (
    <div className="mobile:gap-2 flex items-center gap-1">
      {isLaptop ? <MegaMenu /> : <MobileMenu />}
      <HeaderActions />
    </div>
  );
}
