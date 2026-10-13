/** Suffix for web-platform CMS page slugs in the pages API. */
export const CMS_PAGE_SLUG_WEB_SUFFIX = '-web';

/**
 * Append the web CMS slug suffix when calling the pages API.
 *
 * @param slug - Base CMS page slug from config or route params.
 */
export function toWebCmsPageSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed || trimmed.endsWith(CMS_PAGE_SLUG_WEB_SUFFIX)) {
    return trimmed;
  }

  return `${trimmed}${CMS_PAGE_SLUG_WEB_SUFFIX}`;
}
