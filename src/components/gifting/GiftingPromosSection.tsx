import { GiftingFreeGiftsBanner } from '@/components/gifting/GiftingFreeGiftsBanner';
import { GiftingGiftCardsSection } from '@/components/gifting/GiftingGiftCardsSection';

/**
 * Free Gifts + Gift Cards — stacked on mobile, side-by-side on desktop.
 */
export function GiftingPromosSection() {
  return (
    <section className="tab:px-6 px-3 py-4" aria-label="Free gifts and gift cards">
      <div className="tab:grid-cols-2 tab:gap-4 tab:items-stretch mx-auto grid w-full max-w-6xl grid-cols-1 gap-3">
        <GiftingFreeGiftsBanner />
        <GiftingGiftCardsSection />
      </div>
    </section>
  );
}
