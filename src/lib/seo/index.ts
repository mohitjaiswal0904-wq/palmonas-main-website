export { buildMetadata } from '@/lib/seo/build-metadata';
export type { PageMetadataOptions } from '@/lib/seo/build-metadata';
export {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/json-ld';
export { noIndexRoutes, publicSeoRoutes } from '@/lib/seo/routes';
export type { ChangeFrequency, SeoRoute } from '@/lib/seo/routes';
export {
  buildShopHostCanonicalScript,
  isShopDuplicateHost,
  PRIMARY_CANONICAL_ORIGIN,
  SHOP_DUPLICATE_HOSTS,
  SHOP_HOST_CANONICAL_SCRIPT_ID,
} from '@/lib/seo/shop-host-canonical';
