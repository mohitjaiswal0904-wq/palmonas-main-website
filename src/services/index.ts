/**
 * Client-only services — for hooks, mutations, and user-triggered refetch.
 * Server Components must use `@/services/server/*` instead.
 */
export { getLatestBlogs, getBlogByHandle } from '@/services/blog.service';
export {
  addCartLines,
  checkItemInCartApi,
  clearCartApi,
  createBuyNowCartApi,
  fetchCartStatsApi,
  getCurrentCart,
  removeCartLines,
  updateCartLines,
  validatePreCheckoutApi,
} from '@/services/cart/cart.service';
export { getHomeSections, getPageSections } from '@/services/cms.service';
export {
  getCurrentCustomer,
  getCurrentCustomer as getCurrentUser,
  getUserDetailsForPopPrefill,
  login,
  logout,
} from '@/services/customer.service';
export { checkEdd, validatePincode } from '@/services/pincode.service';
export {
  getProduct,
  getProductBundles,
  getProductByHandle,
  getProductList,
  getRelatedProducts,
} from '@/services/product.service';
export { searchProducts, searchProductsList } from '@/services/search.service';
export {
  createUserAddress,
  deleteUserAddress,
  getRecentlyViewedProducts,
  getUserAddressById,
  getUserAddresses,
  getUserOrderById,
  getUserOrders,
  getUserProfile,
  getUserWallet,
  getUserWalletTransactions,
  setDefaultUserAddress,
  updateUserAddress,
  updateUserProfile,
} from '@/services/user.service';
export {
  createPopSubscription,
  createPopSubscriptionFromAccount,
  getPopSubscriptionById,
  getPopSubscriptionDetail,
  getPopSubscriptions,
  listPopSubscriptions,
} from '@/services/pop.service';
