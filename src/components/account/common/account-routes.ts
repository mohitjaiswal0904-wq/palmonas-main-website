export const ACCOUNT_ROUTES = {
  hub: '/account',
  login: '/account/login',
  register: '/account/register',
  profile: '/account/profile',
  orderHistory: '/account/order-history',
  orders: '/account/orders',
  /** External POP marketing / plans app (not an in-shell account panel). */
  planOfPurchase: '/pop',
  /** Legacy account shell route for POP subscription detail pages. */
  accountPlanOfPurchase: '/account/plan-of-purchase',
  /** Public wishlist page (not an in-shell account panel). */
  wishlist: '/wishlist',
  /** Legacy account shell route for the wishlist panel. */
  accountWishlist: '/account/wishlist',
  wallet: '/account/wallet',
  deliveryAddress: '/account/delivery-address',
  referAndEarn: '/account/refer-and-earn',
  support: '/account/support',
  howToEarn: '/account/how-to-earn',
  howToRedeem: '/account/how-to-redeem',
  faqs: '/account/faqs',
  privacyPolicy: '/account/privacy-policy',
} as const;

export function deliveryAddressNewPath(): string {
  return `${ACCOUNT_ROUTES.deliveryAddress}/new`;
}

export function deliveryAddressEditPath(addressId: string): string {
  return `${ACCOUNT_ROUTES.deliveryAddress}/${encodeURIComponent(addressId)}/edit`;
}

export function orderHistoryDetailPath(orderId: string): string {
  return `${ACCOUNT_ROUTES.orderHistory}/${encodeURIComponent(orderId)}`;
}

export function orderDetailPath(orderId: string): string {
  return `${ACCOUNT_ROUTES.orders}/${encodeURIComponent(orderId)}`;
}

/**
 * POP subscription detail lives under `/pop/my-plan`, not the account shell.
 */
export function planOfPurchaseDetailPath(subscriptionId: string): string {
  return `${ACCOUNT_ROUTES.planOfPurchase}/my-plan/${encodeURIComponent(subscriptionId)}`;
}

export function privacyPolicyDetailPath(slug: string): string {
  return `/account/privacy-policy/${slug}`;
}

/**
 * True when a menu href leaves the account shell (e.g. Plan of Purchase → `/pop`).
 */
export function isExternalAccountMenuHref(href: string): boolean {
  return !href.startsWith('/account');
}

export type AccountRoute = (typeof ACCOUNT_ROUTES)[keyof typeof ACCOUNT_ROUTES];

export const PROTECTED_ACCOUNT_ROUTES: AccountRoute[] = [
  ACCOUNT_ROUTES.hub,
  ACCOUNT_ROUTES.profile,
  ACCOUNT_ROUTES.orderHistory,
  ACCOUNT_ROUTES.orders,
  ACCOUNT_ROUTES.accountPlanOfPurchase,
  ACCOUNT_ROUTES.accountWishlist,
  ACCOUNT_ROUTES.wallet,
  ACCOUNT_ROUTES.deliveryAddress,
  ACCOUNT_ROUTES.referAndEarn,
  ACCOUNT_ROUTES.support,
  ACCOUNT_ROUTES.howToEarn,
  ACCOUNT_ROUTES.howToRedeem,
  ACCOUNT_ROUTES.faqs,
  ACCOUNT_ROUTES.privacyPolicy,
];
