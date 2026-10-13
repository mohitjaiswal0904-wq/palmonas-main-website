import type { AnalyticsPropertyValue } from '@/types/analytics/analytics.types';

/** Common properties merged into every tracked event. */
export interface AnalyticsBaseProperties {
  timestamp?: number;
  user_id?: string;
  session_id?: string;
  is_guest?: boolean;
  platform?: string;
  screen_name?: string;
  path?: string;
  search?: string;
}

/** Extensible property bag for events that accept ad-hoc scalar keys. */
export type AnalyticsExtensiblePayload = {
  [key: string]: AnalyticsPropertyValue | undefined;
};

export interface ProfileUpdatedPayload {
  fields_updated: string[];
  [key: string]: AnalyticsPropertyValue | string[] | undefined;
}

export interface ScreenViewedPayload {
  screen_name: string;
  load_time_ms?: number;
  previous_screen?: string;
  screen_class?: string;
  [key: string]: AnalyticsPropertyValue | undefined;
}

export interface ButtonClickedPayload {
  button_name: string;
  screen_name: string;
  context?: string;
  timestamp?: number;
  [key: string]: AnalyticsPropertyValue | undefined;
}

export interface AppOpenedPayload {
  source: string;
  deeplink_url?: string;
  timestamp?: number;
}

export interface AppBackgroundedPayload {
  timestamp?: number;
}

export interface UserLoggedInPayload {
  login_method: string;
  timestamp?: number;
}

export interface UserLoggedOutPayload {
  timestamp?: number;
}

export interface AuthSkipPayload {
  step: string;
  screen_name?: string;
  timestamp?: number;
}

export interface LoginFailedPayload {
  reason?: string;
  step?: string;
  timestamp?: number;
}

export interface OtpSentPayload {
  method?: string;
  timestamp?: number;
}

export interface GuestLoginClickedPayload {
  screen_name?: string;
  timestamp?: number;
}

export interface UserSignedUpPayload {
  user_id: string;
  signup_method: string;
  referral_source?: string;
  phone?: string;
  email?: string;
}

/** Line item shape for checkout and order events (serialized as `products_json`). */
export interface AnalyticsCheckoutProductLine {
  product_id: string;
  quantity: number;
  price: number;
}

export interface HamburgerMenuOpenedPayload {
  screen_name: string;
  previous_screen?: string;
}

export interface NavigationClickedPayload {
  nav_item_name: string;
  destination_screen: string;
  screen_name?: string;
  previous_screen?: string;
}

export interface TabSwitchedPayload {
  tab_name: string;
  previous_tab?: string;
  timestamp: number;
}

export interface HomeViewedPayload {
  collections_shown_count: number;
  banners_shown_count?: number;
  load_time_ms?: number;
}

export interface BannerClickedPayload {
  banner_id: string;
  banner_name: string;
  banner_position: number;
  campaign_name?: string;
  destination_screen?: string;
}

export interface CollectionTileClickedPayload {
  collection_id: string;
  collection_name: string;
  tile_position?: number;
  section_name?: string;
  source?: string;
}

export interface ViewAllClickedPayload {
  section_name: string;
  section_id?: string;
  destination_screen?: string;
}

export interface SectionExpandedPayload {
  section_name: string;
  section_id?: string;
  expanded: boolean;
}

export interface SearchOpenedPayload {
  entry_point: string;
  screen_name?: string;
}

export interface SearchPerformedPayload {
  query?: string;
  query_length?: number;
  entry_point?: string;
  filters_applied?: string;
  search_term?: string;
  results_count?: number;
  sort_by?: string;
  category?: string;
}

export interface SearchResultsViewedPayload {
  query: string;
  results_count: number;
  zero_results?: boolean;
}

export interface SearchResultClickedPayload {
  query: string;
  product_id: string;
  position?: number;
  collection_id?: string;
  collection_name?: string;
}

export interface SearchSuggestionClickedPayload {
  suggestion: string;
  position?: number;
  suggestion_type?: string;
}

export interface ClearSearchClickedPayload {
  screen_name?: string;
  had_query?: boolean;
}

export interface PlpViewedPayload {
  collection_id: string;
  collection_name: string;
  products_loaded_count?: number;
  sort_type?: string;
  filters_count?: number;
  load_time_ms?: number;
}

export interface PlpProductImpressionPayload {
  sku: string;
  collection_id: string;
  position?: number;
  price?: number;
  discount_percent?: number;
}

export interface PlpProductClickedPayload {
  sku: string;
  collection_id: string;
  position?: number;
  price?: number;
  collection_name?: string;
}

export interface FilterOpenedPayload {
  collection_id: string;
  screen_name?: string;
}

export interface FilterAppliedPayload {
  collection_id: string;
  filters_json?: string;
  filters_count?: number;
}

export interface SortAppliedPayload {
  collection_id: string;
  sort_type: string;
}

export interface CategoryViewedPayload {
  category_id: string;
  category_name: string;
  products_count?: number;
  timestamp: number;
}

export interface PdpViewedPayload {
  product_id: string;
  entry_point?: string;
  collection_id?: string;
  price?: number;
  mrp?: number;
  discount_percent?: number;
  metal_type?: string;
  purity?: string;
  gemstone?: string;
  in_stock?: boolean;
  is_customizable?: boolean;
}

export interface ProductViewedEcomPayload {
  product_id: string;
  product_name: string;
  product_type?: string;
  category?: string;
  price?: number;
  currency?: string;
  variant_id?: string;
  variant_name?: string;
  image_url?: string;
  brand?: string;
  timestamp: number;
}

export type PdpMediaAction = 'swipe' | 'zoom' | 'play';

export interface PdpMediaInteractedPayload {
  product_id: string;
  action: PdpMediaAction;
  media_index?: number;
}

export interface ProductDetailsExpandedPayload {
  product_id: string;
  section_name: string;
  screen_name?: string;
}

export interface SizeSelectedPayload {
  product_id: string;
  size: string;
  available?: boolean;
  size_type?: string;
}

export interface AddToCartClickedPayload {
  product_id: string;
  price?: number;
  quantity?: number;
  size?: string;
  collection_id?: string;
}

export interface BuyNowClickedPayload {
  product_id: string;
  price?: number;
  size?: string;
}

export interface ShareClickedPayload {
  product_id: string;
  channel?: string;
}

export type WishlistAction = 'added' | 'removed';

export interface WishlistToggledPayload {
  product_id: string;
  action: WishlistAction;
  origin_screen?: string;
  collection_id?: string;
}

export interface WishlistViewedPayload {
  items_count: number;
  screen_name?: string;
}

export interface WishlistItemClickedPayload {
  product_id: string;
  position?: number;
  screen_name?: string;
}

export interface WishlistAddedToCartPayload {
  product_id: string;
  price?: number;
  quantity?: number;
  origin_screen?: string;
}

export interface WishlistItemPayload {
  product_id: string;
  title: string;
  category?: string;
  image?: string;
  list_price?: number;
  mrp?: number;
  tags?: string;
  variant_id?: string;
  variant_title?: string;
  origin_screen?: string;
  collection_id?: string;
  currency?: string;
  timestamp?: number;
}

export interface CartViewedPayload {
  items_count: number;
  cart_value?: number;
  discount_amount?: number;
  coupon_applied?: boolean;
}

export interface QuantityChangedPayload {
  product_id: string;
  old_quantity?: number;
  new_quantity?: number;
  price?: number;
  cart_value_after?: number;
}

export interface CartItemRemovedPayload {
  product_id: string;
  cart_value_before?: number;
  cart_value_after?: number;
}

export interface CheckoutStartedPayload {
  items_count: number;
  cart_value?: number;
  coupon_applied?: boolean;
  entry_point?: string;
}

export interface AddToCartPayload {
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  price: number;
  quantity: number;
  currency?: string;
  category?: string;
  cart_value?: number;
  timestamp?: number;
}

export interface RemoveFromCartPayload {
  product_id: string;
  product_name: string;
  variant_id?: string;
  quantity: number;
  price: number;
  cart_value?: number;
  timestamp?: number;
}

export interface ApplyCouponClickedPayload {
  coupon_code: string;
  cart_value?: number;
}

export interface CouponRemovedPayload {
  coupon_code: string;
  cart_value?: number;
}

export interface CheckoutStartedEcomPayload {
  cart_id?: string;
  cart_value: number;
  items_count: number;
  currency?: string;
  products_json?: string;
}

export interface OrderCompletedPayload {
  order_id: string;
  total_amount: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  currency?: string;
  payment_method: string;
  items_count: number;
  products_json?: string;
  coupon_code?: string;
  timestamp?: number;
  /** Optional Enhanced Conversions fields for GTM Google Ads. */
  email?: string;
  phone?: string;
}

/** One Mixpanel Purchased Item line fired after Purchase Completed. */
export interface PurchasedItemPayload {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  currency?: string;
}

export interface PaymentInitiatedPayload {
  order_id?: string;
  amount: number;
  payment_method: string;
  currency?: string;
}

export interface PaymentCompletedPayload {
  order_id: string;
  transaction_id: string;
  amount: number;
  payment_method: string;
  currency?: string;
  status: string;
}

export interface PaymentFailedPayload {
  order_id?: string;
  amount: number;
  payment_method: string;
  error_message?: string;
  error_code?: string;
}

export interface GoldPurchasedPayload {
  amount: number;
  grams: number;
  rate_per_gram: number;
  payment_method: string;
  currency?: string;
  timestamp?: number;
}

export interface GoldSoldPayload {
  amount: number;
  grams: number;
  rate_per_gram: number;
  currency?: string;
  timestamp?: number;
}

export interface CouponAppliedPayload {
  coupon_code: string;
  discount_amount: number;
  discount_type: string;
  cart_value: number;
  timestamp?: number;
}

export interface OfferViewedPayload {
  offer_id: string;
  offer_name: string;
  offer_type: string;
  discount?: number;
  timestamp?: number;
}

export interface AddressAddedPayload {
  address_type: string;
  city?: string;
  state?: string;
  pincode?: string;
  timestamp?: number;
}

export interface DeliverySlotSelectedPayload {
  slot_date: string;
  slot_time?: string;
  delivery_type: string;
  timestamp?: number;
}

export interface OrdersListViewedPayload {
  orders_count?: number;
}

export interface OrderDetailViewedPayload {
  order_id: string;
  order_number?: string;
  order_status?: string;
}

export interface OrderTrackingViewedPayload {
  order_id: string;
  order_number?: string;
}

export interface ReorderClickedPayload {
  order_id: string;
  order_number?: string;
  items_count?: number;
}

export interface ReturnClickedPayload {
  order_id: string;
  order_number?: string;
}

export interface ExchangeClickedPayload {
  order_id: string;
  order_number?: string;
}

export interface CancelOrderClickedPayload {
  order_id: string;
  order_number?: string;
}

export interface AddressListViewedPayload {
  addresses_count?: number;
}

export interface AddAddressClickedPayload {
  screen_name?: string;
}

export interface EditAddressClickedPayload {
  address_id: string;
  screen_name?: string;
}

export interface AddressDeletedPayload {
  address_id: string;
}

export interface AddressSetDefaultPayload {
  address_id: string;
}

export interface WalletViewedPayload {
  balance?: number;
  currency?: string;
}

export interface AddMoneyClickedPayload {
  entry_point?: string;
  balance_before?: number;
}

export interface TransactionViewedPayload {
  transactions_count?: number;
}

export interface TransactionClickedPayload {
  transaction_id: string;
  transaction_type?: string;
  amount?: number;
}

export interface SharedPayload {
  content_type: string;
  content_id: string;
  method: string;
  screen_name?: string;
  timestamp?: number;
}

export interface NotificationPermissionRequestedPayload {
  timestamp?: number;
}

export interface NotificationPermissionGrantedPayload {
  timestamp?: number;
}

export interface NotificationClickedPayload {
  notification_id?: string;
  notification_type: string;
  action?: string;
  timestamp?: number;
}

export interface NotificationsListViewedPayload {
  notifications_count?: number;
  timestamp?: number;
}

export interface NotificationSettingsViewedPayload {
  timestamp?: number;
}

export interface ErrorOccurredPayload {
  error_message: string;
  error_code?: string;
  error_type: string;
  screen_name?: string;
  context?: string;
  stack_trace?: string;
  timestamp?: number;
}

export interface ApiCallPayload {
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  timestamp?: number;
}
