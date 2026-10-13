import { GiftingBestsellersSection } from '@/components/gifting/GiftingBestsellersSection';
import { GiftingByPriceSection } from '@/components/gifting/GiftingByPriceSection';
import { GiftingCategoryProductsSection } from '@/components/gifting/GiftingCategoryProductsSection';
import { GiftingHeroSection } from '@/components/gifting/GiftingHeroSection';
import { GiftingOccasionSection } from '@/components/gifting/GiftingOccasionSection';
import { GiftingPalmonasGiftsSection } from '@/components/gifting/GiftingPalmonasGiftsSection';
import { GiftingPromosSection } from '@/components/gifting/GiftingPromosSection';
import { GiftingRelationshipsSection } from '@/components/gifting/GiftingRelationshipsSection';
import type { ProductListResponse } from '@/types/product';

interface GiftingPageContentProps {
  categoryCollectionHandle: string;
  categoryProductsInitialPage: ProductListResponse | null;
  bestsellersInitialPage: ProductListResponse | null;
}

/**
 * Gifting marketing page composition — category + bestsellers rails are API-backed.
 */
export function GiftingPageContent({
  categoryCollectionHandle,
  categoryProductsInitialPage,
  bestsellersInitialPage,
}: GiftingPageContentProps) {
  return (
    <div className="w-full bg-white">
      <GiftingHeroSection />
      <GiftingPalmonasGiftsSection />
      <GiftingOccasionSection />
      <GiftingCategoryProductsSection
        initialHandle={categoryCollectionHandle}
        initialPage={categoryProductsInitialPage}
      />
      <GiftingPromosSection />
      <GiftingRelationshipsSection />
      <GiftingByPriceSection />
      <GiftingBestsellersSection initialPage={bestsellersInitialPage} />
    </div>
  );
}
