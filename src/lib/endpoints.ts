/** External backend paths — NOT Next.js Route Handlers. Base URL from getApiBaseUrl(). */
function normaliseProductRouteParam(value: string): string {
  return value.trim().split('/').pop() ?? value.trim();
}

function encodeProductPathSegment(value: string): string {
  return encodeURIComponent(normaliseProductRouteParam(value));
}

function isNumericProductRouteParam(value: string): boolean {
  return /^\d+$/.test(normaliseProductRouteParam(value));
}

export const ENDPOINTS = {
  auth: {
    login: '/api/v2/auth/login',
    guestLogin: '/api/v2/auth/guest-login',
    logout: '/api/v2/auth/logout',
    refresh: '/api/v2/auth/refresh-token',
    validate: '/api/v2/auth/validate-token',
    sessions: '/api/v2/auth/sessions',
    account: '/api/v2/auth/account',
    sessionById: (id: string) => `/api/v2/auth/sessions/${id}`,
    me: '/api/v1/user/details',
  },
  products: {
    list: '/api/v1/shopify/products/search',
    detail: (id: string) => `/api/v2/product/id/${encodeProductPathSegment(id)}`,
    detailByHandle: (handle: string) =>
      `/api/v2/product/handle/${encodeProductPathSegment(handle)}`,
    detailFromRouteParam: (value: string) =>
      isNumericProductRouteParam(value)
        ? `/api/v2/product/id/${encodeProductPathSegment(value)}`
        : `/api/v2/product/handle/${encodeProductPathSegment(value)}`,
    recommendations: (id: string) =>
      `/api/v1/shopify/product/${encodeProductPathSegment(id)}/recommendations`,
    bundles: (handle: string) =>
      `/api/v2/shopify/product/${encodeProductPathSegment(handle)}/bundles`,
    reviews: (id: string) => `/api/v2/products/${encodeProductPathSegment(id)}/reviews`,
  },
  search: {
    products: '/api/v2/search/products',
    history: '/api/v2/shopify/search/history',
  },
  collections: {
    byHandle: (handle: string) =>
      `/api/v2/shopify/collections/${encodeURIComponent(handle.trim())}`,
    products: (handle: string) =>
      `/api/v2/shopify/collections/${encodeURIComponent(handle.trim())}/products`,
  },
  orders: {
    list: '/api/v1/user/orders',
    detail: (id: string) => `/api/v1/user/orders/${id}`,
  },
  user: {
    details: '/api/v2/user/details',
    addresses: '/api/v2/user/addresses',
    addressById: (id: string) => `/api/v2/user/addresses/${encodeURIComponent(id)}`,
    addressDefault: (id: string) => `/api/v2/user/addresses/${encodeURIComponent(id)}/default`,
    orders: '/api/v2/user/orders',
    orderById: (id: string) => `/api/v2/user/orders/${encodeURIComponent(id)}`,
    orderInvoice: (id: string) => `/api/v2/user/orders/${encodeURIComponent(id)}/invoice`,
    orderTransactions: (id: string) => `/api/v2/user/orders/${encodeURIComponent(id)}/transactions`,
    wallet: '/api/v2/user/wallet',
    walletTransactions: '/api/v2/user/wallet/transactions',
    recentlyViewedProducts: '/api/v2/user/recently-viewed-products',
  },
  cms: {
    slotDefault: (slot: string) => `/api/v2/cms/slots/${slot}/default`,
    pageBySlug: (slug: string) => `/api/v1/cms/pages/slug/${slug}/app`,
    pageShellBySlug: (slug: string) => `/api/v2/cms/pages/slug/${slug}/app/shell`,
    pageShellById: (pageId: string) => `/api/v2/cms/pages/${pageId}/app/shell`,
    pageChunkBySlug: (slug: string, chunkId: number) =>
      `/api/v2/cms/pages/slug/${slug}/app/chunks/${chunkId}`,
    pageChunksBySlug: (slug: string) => `/api/v2/cms/pages/slug/${slug}/app/chunks`,
  },
  wishlist: {
    list: '/api/v2/wishlist',
    add: '/api/v2/wishlist/add',
    clear: '/api/v2/wishlist',
    removeProduct: (productId: string) =>
      `/api/v2/wishlist/product/${encodeURIComponent(productId)}`,
  },
  cart: {
    checkItem: '/api/v2/cart/check-item',
    current: '/api/v2/cart/current',
    list: '/api/v2/cart',
    create: '/api/v2/cart/create',
    preCheckout: '/api/v2/cart/pre-checkout',
    buyNow: '/api/v2/cart/buy-now',
    add: '/api/v2/cart/add',
    update: '/api/v2/cart/update',
    remove: '/api/v2/cart/remove',
    clear: '/api/v2/cart/clear',
    stats: '/api/v2/cart/stats',
    byId: (id: string) => `/api/v2/cart/by-id/${encodeURIComponent(id)}`,
    transactionStatus: (id: string) => `/api/v2/cart/transaction-status/${encodeURIComponent(id)}`,
    discountList: '/api/v2/discounts/cart/list',
    discountApply: '/api/v2/discounts/cart/apply',
  },
  blogs: {
    articles: (blogHandle: string) => `/api/v2/blogs/${encodeURIComponent(blogHandle)}/articles`,
    article: (blogHandle: string, articleHandle: string) => {
      const blog = encodeURIComponent(blogHandle);
      const article = encodeURIComponent(articleHandle);

      return `/api/v2/blogs/${blog}/articles/${article}`;
    },
  },
  pop: {
    subscriptions: '/api/v2/pop/subscriptions',
    subscriptionDetail: (subscriptionId: string) =>
      `/api/v2/pop/subscriptions/${encodeURIComponent(subscriptionId)}`,
  },
} as const;
