import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';

/**
 * In-page account panels selectable from the hub menu.
 * Nested detail routes are not panels — they render via Next `children`.
 * Plan of Purchase (`/pop`) and Wishlist (`/wishlist`) are external and not listed here.
 */
export type AccountPanelId =
  | 'profile'
  | 'order-history'
  | 'orders'
  | 'wishlist'
  | 'wallet'
  | 'delivery-address'
  | 'refer-and-earn'
  | 'support'
  | 'how-to-earn'
  | 'how-to-redeem'
  | 'faqs'
  | 'privacy-policy';

const PANEL_PATHS: Record<AccountPanelId, string> = {
  'profile': ACCOUNT_ROUTES.profile,
  'order-history': ACCOUNT_ROUTES.orderHistory,
  'orders': ACCOUNT_ROUTES.orders,
  'wishlist': ACCOUNT_ROUTES.accountWishlist,
  'wallet': ACCOUNT_ROUTES.wallet,
  'delivery-address': ACCOUNT_ROUTES.deliveryAddress,
  'refer-and-earn': ACCOUNT_ROUTES.referAndEarn,
  'support': ACCOUNT_ROUTES.support,
  'how-to-earn': ACCOUNT_ROUTES.howToEarn,
  'how-to-redeem': ACCOUNT_ROUTES.howToRedeem,
  'faqs': ACCOUNT_ROUTES.faqs,
  'privacy-policy': ACCOUNT_ROUTES.privacyPolicy,
};

const PATH_TO_PANEL = new Map<string, AccountPanelId>(
  (Object.entries(PANEL_PATHS) as [AccountPanelId, string][]).map(([id, path]) => [path, id]),
);

/**
 * True when pathname is a nested account detail (order, address form, POP subscription).
 * Those keep rendering the Next.js page `children` tree.
 */
export function isAccountNestedDetailPath(pathname: string): boolean {
  if (
    pathname.startsWith(`${ACCOUNT_ROUTES.orderHistory}/`) ||
    pathname.startsWith(`${ACCOUNT_ROUTES.orders}/`) ||
    pathname.startsWith(`${ACCOUNT_ROUTES.accountPlanOfPurchase}/`)
  ) {
    return true;
  }

  if (pathname === `${ACCOUNT_ROUTES.deliveryAddress}/new`) {
    return true;
  }

  if (pathname.startsWith(`${ACCOUNT_ROUTES.deliveryAddress}/`) && pathname.endsWith('/edit')) {
    return true;
  }

  return false;
}

/**
 * Resolve the in-page panel for a pathname.
 * @returns panel id, or `null` for hub / nested detail / unknown / external routes
 */
export function resolveAccountPanel(pathname: string): AccountPanelId | null {
  if (!pathname.startsWith('/account')) {
    return null;
  }

  if (pathname === ACCOUNT_ROUTES.hub || pathname === `${ACCOUNT_ROUTES.hub}/`) {
    return null;
  }

  if (isAccountNestedDetailPath(pathname)) {
    return null;
  }

  return PATH_TO_PANEL.get(pathname) ?? null;
}

/**
 * Href for a panel (soft URL replace target).
 */
export function getAccountPanelHref(panelId: AccountPanelId): string {
  return PANEL_PATHS[panelId];
}

/** Handler for in-page menu selection (menu item id + configured href). */
export type AccountSelectPanelHandler = (menuItemId: string, href: string) => void;

/**
 * Map hub menu item ids to in-page panel ids.
 * Returns `null` for external items (Plan of Purchase → `/pop`, Wishlist → `/wishlist`).
 */
export function panelIdFromMenuItemId(menuItemId: string): AccountPanelId | null {
  if (menuItemId === 'plan-of-purchase' || menuItemId === 'wishlist') {
    return null;
  }

  if (menuItemId in PANEL_PATHS) {
    return menuItemId as AccountPanelId;
  }

  return null;
}
