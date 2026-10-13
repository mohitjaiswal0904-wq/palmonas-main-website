import type { BlogArticlesQueryParams } from '@/types/blog';
import type { CollectionProductsParams } from '@/types/collection';
import type { ProductListParams } from '@/types/product';
import type { ProductReviewsQueryParams } from '@/types/product/reviews';
import type { StoreListQueryParams } from '@/types/store';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
    stats: () => [...queryKeys.cart.all, 'stats'] as const,
    discounts: (cartId: string) => [...queryKeys.cart.all, 'discounts', cartId] as const,
    recommended: (productIds: readonly string[]) =>
      [...queryKeys.cart.all, 'recommended', ...productIds] as const,
  },
  pincode: {
    all: ['pincode'] as const,
    check: (pincode: string, inStock: boolean, type?: string) =>
      [...queryKeys.pincode.all, pincode, inStock, type ?? 'none'] as const,
  },
  mtoPrice: {
    all: ['mto-price'] as const,
    detail: (sku: string, purity: string) => [...queryKeys.mtoPrice.all, sku, purity] as const,
  },
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: ProductListParams) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    byHandle: (handle: string) => [...queryKeys.products.all, 'handle', handle] as const,
    related: (productId: string) => [...queryKeys.products.all, 'related', productId] as const,
    bundles: (handle: string) => [...queryKeys.products.all, 'bundles', handle] as const,
    reviews: (productId: string, params: ProductReviewsQueryParams) =>
      [...queryKeys.products.all, 'reviews', productId, params] as const,
  },
  collections: {
    all: ['collections'] as const,
    detail: (handle: string) => [...queryKeys.collections.all, handle] as const,
    products: (handle: string, query?: CollectionProductsParams) =>
      [...queryKeys.collections.all, handle, 'products', query] as const,
  },
  blogs: {
    all: ['blogs'] as const,
    lists: () => [...queryKeys.blogs.all, 'list'] as const,
    list: (params: BlogArticlesQueryParams) => [...queryKeys.blogs.all, 'list', params] as const,
    detail: (handle: string) => [...queryKeys.blogs.all, handle] as const,
  },
  cms: {
    all: ['cms'] as const,
    page: (slug: string) => [...queryKeys.cms.all, 'page', slug] as const,
    chunk: (slug: string, chunkId: number) =>
      [...queryKeys.cms.all, 'page', slug, 'chunk', chunkId] as const,
    home: () => [...queryKeys.cms.all, 'home'] as const,
  },
  search: {
    all: ['search'] as const,
    products: (query: string) => [...queryKeys.search.all, 'products', query] as const,
    autocomplete: (query: string) => [...queryKeys.search.all, 'autocomplete', query] as const,
    history: () => [...queryKeys.search.all, 'history'] as const,
  },
  stores: {
    all: ['stores'] as const,
    list: (params: StoreListQueryParams) => [...queryKeys.stores.all, params] as const,
  },
  wishlist: {
    all: ['wishlist'] as const,
    list: () => [...queryKeys.wishlist.all, 'list'] as const,
    productIds: () => [...queryKeys.wishlist.all, 'product-ids'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
    address: (id: string) => [...queryKeys.user.all, 'address', id] as const,
    orders: (query: { limit?: number; sinceId?: string; status?: string } = {}) =>
      [...queryKeys.user.all, 'orders', query] as const,
    order: (orderId: string) => [...queryKeys.user.all, 'order', orderId] as const,
    wallet: () => [...queryKeys.user.all, 'wallet'] as const,
    walletTransactions: () => [...queryKeys.user.all, 'wallet-transactions'] as const,
    recentlyViewed: (limit: number) => [...queryKeys.user.all, 'recently-viewed', limit] as const,
  },
  pop: {
    all: ['pop'] as const,
    subscriptions: (params: { limit?: number; offset?: number } = {}) =>
      [...queryKeys.pop.all, 'subscriptions', params] as const,
    subscription: (subId: string, params: { count?: number; skip?: number } = {}) =>
      [...queryKeys.pop.all, 'subscription', subId, params] as const,
    subscriptionDetail: (subscriptionId: string, params: { count?: number; skip?: number } = {}) =>
      [...queryKeys.pop.all, 'subscription', subscriptionId, params] as const,
  },
} as const;
