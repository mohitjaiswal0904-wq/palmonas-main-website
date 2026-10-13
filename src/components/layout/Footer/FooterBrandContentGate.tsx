'use client';

import { usePathname } from 'next/navigation';

import { BrandContentSection } from '@/components/layout/BrandContent/BrandContentSection';

/** Hides homepage SEO accordion on routes that already carry dedicated brand copy. */
export function FooterBrandContentGate() {
  const pathname = usePathname();

  if (pathname === '/about') {
    return null;
  }

  return <BrandContentSection />;
}
