import Image from 'next/image';

import { productTheme } from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';
import {
  getProductCardChipColors,
  getProductColorChip,
  hasProductCardColorSwatches,
} from '@/lib/utils/product-colors';
import type { Product } from '@/types/product';

interface ProductColorSwatchesProps {
  product: Product;
  className?: string;
}

function getChipTrackWidth(chipCount: number): number {
  const { chipSizePx, overlapPx } = productTheme.cardSwatches;

  if (chipCount <= 1) {
    return chipSizePx;
  }

  return chipSizePx + (chipCount - 1) * (chipSizePx - overlapPx);
}

function formatChipLabel(color: string): string {
  return color.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function ProductColorSwatches({ product, className }: ProductColorSwatchesProps) {
  const colors = getProductCardChipColors(product);
  const { chipSizePx, overlapPx, chipClass, trackClass } = productTheme.cardSwatches;

  if (!hasProductCardColorSwatches(product)) {
    return null;
  }

  return (
    <div
      className={cn(trackClass, className)}
      style={{
        width: getChipTrackWidth(colors.length),
      }}
      aria-label={`Available colors: ${colors.map(formatChipLabel).join(', ')}`}
    >
      {colors.map((color, index) => {
        const chipImage = getProductColorChip(color);

        if (!chipImage) {
          return null;
        }

        const chipStyle = {
          left: index * (chipSizePx - overlapPx),
          zIndex: index + 1,
        };

        return (
          <span key={color} className={chipClass} style={chipStyle} title={formatChipLabel(color)}>
            <Image
              src={chipImage}
              alt=""
              width={chipSizePx}
              height={chipSizePx}
              className="h-full w-full object-cover"
              aria-hidden="true"
              unoptimized
            />
          </span>
        );
      })}
    </div>
  );
}
