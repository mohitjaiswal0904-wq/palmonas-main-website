export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SeoRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/** Public, indexable routes for sitemap generation. */
export const publicSeoRoutes: SeoRoute[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/pages/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact-us', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/shraddhas-favourite', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/emily-in-paris', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/diwali', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pop', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gifting', changeFrequency: 'weekly', priority: 0.8 },
];

/** Routes that should never be indexed. */
export const noIndexRoutes: string[] = [
  '/account',
  '/account/login',
  '/account/register',
  '/account/profile',
  '/account/orders',
  '/account/order-history',
  '/account/plan-of-purchase',
  '/account/wishlist',
  '/account/wallet',
  '/account/delivery-address',
  '/account/refer-and-earn',
  '/account/support',
  '/account/how-to-earn',
  '/account/how-to-redeem',
  '/account/faqs',
  '/account/privacy-policy',
];
