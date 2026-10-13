import { DIWALI_MENU_HANDLE, DIWALI_PAGE_PATH } from '@/config/diwali/diwali.config';
import {
  EMILY_IN_PARIS_COLLECTION_HANDLE,
  EMILY_IN_PARIS_PAGE_PATH,
} from '@/config/emily-in-paris.config';
import {
  SHRADDHAS_FAVOURITE_HANDLE,
  SHRADDHAS_FAVOURITE_PAGE_PATH,
} from '@/config/shraddhas-favourite.config';

/** Misspelled / legacy handles remapped before path resolution. */
const COLLECTION_HANDLE_ALIASES: Readonly<Record<string, string>> = {
  'bestsellers': 'best-sellers',
  'best-seller': 'best-sellers',
};

/** Handles that have a dedicated landing page instead of the generic collection route. */
const COLLECTION_LANDING_PAGES: Readonly<Record<string, string>> = {
  [EMILY_IN_PARIS_COLLECTION_HANDLE]: EMILY_IN_PARIS_PAGE_PATH,
  [SHRADDHAS_FAVOURITE_HANDLE]: SHRADDHAS_FAVOURITE_PAGE_PATH,
  [DIWALI_MENU_HANDLE]: DIWALI_PAGE_PATH,
};

/**
 * Normalises a collection handle or `/collections/...` path to a bare handle.
 *
 * @param value - Collection handle or path from CMS / menu config
 * @returns Bare collection handle without leading slashes or query string
 */
export function normalizeCollectionHandle(value: string): string {
  const trimmed = value.trim();
  const withoutQuery = trimmed.split('?')[0] ?? trimmed;
  const withoutPrefix = withoutQuery.replace(/^\/?collections\//i, '').replace(/^\//, '');
  const handle = withoutPrefix.trim();

  return COLLECTION_HANDLE_ALIASES[handle] ?? handle;
}

/**
 * Resolves the storefront path for a collection handle.
 *
 * @param handleOrPath - Collection handle or `/collections/...` path
 * @returns Dedicated landing page when the handle has one, otherwise `/collections/[handle]`, or `/` when the handle is empty
 */
export function resolveCollectionPagePath(handleOrPath: string): string {
  const handle = normalizeCollectionHandle(handleOrPath);

  if (!handle) {
    return '/';
  }

  return COLLECTION_LANDING_PAGES[handle] ?? `/collections/${handle}`;
}
