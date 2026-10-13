import rawConfig from '@/config/analytics/analytics.config.json';
import type { AnalyticsProviderId } from '@/types/analytics';

type AnalyticsConfigJson = typeof rawConfig;

export const analyticsConfig = rawConfig as AnalyticsConfigJson;

/** Default currency appended to commerce events when omitted. */
export const analyticsDefaultCurrency = analyticsConfig.defaultCurrency;

/** localStorage + cookie key for the Mixpanel distinct id (survives logout / reload). */
export const mixpanelDistinctIdStorageKey = analyticsConfig.mixpanelDistinctIdStorageKey;

/** Cookie lifetime for the Mixpanel distinct id. */
export const mixpanelDistinctIdCookieDays = analyticsConfig.mixpanelDistinctIdCookieDays;

/** GoKwik checkout pixel channel + purchase event name. */
export const gokwikAnalyticsEvents = analyticsConfig.gokwikEvents;

/** Providers that load scripts only — excluded from canonical event fan-out. */
export const analyticsPixelOnlyProviderIds =
  analyticsConfig.pixelOnlyProviders as AnalyticsProviderId[];

/** Providers initialized on first track/identify — not during app bootstrap. */
export const analyticsLazyInitProviderIds =
  analyticsConfig.lazyInitProviders as AnalyticsProviderId[];

/** Delay in ms before first mixpanel-browser SDK load (defaults to 5000ms / 5 seconds). */
export const mixpanelInitDelayMs = analyticsConfig.mixpanelInitDelayMs ?? 5000;

/** Mixpanel Session Replay sampling and heatmap capture for the JS SDK init. */
export const mixpanelSessionReplay = analyticsConfig.mixpanelSessionReplay;

/** Canonical events that must not fan out to Mixpanel (Ads/auto leftovers). */
export const mixpanelIgnoredEvents = new Set(analyticsConfig.mixpanelIgnoredEvents);

/** Google Ads conversion `send_to` labels for GTM tag configuration (not used in site JS). */
export const analyticsGoogleAdsConversions = analyticsConfig.googleAdsConversions;

/** Canonical / mapped event names that map to a Google Ads conversion label in GTM. */
export type GoogleAdsConversionAction = keyof typeof analyticsGoogleAdsConversions;

/**
 * Maps a tracked event name to a Google Ads conversion action key for GTM docs/setup.
 *
 * @param eventName - Provider-mapped or canonical event name.
 */
export function resolveGoogleAdsConversionAction(
  eventName: string,
): GoogleAdsConversionAction | undefined {
  switch (eventName) {
    case 'conversion':
    case 'purchase':
    case 'order_completed':
      return 'purchase';
    case 'add_to_cart':
      return 'add_to_cart';
    case 'begin_checkout':
    case 'checkout_started':
    case 'checkout_started_ecom':
      return 'begin_checkout';
    case 'add_payment_info':
    case 'payment_initiated':
      return 'add_payment_info';
    case 'search':
    case 'search_performed':
    case 'search_results_viewed':
      return 'search';
    case 'page_view':
      return 'page_view';
    case 'view_item':
    case 'product_viewed_ecom':
    case 'pdp_viewed':
      return 'view_item';
    default:
      return undefined;
  }
}

/**
 * Resolves the Google Ads `send_to` label for GTM configuration reference.
 *
 * @param eventName - Provider-mapped event name.
 * @param purchaseSendToOverride - Optional env override for purchase conversions.
 */
export function resolveGoogleAdsConversionSendTo(
  eventName: string,
  purchaseSendToOverride?: string,
): string | undefined {
  const action = resolveGoogleAdsConversionAction(eventName);
  if (!action) {
    return undefined;
  }

  if (action === 'purchase' && purchaseSendToOverride?.trim()) {
    return purchaseSendToOverride.trim();
  }

  return analyticsGoogleAdsConversions[action];
}

/** Per-provider event name mapping keyed by canonical event name. */
export const analyticsEventMappings = analyticsConfig.events;

/** Provider-specific mapping for one canonical analytics event. */
export interface AnalyticsProviderEventMapping {
  eventName: string;
  /** Meta Pixel standard events use fbq("track"); custom events use fbq("trackCustom"). */
  standard?: boolean;
  properties?: Record<string, string>;
}

/** Canonical event name → provider id → mapping. */
export type AnalyticsEventMappingRegistry = Record<
  string,
  Partial<Record<AnalyticsProviderId, AnalyticsProviderEventMapping>>
>;

export const analyticsEventMappingRegistry =
  analyticsEventMappings as AnalyticsEventMappingRegistry;

/** Canonical analytics event names used by app code. */
export const analyticsCanonicalEvents = {
  // Legacy / automatic trackers
  pageView: 'page_view',
  viewItem: 'view_item',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  search: 'search',
  signUp: 'sign_up',
  login: 'login',
  click: 'click',
  // App lifecycle & auth
  appOpened: 'app_opened',
  openInAppClicked: 'open_in_app_clicked',
  appBackgrounded: 'app_backgrounded',
  userLoggedIn: 'user_logged_in',
  userLoggedOut: 'user_logged_out',
  authSkip: 'auth_skip',
  loginFailed: 'login_failed',
  otpSent: 'otp_sent',
  guestLoginClicked: 'guest_login_clicked',
  userSignedUp: 'user_signed_up',
  profileUpdated: 'profile_updated',
  // Navigation
  screenViewed: 'screen_viewed',
  hamburgerMenuOpened: 'hamburger_menu_opened',
  navigationClicked: 'navigation_clicked',
  tabSwitched: 'tab_switched',
  // Home
  homeViewed: 'home_viewed',
  bannerClicked: 'banner_clicked',
  collectionTileClicked: 'collection_tile_clicked',
  viewAllClicked: 'view_all_clicked',
  sectionExpanded: 'section_expanded',
  // Search
  searchOpened: 'search_opened',
  searchPerformed: 'search_performed',
  searchResultsViewed: 'search_results_viewed',
  searchResultClicked: 'search_result_clicked',
  searchSuggestionClicked: 'search_suggestion_clicked',
  clearSearchClicked: 'clear_search_clicked',
  // PLP / collection
  plpViewed: 'plp_viewed',
  plpProductImpression: 'plp_product_impression',
  plpProductClicked: 'plp_product_clicked',
  filterOpened: 'filter_opened',
  filterApplied: 'filter_applied',
  sortApplied: 'sort_applied',
  categoryViewed: 'category_viewed',
  // PDP
  pdpViewed: 'pdp_viewed',
  productViewedEcom: 'product_viewed_ecom',
  pdpMediaInteracted: 'pdp_media_interacted',
  productDetailsExpanded: 'product_details_expanded',
  sizeSelected: 'size_selected',
  addToCartClicked: 'add_to_cart_clicked',
  buyNowClicked: 'buy_now_clicked',
  shareClicked: 'share_clicked',
  callStoreClicked: 'call_store_clicked',
  visitStoreClicked: 'visit_store_clicked',
  // Wishlist
  wishlistToggled: 'wishlist_toggled',
  wishlistViewed: 'wishlist_viewed',
  wishlistItemClicked: 'wishlist_item_clicked',
  wishlistAddedToCart: 'wishlist_added_to_cart',
  addToWishlist: 'add_to_wishlist',
  removeFromWishlist: 'remove_from_wishlist',
  // Cart
  cartViewed: 'cart_viewed',
  quantityChanged: 'quantity_changed',
  cartItemRemoved: 'cart_item_removed',
  checkoutStarted: 'checkout_started',
  addToCart: 'add_to_cart',
  removeFromCart: 'remove_from_cart',
  applyCouponClicked: 'apply_coupon_clicked',
  couponRemoved: 'coupon_removed',
  // Checkout & payments
  checkoutStartedEcom: 'checkout_started_ecom',
  orderCompleted: 'order_completed',
  paymentInitiated: 'payment_initiated',
  paymentCompleted: 'payment_completed',
  paymentFailed: 'payment_failed',
  goldPurchased: 'gold_purchased',
  goldSold: 'gold_sold',
  couponApplied: 'coupon_applied',
  offerViewed: 'offer_viewed',
  addressAdded: 'address_added',
  deliverySlotSelected: 'delivery_slot_selected',
  // Orders
  ordersListViewed: 'orders_list_viewed',
  orderDetailViewed: 'order_detail_viewed',
  orderTrackingViewed: 'order_tracking_viewed',
  reorderClicked: 'reorder_clicked',
  returnClicked: 'return_clicked',
  exchangeClicked: 'exchange_clicked',
  cancelOrderClicked: 'cancel_order_clicked',
  // Address
  addressListViewed: 'address_list_viewed',
  addAddressClicked: 'add_address_clicked',
  editAddressClicked: 'edit_address_clicked',
  addressDeleted: 'address_deleted',
  addressSetDefault: 'address_set_default',
  // Wallet
  walletViewed: 'wallet_viewed',
  addMoneyClicked: 'add_money_clicked',
  transactionViewed: 'transaction_viewed',
  transactionClicked: 'transaction_clicked',
  // Named scroll / touch
  carouselScrolled: 'carousel_scrolled',
  offersRailScrolled: 'offers_rail_scrolled',
  pageScrolled: 'page_scrolled',
  purchasedItem: 'purchased_item',
  // Engagement / system
  buttonClicked: 'button_clicked',
  shared: 'shared',
  notificationPermissionRequested: 'notification_permission_requested',
  notificationPermissionGranted: 'notification_permission_granted',
  notificationClicked: 'notification_clicked',
  notificationsListViewed: 'notifications_list_viewed',
  notificationSettingsViewed: 'notification_settings_viewed',
  errorOccurred: 'error_occurred',
  apiCall: 'api_call',
} as const;

/** All canonical event name values — useful for config validation. */
export type AnalyticsCanonicalEventName =
  (typeof analyticsCanonicalEvents)[keyof typeof analyticsCanonicalEvents];

/** DOM attributes for declarative analytics on interactive elements. */
export const analyticsDataAttributes = {
  event: 'data-analytics-event',
  name: 'data-analytics-name',
  props: 'data-analytics-props',
  ignore: 'data-analytics-ignore',
} as const;

/** Property keys sent on automatic click events. */
export const analyticsClickPropertyKeys = {
  elementType: 'element_type',
  label: 'label',
  path: 'path',
  search: 'search',
  href: 'href',
} as const;

/** Property keys for collection/product page context on analytics events. */
export const analyticsPagePropertyKeys = {
  pageType: 'page_type',
  collectionName: 'collection_name',
  collectionHandle: 'collection_handle',
  productName: 'product_name',
  productHandle: 'product_handle',
} as const;

export type AnalyticsPageType = 'collection' | 'product' | 'search';

export interface AnalyticsPageContext {
  pageType?: AnalyticsPageType;
  collectionName?: string;
  collectionHandle?: string;
  productName?: string;
  productHandle?: string;
}
