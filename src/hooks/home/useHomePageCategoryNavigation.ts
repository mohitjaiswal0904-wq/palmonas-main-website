'use client';

/**
 * Home category navigation hook — re-exports the provider-backed hook so UI
 * imports stay on the `hooks/` layer (UI → hooks → providers).
 */
export {
  HomePageCategoryNavigationProvider,
  useHomePageCategoryNavigation,
} from '@/providers/home/HomePageCategoryNavigationProvider';
