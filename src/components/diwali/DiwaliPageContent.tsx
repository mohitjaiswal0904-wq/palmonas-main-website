import { DiwaliClosing } from '@/components/diwali/DiwaliClosing';
import { DiwaliCountdown } from '@/components/diwali/DiwaliCountdown';
import { DiwaliGiftBoxes } from '@/components/diwali/DiwaliGiftBoxes';
import { DiwaliGiftingBanner } from '@/components/diwali/DiwaliGiftingBanner';
import { DiwaliHero } from '@/components/diwali/DiwaliHero';
import { DiwaliMetals } from '@/components/diwali/DiwaliMetals';
import { DiwaliOffers } from '@/components/diwali/DiwaliOffers';
import { DiwaliShop } from '@/components/diwali/DiwaliShop';
import { DIWALI_PAGE_ROOT_CLASS } from '@/components/diwali/diwali-constants';
import type { Product } from '@/types/product';

interface DiwaliPageContentProps {
  heroImageUrl: string;
  heroImageAlt: string;
  giftProducts: Product[];
  productsByTabId: Record<string, Product[]>;
}

/**
 * Diwali sale page: countdown, hero, offers, metals, gift boxes, and the shop grid.
 */
export function DiwaliPageContent({
  heroImageUrl,
  heroImageAlt,
  giftProducts,
  productsByTabId,
}: DiwaliPageContentProps) {
  return (
    <main className={DIWALI_PAGE_ROOT_CLASS}>
      <DiwaliCountdown />
      <DiwaliHero imageUrl={heroImageUrl} imageAlt={heroImageAlt} />
      <DiwaliGiftingBanner />
      <DiwaliOffers />
      <DiwaliMetals />
      <DiwaliGiftBoxes products={giftProducts} />
      <DiwaliShop productsByTabId={productsByTabId} />
      <DiwaliClosing />
    </main>
  );
}
