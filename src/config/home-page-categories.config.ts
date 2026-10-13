import { pageIds } from '@/config/components.config';

export const HOME_PAGE_CATEGORY_QUERY_PARAM = 'category';

export const homePageCategoryIds = ['demifine', 'gold', 'silver', 'now'] as const;

export type HomePageCategoryId = (typeof homePageCategoryIds)[number];

export type HomePageCategoryVariant = 'standard' | 'promo';

export interface HomePageCategoryConfig {
  id: HomePageCategoryId;
  label: string;
  cmsSlug: string;
  variant: HomePageCategoryVariant;
  promoHighlight?: string;
}

/**
 * Maps home category tabs to CMS page slugs.
 * Default tab (`/`) renders silver jewellery (`home-page-web`).
 */
export const homePageCategories: HomePageCategoryConfig[] = [
  {
    id: 'silver',
    label: 'Home',
    cmsSlug: pageIds.silver,
    variant: 'standard',
  },
  {
    id: 'demifine',
    label: 'Demifine® Jewellery',
    cmsSlug: pageIds.demifine,
    variant: 'standard',
  },
  {
    id: 'gold',
    label: 'Gold Jewellery',
    cmsSlug: pageIds.gold,
    variant: 'standard',
  },
  // {
  //   id: 'now',
  //   label: 'Get it by today',
  //   cmsSlug: pageIds.now,
  //   variant: 'promo',
  //   promoHighlight: 'NOW',
  // },
];

export const DEFAULT_HOME_PAGE_CATEGORY_ID: HomePageCategoryId = 'silver';
