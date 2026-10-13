import type { ReactNode } from 'react';

import { productTheme } from '@/config/product/product.config';

interface ProductDetailLayoutProps {
  gallery: ReactNode;
  info: ReactNode;
}

/**
 * PDP shell. On laptop+ the info column alone sizes the grid row: the gallery cell is a
 * positioning context whose content is taken out of flow, so a tall gallery scrolls inside
 * the column instead of stretching the page (PW-643).
 */
export function ProductDetailLayout({ gallery, info }: ProductDetailLayoutProps) {
  return (
    <main className="laptop:grid-cols-[7fr_3fr] laptop:gap-10 laptop:px-8 laptop:py-10 grid w-full grid-cols-1 gap-0">
      <div className="laptop:relative min-w-0">{gallery}</div>
      <div className={productTheme.pdpRhythm.infoColumnClass}>{info}</div>
    </main>
  );
}
