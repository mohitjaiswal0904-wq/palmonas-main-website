import type { CmsSlotApiConfig, PageApiConfig } from '@/config/components.config';

export function resolveApiPath(path: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    path,
  );
}

export function resolveCmsSlotApiPath(api: CmsSlotApiConfig, slot: string): string {
  return resolveApiPath(api.path, { slot });
}

export function resolvePageApiPath(api: PageApiConfig, pageId: string): string {
  return resolveApiPath(api.path, { pageId });
}

/** @deprecated Use resolveCmsSlotApiPath or resolvePageApiPath */
export function resolveComponentApiPath(
  api: { path: string },
  placeholderValue: string,
  placeholderKey = 'pageId',
): string {
  return resolveApiPath(api.path, { [placeholderKey]: placeholderValue });
}
