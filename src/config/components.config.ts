/** CMS v2 slot identifiers — GET /api/v2/cms/slots/{slot}/default */
export const cmsSlotIds = {
  header: 'header',
  footer: 'footer',
  bottomNav: 'bottom_nav',
  announcementBar: 'announcement_bar',
} as const;

export type CmsSlotId = (typeof cmsSlotIds)[keyof typeof cmsSlotIds];

/** CMS page slugs for page-scoped content (v1 pages API). */
export const pageIds = {
  home: 'home-page-web',
  demifine: 'demifine-web',
  gold: 'gold-home-page-web',
  silver: 'home-page-web',
} as const;

export type PageId = (typeof pageIds)[keyof typeof pageIds];

/** Stable component identifiers for layout and CMS-driven UI. */
export const componentIds = {
  header: 'layout-header',
  footer: 'layout-footer',
  bottomNav: 'layout-bottom-nav',
  announcementBar: 'layout-announcement-bar',
  homeSections: 'home-sections',
} as const;

export type ComponentId = (typeof componentIds)[keyof typeof componentIds];

export const cmsPlatforms = {
  web: 'web',
  app: 'ap',
} as const;

export type CmsPlatform = (typeof cmsPlatforms)[keyof typeof cmsPlatforms];

export interface CmsSlotApiConfig {
  path: string;
  params: { platform: CmsPlatform };
}

export interface PageApiConfig {
  path: string;
  params: Record<string, string>;
}

export interface ComponentCacheConfig {
  revalidateSeconds: number;
  tags: string[];
}

export interface FooterFallbackLink {
  label: string;
  href: string;
}

export interface FooterFallbackColumn {
  title: string;
  links: FooterFallbackLink[];
}

export interface HeaderFallbackLink {
  label: string;
  /**
   * Shopify / CMS collection handle. Prefer this over `href` so links resolve
   * through `resolveCollectionPagePath`.
   */
  collectionHandle?: string;
  /** Static path for non-collection destinations (stores, journal, …). */
  href?: string;
}

export interface CmsSlotComponentConfig {
  componentId: ComponentId;
  slot: CmsSlotId;
  api: CmsSlotApiConfig;
  cache: ComponentCacheConfig;
}

export interface PageComponentConfig {
  componentId: ComponentId;
  pageId: PageId;
  api: PageApiConfig;
  cache: ComponentCacheConfig;
}

export interface HeaderComponentConfig extends CmsSlotComponentConfig {
  componentId: typeof componentIds.header;
  slot: typeof cmsSlotIds.header;
  fallback: {
    logoLabel: string;
    logoHref: string;
    navLinks: HeaderFallbackLink[];
  };
}

export interface FooterComponentConfig extends CmsSlotComponentConfig {
  componentId: typeof componentIds.footer;
  slot: typeof cmsSlotIds.footer;
  fallback: {
    columns: FooterFallbackColumn[];
  };
}

const cmsSlotApiPath = '/api/v2/cms/slots/{slot}/default';

export const componentsConfig = {
  header: {
    componentId: componentIds.header,
    slot: cmsSlotIds.header,
    api: {
      path: cmsSlotApiPath,
      params: { platform: cmsPlatforms.web },
    },
    cache: {
      revalidateSeconds: 3600,
      tags: ['cms-slot-header'],
    },
    fallback: {
      logoLabel: 'Palmonas',
      logoHref: '/',
      navLinks: [
        { label: 'Bestsellers', collectionHandle: 'best-sellers' },
        { label: 'New Arrivals', collectionHandle: 'new-arrivals' },
        { label: 'Fine Gold', collectionHandle: '9kt-fine-gold' },
        { label: 'Journal', href: '/blogs/style-guide' },
        { label: 'Palmonas Stores', href: '/palmonas-stores' },
      ],
    },
  },
  footer: {
    componentId: componentIds.footer,
    slot: cmsSlotIds.footer,
    api: {
      path: cmsSlotApiPath,
      params: { platform: cmsPlatforms.web },
    },
    cache: {
      revalidateSeconds: 3600,
      tags: ['cms-slot-footer'],
    },
    fallback: {
      columns: [
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Login', href: '/?login=1' },
          ],
        },
      ],
    },
  },
  bottomNav: {
    componentId: componentIds.bottomNav,
    slot: cmsSlotIds.bottomNav,
    api: {
      path: cmsSlotApiPath,
      params: { platform: cmsPlatforms.web },
    },
    cache: {
      revalidateSeconds: 3600,
      tags: ['cms-slot-bottom-nav'],
    },
  },
  announcementBar: {
    componentId: componentIds.announcementBar,
    slot: cmsSlotIds.announcementBar,
    api: {
      path: cmsSlotApiPath,
      params: { platform: cmsPlatforms.web },
    },
    cache: {
      revalidateSeconds: 300,
      tags: ['cms-slot-announcement-bar'],
    },
  },
  homeSections: {
    componentId: componentIds.homeSections,
    pageId: pageIds.home,
    api: {
      path: '/api/v1/cms/pages/slug/{pageId}/app',
      params: { platform: cmsPlatforms.web },
    },
    cache: {
      revalidateSeconds: 300,
      tags: ['cms-home'],
    },
  },
} as const satisfies Record<
  string,
  CmsSlotComponentConfig | FooterComponentConfig | HeaderComponentConfig | PageComponentConfig
>;

export type ComponentsConfigKey = keyof typeof componentsConfig;

export type CmsSlotComponentsConfigKey = Exclude<ComponentsConfigKey, 'homeSections'>;
