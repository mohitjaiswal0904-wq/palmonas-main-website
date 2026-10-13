import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import {
  buildAnalyticsEventProperties,
  serializeAnalyticsProducts,
} from '@/lib/analytics/build-analytics-base-properties';
import type { AnalyticsPropertyValue } from '@/types/analytics';
import type {
  AddAddressClickedPayload,
  AddMoneyClickedPayload,
  AddToCartClickedPayload,
  AddToCartPayload,
  AddressAddedPayload,
  AddressDeletedPayload,
  AddressListViewedPayload,
  AddressSetDefaultPayload,
  AnalyticsCheckoutProductLine,
  ApiCallPayload,
  AppBackgroundedPayload,
  AppOpenedPayload,
  ApplyCouponClickedPayload,
  AuthSkipPayload,
  BannerClickedPayload,
  ButtonClickedPayload,
  BuyNowClickedPayload,
  CancelOrderClickedPayload,
  CartItemRemovedPayload,
  CartViewedPayload,
  CategoryViewedPayload,
  CheckoutStartedEcomPayload,
  CheckoutStartedPayload,
  ClearSearchClickedPayload,
  CollectionTileClickedPayload,
  PlpViewedPayload,
  CouponAppliedPayload,
  CouponRemovedPayload,
  DeliverySlotSelectedPayload,
  EditAddressClickedPayload,
  ErrorOccurredPayload,
  ExchangeClickedPayload,
  FilterAppliedPayload,
  FilterOpenedPayload,
  GoldPurchasedPayload,
  GoldSoldPayload,
  GuestLoginClickedPayload,
  HamburgerMenuOpenedPayload,
  HomeViewedPayload,
  LoginFailedPayload,
  NavigationClickedPayload,
  NotificationClickedPayload,
  NotificationPermissionGrantedPayload,
  NotificationPermissionRequestedPayload,
  NotificationSettingsViewedPayload,
  NotificationsListViewedPayload,
  OfferViewedPayload,
  OrderCompletedPayload,
  OrderDetailViewedPayload,
  OrderTrackingViewedPayload,
  OrdersListViewedPayload,
  OtpSentPayload,
  PaymentCompletedPayload,
  PaymentFailedPayload,
  PaymentInitiatedPayload,
  PdpMediaInteractedPayload,
  PurchasedItemPayload,
  PlpProductClickedPayload,
  PlpProductImpressionPayload,
  ProductDetailsExpandedPayload,
  ProductViewedEcomPayload,
  PdpViewedPayload,
  ProfileUpdatedPayload,
  QuantityChangedPayload,
  ReorderClickedPayload,
  RemoveFromCartPayload,
  ReturnClickedPayload,
  ScreenViewedPayload,
  SearchOpenedPayload,
  SearchPerformedPayload,
  SearchResultClickedPayload,
  SearchResultsViewedPayload,
  SearchSuggestionClickedPayload,
  SectionExpandedPayload,
  ShareClickedPayload,
  SharedPayload,
  SizeSelectedPayload,
  SortAppliedPayload,
  TabSwitchedPayload,
  TransactionClickedPayload,
  TransactionViewedPayload,
  UserLoggedInPayload,
  UserLoggedOutPayload,
  UserSignedUpPayload,
  ViewAllClickedPayload,
  WalletViewedPayload,
  WishlistAddedToCartPayload,
  WishlistItemClickedPayload,
  WishlistItemPayload,
  WishlistToggledPayload,
  WishlistViewedPayload,
} from '@/types/analytics/analytics-event-payloads.types';

/** Optional commerce fields forwarded to the analytics client. */
export interface AnalyticsTrackOptions {
  value?: number;
  currency?: string;
}

type ScalarPayload = Record<string, AnalyticsPropertyValue | undefined>;

/**
 * Creates a typed analytics tracker that merges base properties before fan-out.
 *
 * @param canonicalName - Canonical event key from analytics config.
 */
function createAnalyticsTracker<T extends object>(canonicalName: string) {
  return (payload: T, options?: AnalyticsTrackOptions): void => {
    void trackAnalyticsEvent({
      name: canonicalName,
      properties: buildAnalyticsEventProperties(payload as ScalarPayload),
      value: options?.value,
      currency: options?.currency,
    }).catch(() => {
      // ponytail: tracking failures must not affect UI flows.
    });
  };
}

/** App lifecycle & auth */
export const trackAppOpened = createAnalyticsTracker<AppOpenedPayload>(
  analyticsCanonicalEvents.appOpened,
);
export const trackAppBackgrounded = createAnalyticsTracker<AppBackgroundedPayload>(
  analyticsCanonicalEvents.appBackgrounded,
);
export const trackUserLoggedIn = createAnalyticsTracker<UserLoggedInPayload>(
  analyticsCanonicalEvents.userLoggedIn,
);
/** Alias for {@link trackUserLoggedIn}. */
export const trackUserLogin = trackUserLoggedIn;
export const trackUserLoggedOut = createAnalyticsTracker<UserLoggedOutPayload>(
  analyticsCanonicalEvents.userLoggedOut,
);
/** Alias for {@link trackUserLoggedOut}. */
export const trackUserLogout = trackUserLoggedOut;
export const trackAuthSkip = createAnalyticsTracker<AuthSkipPayload>(
  analyticsCanonicalEvents.authSkip,
);
export const trackLoginFailed = createAnalyticsTracker<LoginFailedPayload>(
  analyticsCanonicalEvents.loginFailed,
);
export const trackOtpSent = createAnalyticsTracker<OtpSentPayload>(
  analyticsCanonicalEvents.otpSent,
);
/** Alias for {@link trackOtpSent}. */
export const trackOTPSent = trackOtpSent;
export const trackGuestLoginClicked = createAnalyticsTracker<GuestLoginClickedPayload>(
  analyticsCanonicalEvents.guestLoginClicked,
);
export const trackUserSignup = createAnalyticsTracker<UserSignedUpPayload>(
  analyticsCanonicalEvents.userSignedUp,
);

/** Serializes `fields_updated` arrays for scalar-only analytics vendors. */
export function trackProfileUpdated(payload: ProfileUpdatedPayload): void {
  const fieldsUpdated = payload.fields_updated;
  void trackAnalyticsEvent({
    name: analyticsCanonicalEvents.profileUpdated,
    properties: buildAnalyticsEventProperties({
      ...payload,
      fields_updated: fieldsUpdated.join(','),
    }),
  }).catch(() => {
    // ponytail: tracking failures must not affect UI flows.
  });
}

/** Navigation */
export const trackScreenViewed = createAnalyticsTracker<ScreenViewedPayload>(
  analyticsCanonicalEvents.screenViewed,
);
/** Alias for {@link trackScreenViewed}. */
export const trackScreenView = trackScreenViewed;
export const trackHamburgerMenuOpened = createAnalyticsTracker<HamburgerMenuOpenedPayload>(
  analyticsCanonicalEvents.hamburgerMenuOpened,
);
export const trackNavigationClicked = createAnalyticsTracker<NavigationClickedPayload>(
  analyticsCanonicalEvents.navigationClicked,
);
export const trackTabSwitched = createAnalyticsTracker<TabSwitchedPayload>(
  analyticsCanonicalEvents.tabSwitched,
);

/** Home */
export const trackHomeViewed = createAnalyticsTracker<HomeViewedPayload>(
  analyticsCanonicalEvents.homeViewed,
);
export const trackBannerClicked = createAnalyticsTracker<BannerClickedPayload>(
  analyticsCanonicalEvents.bannerClicked,
);
export const trackCollectionTileClicked = createAnalyticsTracker<CollectionTileClickedPayload>(
  analyticsCanonicalEvents.collectionTileClicked,
);
export const trackViewAllClicked = createAnalyticsTracker<ViewAllClickedPayload>(
  analyticsCanonicalEvents.viewAllClicked,
);
export const trackSectionExpanded = createAnalyticsTracker<SectionExpandedPayload>(
  analyticsCanonicalEvents.sectionExpanded,
);

/** Search */
export const trackSearchOpened = createAnalyticsTracker<SearchOpenedPayload>(
  analyticsCanonicalEvents.searchOpened,
);
export const trackSearchPerformed = createAnalyticsTracker<SearchPerformedPayload>(
  analyticsCanonicalEvents.searchPerformed,
);
/** Alias for {@link trackSearchPerformed}. */
export const trackSearch = trackSearchPerformed;
export const trackSearchResultsViewed = createAnalyticsTracker<SearchResultsViewedPayload>(
  analyticsCanonicalEvents.searchResultsViewed,
);
export const trackSearchResultClicked = createAnalyticsTracker<SearchResultClickedPayload>(
  analyticsCanonicalEvents.searchResultClicked,
);
export const trackSearchSuggestionClicked = createAnalyticsTracker<SearchSuggestionClickedPayload>(
  analyticsCanonicalEvents.searchSuggestionClicked,
);
export const trackClearSearchClicked = createAnalyticsTracker<ClearSearchClickedPayload>(
  analyticsCanonicalEvents.clearSearchClicked,
);

/** PLP / collection */
export const trackPlpViewed = createAnalyticsTracker<PlpViewedPayload>(
  analyticsCanonicalEvents.plpViewed,
);
export const trackPLPProductImpression = createAnalyticsTracker<PlpProductImpressionPayload>(
  analyticsCanonicalEvents.plpProductImpression,
);
export const trackPLPProductClicked = createAnalyticsTracker<PlpProductClickedPayload>(
  analyticsCanonicalEvents.plpProductClicked,
);
export const trackFilterOpened = createAnalyticsTracker<FilterOpenedPayload>(
  analyticsCanonicalEvents.filterOpened,
);
export const trackFilterApplied = createAnalyticsTracker<FilterAppliedPayload>(
  analyticsCanonicalEvents.filterApplied,
);
export const trackSortApplied = createAnalyticsTracker<SortAppliedPayload>(
  analyticsCanonicalEvents.sortApplied,
);
export const trackCategoryViewed = createAnalyticsTracker<CategoryViewedPayload>(
  analyticsCanonicalEvents.categoryViewed,
);

/** PDP */
export const trackPdpViewed = createAnalyticsTracker<PdpViewedPayload>(
  analyticsCanonicalEvents.pdpViewed,
);
export const trackProductViewedEcom = createAnalyticsTracker<ProductViewedEcomPayload>(
  analyticsCanonicalEvents.productViewedEcom,
);
export const trackPDPMediaInteracted = createAnalyticsTracker<PdpMediaInteractedPayload>(
  analyticsCanonicalEvents.pdpMediaInteracted,
);
export const trackProductDetailsExpanded = createAnalyticsTracker<ProductDetailsExpandedPayload>(
  analyticsCanonicalEvents.productDetailsExpanded,
);
export const trackSizeSelected = createAnalyticsTracker<SizeSelectedPayload>(
  analyticsCanonicalEvents.sizeSelected,
);
export const trackAddToCartClicked = createAnalyticsTracker<AddToCartClickedPayload>(
  analyticsCanonicalEvents.addToCartClicked,
);
export const trackBuyNowClicked = createAnalyticsTracker<BuyNowClickedPayload>(
  analyticsCanonicalEvents.buyNowClicked,
);
export const trackShareClicked = createAnalyticsTracker<ShareClickedPayload>(
  analyticsCanonicalEvents.shareClicked,
);

/** Wishlist */
export const trackWishlistToggled = createAnalyticsTracker<WishlistToggledPayload>(
  analyticsCanonicalEvents.wishlistToggled,
);
export const trackWishlistViewed = createAnalyticsTracker<WishlistViewedPayload>(
  analyticsCanonicalEvents.wishlistViewed,
);
export const trackWishlistItemClicked = createAnalyticsTracker<WishlistItemClickedPayload>(
  analyticsCanonicalEvents.wishlistItemClicked,
);
export const trackWishlistAddedToCart = createAnalyticsTracker<WishlistAddedToCartPayload>(
  analyticsCanonicalEvents.wishlistAddedToCart,
);
export const trackAddToWishlist = createAnalyticsTracker<WishlistItemPayload>(
  analyticsCanonicalEvents.addToWishlist,
);
export const trackRemoveFromWishlist = createAnalyticsTracker<WishlistItemPayload>(
  analyticsCanonicalEvents.removeFromWishlist,
);

/** Cart */
export const trackCartViewed = createAnalyticsTracker<CartViewedPayload>(
  analyticsCanonicalEvents.cartViewed,
);
export const trackQuantityChanged = createAnalyticsTracker<QuantityChangedPayload>(
  analyticsCanonicalEvents.quantityChanged,
);
export const trackCartItemRemoved = createAnalyticsTracker<CartItemRemovedPayload>(
  analyticsCanonicalEvents.cartItemRemoved,
);
export const trackCheckoutStarted = createAnalyticsTracker<CheckoutStartedPayload>(
  analyticsCanonicalEvents.checkoutStarted,
);
export const trackAddToCart = createAnalyticsTracker<AddToCartPayload>(
  analyticsCanonicalEvents.addToCart,
);
export const trackRemoveFromCart = createAnalyticsTracker<RemoveFromCartPayload>(
  analyticsCanonicalEvents.removeFromCart,
);
export const trackApplyCouponClicked = createAnalyticsTracker<ApplyCouponClickedPayload>(
  analyticsCanonicalEvents.applyCouponClicked,
);
export const trackCouponRemoved = createAnalyticsTracker<CouponRemovedPayload>(
  analyticsCanonicalEvents.couponRemoved,
);

/** Checkout & payments */
export function trackCheckoutStartedEcom(
  payload: Omit<CheckoutStartedEcomPayload, 'products_json'> & {
    products?: AnalyticsCheckoutProductLine[];
  },
  options?: AnalyticsTrackOptions,
): void {
  const { products, ...rest } = payload;
  trackAnalyticsEvent({
    name: analyticsCanonicalEvents.checkoutStartedEcom,
    properties: buildAnalyticsEventProperties({
      ...rest,
      ...(products ? { products_json: serializeAnalyticsProducts(products) } : {}),
    }),
    value: options?.value ?? payload.cart_value,
    currency: options?.currency,
  }).catch(() => {});
}

export const trackPurchasedItem = createAnalyticsTracker<PurchasedItemPayload>(
  analyticsCanonicalEvents.purchasedItem,
);

export function trackOrderCompleted(
  payload: Omit<OrderCompletedPayload, 'products_json'> & {
    products?: AnalyticsCheckoutProductLine[];
  },
  options?: AnalyticsTrackOptions,
): void {
  const { products, ...rest } = payload;
  const currency = options?.currency ?? payload.currency;

  trackAnalyticsEvent({
    name: analyticsCanonicalEvents.orderCompleted,
    properties: buildAnalyticsEventProperties({
      ...rest,
      // GTM Google Ads Purchase tag reads transaction_id from the dataLayer.
      transaction_id: rest.order_id,
      ...(products ? { products_json: serializeAnalyticsProducts(products) } : {}),
    }),
    value: options?.value ?? payload.total_amount,
    currency,
  }).catch(() => {});

  if (!products) {
    return;
  }

  for (const line of products) {
    trackPurchasedItem(
      {
        order_id: rest.order_id,
        product_id: line.product_id,
        quantity: line.quantity,
        price: line.price,
        ...(currency ? { currency } : {}),
      },
      { value: line.price * line.quantity, currency },
    );
  }
}

export const trackPaymentInitiated = createAnalyticsTracker<PaymentInitiatedPayload>(
  analyticsCanonicalEvents.paymentInitiated,
);
export const trackPaymentCompleted = createAnalyticsTracker<PaymentCompletedPayload>(
  analyticsCanonicalEvents.paymentCompleted,
);
export const trackPaymentFailed = createAnalyticsTracker<PaymentFailedPayload>(
  analyticsCanonicalEvents.paymentFailed,
);
export const trackGoldPurchase = createAnalyticsTracker<GoldPurchasedPayload>(
  analyticsCanonicalEvents.goldPurchased,
);
export const trackGoldSold = createAnalyticsTracker<GoldSoldPayload>(
  analyticsCanonicalEvents.goldSold,
);
export const trackCouponApplied = createAnalyticsTracker<CouponAppliedPayload>(
  analyticsCanonicalEvents.couponApplied,
);
export const trackOfferViewed = createAnalyticsTracker<OfferViewedPayload>(
  analyticsCanonicalEvents.offerViewed,
);
export const trackAddressAdded = createAnalyticsTracker<AddressAddedPayload>(
  analyticsCanonicalEvents.addressAdded,
);
export const trackDeliverySlotSelected = createAnalyticsTracker<DeliverySlotSelectedPayload>(
  analyticsCanonicalEvents.deliverySlotSelected,
);

/** Orders */
export const trackOrdersListViewed = createAnalyticsTracker<OrdersListViewedPayload>(
  analyticsCanonicalEvents.ordersListViewed,
);
export const trackOrderDetailViewed = createAnalyticsTracker<OrderDetailViewedPayload>(
  analyticsCanonicalEvents.orderDetailViewed,
);
export const trackOrderTrackingViewed = createAnalyticsTracker<OrderTrackingViewedPayload>(
  analyticsCanonicalEvents.orderTrackingViewed,
);
export const trackReorderClicked = createAnalyticsTracker<ReorderClickedPayload>(
  analyticsCanonicalEvents.reorderClicked,
);
export const trackReturnClicked = createAnalyticsTracker<ReturnClickedPayload>(
  analyticsCanonicalEvents.returnClicked,
);
export const trackExchangeClicked = createAnalyticsTracker<ExchangeClickedPayload>(
  analyticsCanonicalEvents.exchangeClicked,
);
export const trackCancelOrderClicked = createAnalyticsTracker<CancelOrderClickedPayload>(
  analyticsCanonicalEvents.cancelOrderClicked,
);

/** Address */
export const trackAddressListViewed = createAnalyticsTracker<AddressListViewedPayload>(
  analyticsCanonicalEvents.addressListViewed,
);
export const trackAddAddressClicked = createAnalyticsTracker<AddAddressClickedPayload>(
  analyticsCanonicalEvents.addAddressClicked,
);
export const trackEditAddressClicked = createAnalyticsTracker<EditAddressClickedPayload>(
  analyticsCanonicalEvents.editAddressClicked,
);
export const trackAddressDeleted = createAnalyticsTracker<AddressDeletedPayload>(
  analyticsCanonicalEvents.addressDeleted,
);
export const trackAddressSetDefault = createAnalyticsTracker<AddressSetDefaultPayload>(
  analyticsCanonicalEvents.addressSetDefault,
);

/** Wallet */
export const trackWalletViewed = createAnalyticsTracker<WalletViewedPayload>(
  analyticsCanonicalEvents.walletViewed,
);
export const trackAddMoneyClicked = createAnalyticsTracker<AddMoneyClickedPayload>(
  analyticsCanonicalEvents.addMoneyClicked,
);
export const trackTransactionViewed = createAnalyticsTracker<TransactionViewedPayload>(
  analyticsCanonicalEvents.transactionViewed,
);
export const trackTransactionClicked = createAnalyticsTracker<TransactionClickedPayload>(
  analyticsCanonicalEvents.transactionClicked,
);

/** Engagement / system */
export const trackButtonClicked = createAnalyticsTracker<ButtonClickedPayload>(
  analyticsCanonicalEvents.buttonClicked,
);
/** Alias for {@link trackButtonClicked}. */
export const trackPress = trackButtonClicked;
export const trackShare = createAnalyticsTracker<SharedPayload>(analyticsCanonicalEvents.shared);
export const trackNotificationPermissionRequested =
  createAnalyticsTracker<NotificationPermissionRequestedPayload>(
    analyticsCanonicalEvents.notificationPermissionRequested,
  );
export const trackNotificationPermissionGranted =
  createAnalyticsTracker<NotificationPermissionGrantedPayload>(
    analyticsCanonicalEvents.notificationPermissionGranted,
  );
export const trackNotificationClicked = createAnalyticsTracker<NotificationClickedPayload>(
  analyticsCanonicalEvents.notificationClicked,
);
export const trackNotificationsListViewed = createAnalyticsTracker<NotificationsListViewedPayload>(
  analyticsCanonicalEvents.notificationsListViewed,
);
export const trackNotificationSettingsViewed =
  createAnalyticsTracker<NotificationSettingsViewedPayload>(
    analyticsCanonicalEvents.notificationSettingsViewed,
  );
export const trackError = createAnalyticsTracker<ErrorOccurredPayload>(
  analyticsCanonicalEvents.errorOccurred,
);
export const trackAPICall = createAnalyticsTracker<ApiCallPayload>(
  analyticsCanonicalEvents.apiCall,
);
