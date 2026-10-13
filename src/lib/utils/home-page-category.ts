import {
  DEFAULT_HOME_PAGE_CATEGORY_ID,
  HOME_PAGE_CATEGORY_QUERY_PARAM,
  homePageCategories,
  type HomePageCategoryConfig,
  type HomePageCategoryId,
} from '@/config/home-page-categories.config';

const homePageCategoryById = new Map(homePageCategories.map((category) => [category.id, category]));

export function isHomePageCategoryId(value: string): value is HomePageCategoryId {
  return homePageCategoryById.has(value as HomePageCategoryId);
}

export function resolveHomePageCategory(categoryParam: string | undefined): HomePageCategoryId {
  if (!categoryParam) {
    return DEFAULT_HOME_PAGE_CATEGORY_ID;
  }

  const normalized = categoryParam.trim().toLowerCase();

  return isHomePageCategoryId(normalized) ? normalized : DEFAULT_HOME_PAGE_CATEGORY_ID;
}

export function getHomePageCategoryConfig(categoryId: HomePageCategoryId): HomePageCategoryConfig {
  return (
    homePageCategoryById.get(categoryId) ??
    homePageCategoryById.get(DEFAULT_HOME_PAGE_CATEGORY_ID) ??
    homePageCategories[0]!
  );
}

export function getHomePageCmsSlug(categoryId: HomePageCategoryId): string {
  return getHomePageCategoryConfig(categoryId).cmsSlug;
}

export function buildHomePageCategoryHref(categoryId: HomePageCategoryId): string {
  if (categoryId === DEFAULT_HOME_PAGE_CATEGORY_ID) {
    return '/';
  }

  return `/?${HOME_PAGE_CATEGORY_QUERY_PARAM}=${categoryId}`;
}

export function getHomePageCategorySearchParam(
  searchParams: Record<string, string | string[] | undefined>,
): string | undefined {
  const value = searchParams[HOME_PAGE_CATEGORY_QUERY_PARAM];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
