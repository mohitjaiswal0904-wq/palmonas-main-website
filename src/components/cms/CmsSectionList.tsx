import type { ComponentType } from 'react';

import { BannerSection } from '@/components/cms/BannerSection';
import { BlogSection } from '@/components/cms/BlogSection';
import { ButtonGridSection } from '@/components/cms/ButtonGridSection';
import { ButtonSection } from '@/components/cms/ButtonSection';
import { CardGridSection } from '@/components/cms/CardGridSection';
import { CarouselSection } from '@/components/cms/CarouselSection';
import { CategoryTilesSection } from '@/components/cms/CategoryTilesSection';
import { CollectionSection } from '@/components/cms/CollectionSection';
import { CustomComponentSection } from '@/components/cms/CustomComponentSection';
import { FaqSection } from '@/components/cms/FaqSection';
import { HeroBannerSection } from '@/components/cms/HeroBannerSection';
import { HeroSection } from '@/components/cms/HeroSection';
import { ImageTextSection } from '@/components/cms/ImageTextSection';
import { MediaSection } from '@/components/cms/MediaSection';
import { ParagraphSection } from '@/components/cms/ParagraphSection';
import { ProductCarouselSection } from '@/components/cms/ProductCarouselSection';
import { ProductCollectionSection } from '@/components/cms/ProductCollectionSection';
import { TestimonialSection } from '@/components/cms/TestimonialSection';
import { VideoSection } from '@/components/cms/VideoSection';
import { getVisibleOrderedSections } from '@/lib/utils/cms-sections';
import type { CmsSection } from '@/types/cms';

interface CmsSectionComponentProps {
  section: CmsSection;
}

const SECTION_REGISTRY: Record<string, ComponentType<CmsSectionComponentProps>> = {
  'hero': HeroSection,
  'hero-banner': HeroBannerSection,
  'banner': BannerSection,
  'button': ButtonSection,
  'button_grid': ButtonGridSection,
  'card_grid': CardGridSection,
  'categoryTiles': CategoryTilesSection,
  'carousel': CarouselSection,
  'collection': CollectionSection,
  'collection_long': CollectionSection,
  'product_collection': ProductCollectionSection,
  'productCarousel': ProductCarouselSection,
  'paragraph': ParagraphSection,
  'imageText': ImageTextSection,
  'media': MediaSection,
  'video': VideoSection,
  'blog': BlogSection,
  'faq': FaqSection,
  'testimonial': TestimonialSection,
  'custom_component': CustomComponentSection,
};

interface CmsSectionListProps {
  sections: CmsSection[];
}

export function CmsSectionList({ sections }: CmsSectionListProps) {
  const visibleSections = getVisibleOrderedSections(sections);

  return (
    <div className="tab:gap-[7vh] laptop:gap-[5vh] flex flex-col gap-[10vw]">
      {visibleSections.map((section) => {
        const Component = SECTION_REGISTRY[section.type];

        if (!Component) {
          return null;
        }

        return <Component key={section.id} section={section} />;
      })}
    </div>
  );
}
