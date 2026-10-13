import { EmilyInParisCategoryPills } from '@/components/emily-in-paris/EmilyInParisCategoryPills';
import { EmilyInParisHero } from '@/components/emily-in-paris/EmilyInParisHero';
import { EmilyInParisLifestyleGallery } from '@/components/emily-in-paris/EmilyInParisLifestyleGallery';
import { EmilyInParisPromoBanner } from '@/components/emily-in-paris/EmilyInParisPromoBanner';

/** Server-rendered marketing sections for the Emily in Paris landing page. */
export function EmilyInParisStaticSections() {
  return (
    <>
      <EmilyInParisHero />
      <EmilyInParisCategoryPills />
      <EmilyInParisPromoBanner />
      <EmilyInParisLifestyleGallery />
    </>
  );
}
