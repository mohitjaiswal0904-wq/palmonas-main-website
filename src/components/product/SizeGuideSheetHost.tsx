'use client';

import { SizeGuideContent } from '@/components/product/SizeGuideContent';
import { SizeGuideSheet } from '@/components/product/SizeGuideSheet';
import { DiamondGuideContent } from '@/components/product/gold/DiamondGuideContent';
import {
  diamondGuideContent,
  productMessages,
  productTheme,
  sizeGuideContent,
} from '@/config/product/product.config';
import { useSizeGuide } from '@/providers/product/SizeGuideProvider';

/**
 * Single layout-mounted host for ring size and diamond guide sheets.
 */
export function SizeGuideSheetHost() {
  const { isOpen, params, closeSizeGuide } = useSizeGuide();

  if (!params) {
    return null;
  }

  const isDiamond = params.kind === 'diamond';

  return (
    <SizeGuideSheet
      key={params.kind}
      open={isOpen}
      onClose={closeSizeGuide}
      title={params.title ?? (isDiamond ? diamondGuideContent.sheetTitle : sizeGuideContent.title)}
      closeLabel={
        params.closeLabel ??
        (isDiamond ? productMessages.a11y.closeDiamondGuide : productMessages.a11y.closeSizeGuide)
      }
      bodyStyle={
        params.bodyStyle ??
        (isDiamond ? { backgroundColor: productTheme.demifine.chipSelectedBg } : undefined)
      }
    >
      {isDiamond ? <DiamondGuideContent /> : <SizeGuideContent />}
    </SizeGuideSheet>
  );
}
