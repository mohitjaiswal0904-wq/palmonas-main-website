import {
  addCartLines,
  applyCartDiscountApi,
  clearCartApi,
  createBuyNowCartApi,
  fetchCartDiscountsApi,
  fetchCartStatsApi,
  getCurrentCart,
  removeCartLines,
  updateCartLines,
  validatePreCheckoutApi,
} from '@/services/cart/cart.service';
import {
  addItems,
  addItemsBatch,
  applyCartDiscount,
  applyOptimisticAdd,
  applyOptimisticQuantity,
  applyOptimisticRemove,
  checkItemInCart,
  clearCart,
  createBuyNowCart,
  fetchCartDiscounts,
  fetchCartStats,
  fetchCurrentCart,
  invalidateCartCache,
  removeLines,
  mergeGuestCartAfterLogin,
  resolveCartIdForLogin,
  resolveCartIdForLoginFlow,
  updateLineQuantity,
  validatePreCheckout,
} from '@/repositories/cart/cart.repository';
import { transformShopifyCart, type Cart, type ShopifyCart } from '@/types/cart';

jest.mock('@/services/cart/cart.service', () => ({
  getCurrentCart: jest.fn(),
  addCartLines: jest.fn(),
  updateCartLines: jest.fn(),
  removeCartLines: jest.fn(),
  clearCartApi: jest.fn(),
  validatePreCheckoutApi: jest.fn(),
  createBuyNowCartApi: jest.fn(),
  fetchCartStatsApi: jest.fn(),
  checkItemInCartApi: jest.fn(),
  fetchCartDiscountsApi: jest.fn(),
  applyCartDiscountApi: jest.fn(),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: {
    getState: jest.fn(() => ({ cart: null, setCart: jest.fn() })),
  },
}));

const mockReadGuestCartSnapshot = jest.fn();

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  readGuestCartSnapshot: () => mockReadGuestCartSnapshot(),
}));

const mockGetCurrentCart = getCurrentCart as jest.MockedFunction<typeof getCurrentCart>;
const mockAddCartLines = addCartLines as jest.MockedFunction<typeof addCartLines>;
const mockUpdateCartLines = updateCartLines as jest.MockedFunction<typeof updateCartLines>;
const mockRemoveCartLines = removeCartLines as jest.MockedFunction<typeof removeCartLines>;
const mockClearCartApi = clearCartApi as jest.MockedFunction<typeof clearCartApi>;
const mockValidatePreCheckoutApi = validatePreCheckoutApi as jest.MockedFunction<
  typeof validatePreCheckoutApi
>;
const mockCreateBuyNowCartApi = createBuyNowCartApi as jest.MockedFunction<typeof createBuyNowCartApi>;
const mockFetchCartStatsApi = fetchCartStatsApi as jest.MockedFunction<typeof fetchCartStatsApi>;

const shopifyCart: ShopifyCart = {
  id: 'gid://shopify/Cart/abc',
  checkoutUrl: 'https://checkout.example.com',
  totalQuantity: 1,
  cost: {
    subtotalAmount: { amount: '100', currencyCode: 'INR' },
    totalAmount: { amount: '100', currencyCode: 'INR' },
    totalTaxAmount: null,
  },
  lines: [
    {
      id: 'line-1',
      quantity: 1,
      merchandise: {
        id: 'gid://shopify/ProductVariant/123',
        title: 'Gold',
        priceV2: { amount: '100', currencyCode: 'INR' },
        product: {
          id: 'prod-1',
          title: 'Ring',
          handle: 'ring',
          featuredImage: { url: 'https://cdn.example.com/img.jpg' },
          product_category: 'rings',
        },
      },
    },
  ],
};

const uiCart = transformShopifyCart(shopifyCart);

describe('cart.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidateCartCache();
    mockReadGuestCartSnapshot.mockReturnValue(null);
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    const { useCartStatsStore } = jest.requireMock('@/store/cart/cart-stats.store') as {
      useCartStatsStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({ cart: null, setCart: jest.fn() });
    useCartStatsStore.getState.mockReturnValue({ cartCount: 0 });
    mockGetCurrentCart.mockResolvedValue(shopifyCart);
    mockAddCartLines.mockResolvedValue(shopifyCart);
    mockUpdateCartLines.mockResolvedValue(shopifyCart);
    mockRemoveCartLines.mockResolvedValue({ ...shopifyCart, lines: [], totalQuantity: 0 });
    mockClearCartApi.mockResolvedValue({ ...shopifyCart, lines: [], totalQuantity: 0 });
    mockValidatePreCheckoutApi.mockResolvedValue({ is_valid: true, cart_id: 'cart-1', items: [] });
    mockCreateBuyNowCartApi.mockResolvedValue({
      id: 'buy-now-1',
      idWithKey: 'buy-now-1?key=x',
      checkoutUrl: 'https://checkout',
      totalQuantity: 1,
      cost: shopifyCart.cost,
      lines: shopifyCart.lines,
    });
    mockFetchCartStatsApi.mockResolvedValue({ cartCount: 2, wishlistCount: 1 });
  });

  it('fetchCurrentCart caches result within TTL', async () => {
    const first = await fetchCurrentCart();
    const second = await fetchCurrentCart();

    expect(mockGetCurrentCart).toHaveBeenCalledTimes(1);
    expect(first.items).toHaveLength(1);
    expect(second.id).toBe(first.id);
  });

  it('fetchCurrentCart bypasses cache when force is true', async () => {
    await fetchCurrentCart();
    await fetchCurrentCart({ force: true });

    expect(mockGetCurrentCart).toHaveBeenCalledTimes(2);
  });

  it('deduplicates in-flight fetchCurrentCart requests', async () => {
    let resolveFetch!: (value: ShopifyCart) => void;
    mockGetCurrentCart.mockReturnValue(
      new Promise<ShopifyCart>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const pendingA = fetchCurrentCart();
    const pendingB = fetchCurrentCart();
    resolveFetch(shopifyCart);

    const [a, b] = await Promise.all([pendingA, pendingB]);
    expect(mockGetCurrentCart).toHaveBeenCalledTimes(1);
    expect(a.id).toBe(b.id);
  });

  it('addItems formats variant id and updates cache', async () => {
    const cart = await addItems('123', 2);

    expect(mockAddCartLines).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          merchandiseId: 'gid://shopify/ProductVariant/123',
          quantity: 2,
        }),
      ],
      { waitForShopify: undefined },
    );
    expect(cart.items).toHaveLength(1);
  });

  it('addItems forwards waitForShopify to the service', async () => {
    await addItems('123', 1, { waitForShopify: true });

    expect(mockAddCartLines).toHaveBeenCalledWith(
      [expect.objectContaining({ merchandiseId: 'gid://shopify/ProductVariant/123' })],
      { waitForShopify: true },
    );
  });

  it('addItemsBatch preserves gid merchandise ids', async () => {
    await addItemsBatch([
      { merchandiseId: 'gid://shopify/ProductVariant/999', quantity: 1 },
    ]);

    expect(mockAddCartLines).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          merchandiseId: 'gid://shopify/ProductVariant/999',
        }),
      ],
      { waitForShopify: undefined },
    );
  });

  it('updateLineQuantity and removeLines delegate to service', async () => {
    await updateLineQuantity('line-1', 3);
    await removeLines(['line-1']);

    expect(mockUpdateCartLines).toHaveBeenCalledWith([{ id: 'line-1', quantity: 3 }], {
      waitForShopify: true,
    });
    expect(mockRemoveCartLines).toHaveBeenCalledWith(['line-1']);
  });

  it('clearCart and validatePreCheckout delegate to service', async () => {
    await clearCart();
    const result = await validatePreCheckout();

    expect(mockClearCartApi).toHaveBeenCalled();
    expect(mockValidatePreCheckoutApi).toHaveBeenCalled();
    expect(result.is_valid).toBe(true);
  });

  it('createBuyNowCart and fetchCartStats delegate to service', async () => {
    const buyNow = await createBuyNowCart('123', 1);
    const stats = await fetchCartStats();

    expect(mockCreateBuyNowCartApi).toHaveBeenCalled();
    expect(buyNow.id).toBe('buy-now-1');
    expect(stats).toEqual({ cartCount: 2, wishlistCount: 1 });
  });

  it('resolveCartIdForLogin returns cart id when present', () => {
    expect(resolveCartIdForLogin(uiCart)).toBe(uiCart.id);
    expect(resolveCartIdForLogin(null)).toBeUndefined();
  });

  it('applyOptimistic helpers adjust totals', () => {
    const removed = applyOptimisticRemove(uiCart, 'line-1');
    expect(removed.items).toHaveLength(0);
    expect(removed.totalItems).toBe(0);

    const updated = applyOptimisticQuantity(uiCart, 'line-1', 2);
    expect(updated.items[0]?.quantity).toBe(2);

    const added = applyOptimisticAdd(null, 'gid://shopify/ProductVariant/999', 1, {
      name: 'New Product',
    });
    expect(added.items).toHaveLength(1);
    expect(added.items[0]?.product.name).toBe('New Product');

    const merged = applyOptimisticAdd(uiCart, uiCart.items[0]!.product.variantId, 1);
    expect(merged.items[0]?.quantity).toBe(2);
  });

  it('preserves cart totals when optimistic-adding a zero-priced placeholder line', () => {
    const cartLevelPriced: Cart = {
      ...uiCart,
      subtotal: 5000,
      total: 4500,
      discount: 500,
      items: uiCart.items.map((item) => ({ ...item, price: 0, totalPrice: 0 })),
    };

    const added = applyOptimisticAdd(cartLevelPriced, 'gid://shopify/ProductVariant/999', 1);

    expect(added.items).toHaveLength(cartLevelPriced.items.length + 1);
    expect(added.totalItems).toBe(cartLevelPriced.totalItems + 1);
    expect(added.subtotal).toBe(5000);
    expect(added.total).toBe(4500);
    expect(added.discount).toBe(500);
  });

  it('checkItemInCart delegates to API layer', async () => {
    const { checkItemInCartApi } = jest.requireMock('@/services/cart/cart.service') as {
      checkItemInCartApi: jest.Mock;
    };
    checkItemInCartApi.mockResolvedValue({ is_in_cart: true, quantity: 2 });

    const result = await checkItemInCart('prod-1', 'var-1');
    expect(checkItemInCartApi).toHaveBeenCalledWith('prod-1', 'var-1');
    expect(result.is_in_cart).toBe(true);
  });

  it('addItems preserves raw variant id when formatGid is false', async () => {
    await addItems('raw-variant', 1, { formatGid: false });

    expect(mockAddCartLines).toHaveBeenCalledWith(
      [expect.objectContaining({ merchandiseId: 'raw-variant' })],
      { waitForShopify: undefined },
    );
  });

  it('addItems passes custom line attributes when provided', async () => {
    await addItems('123', 1, { attributes: [{ gift: true }] });

    expect(mockAddCartLines).toHaveBeenCalledWith(
      [expect.objectContaining({ attributes: [{ gift: true }] })],
      { waitForShopify: undefined },
    );
  });

  it('createBuyNowCart passes custom attributes', async () => {
    await createBuyNowCart('variant-1', 2, { attributes: [{ engrave: 'A' }] });

    expect(mockCreateBuyNowCartApi).toHaveBeenCalledWith([
      expect.objectContaining({ attributes: [{ engrave: 'A' }] }),
    ]);
  });

  it('fetchCurrentCart forwards cart type to service', async () => {
    await fetchCurrentCart({ cartType: 'short_term' });

    expect(mockGetCurrentCart).toHaveBeenCalledWith('short_term');
  });

  it('resolveCartIdForLoginFlow returns cart id from guest snapshot without fetch', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({ cart: null, setCart: jest.fn() });
    mockReadGuestCartSnapshot.mockReturnValue(transformShopifyCart(shopifyCart));

    const cartId = await resolveCartIdForLoginFlow('normal');

    expect(mockGetCurrentCart).not.toHaveBeenCalled();
    expect(cartId).toBe('gid://shopify/Cart/abc');
  });

  it('mergeGuestCartAfterLogin returns merged cart without add when GET has items', async () => {
    const guestSnapshot = transformShopifyCart(shopifyCart);

    const cart = await mergeGuestCartAfterLogin(guestSnapshot);

    expect(mockGetCurrentCart).toHaveBeenCalledTimes(1);
    expect(mockAddCartLines).not.toHaveBeenCalled();
    expect(cart.items).toHaveLength(1);
  });

  it('mergeGuestCartAfterLogin replays guest lines via add when GET is empty', async () => {
    const emptyCart = { ...shopifyCart, lines: [], totalQuantity: 0 };
    mockGetCurrentCart
      .mockResolvedValueOnce(emptyCart)
      .mockResolvedValueOnce(shopifyCart);
    const guestSnapshot = transformShopifyCart(shopifyCart);

    const cart = await mergeGuestCartAfterLogin(guestSnapshot);

    expect(mockGetCurrentCart).toHaveBeenCalledTimes(2);
    expect(mockAddCartLines).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          merchandiseId: 'gid://shopify/ProductVariant/123',
          quantity: 1,
        }),
      ],
      { waitForShopify: undefined },
    );
    expect(cart.items).toHaveLength(1);
  });

  it('mergeGuestCartAfterLogin adds only missing guest lines on partial merge', async () => {
    const guestCart: ShopifyCart = {
      ...shopifyCart,
      totalQuantity: 2,
      lines: [
        ...shopifyCart.lines,
        {
          id: 'line-2',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/456',
            title: 'Silver',
            priceV2: { amount: '200', currencyCode: 'INR' },
            product: {
              id: 'prod-2',
              title: 'Necklace',
              handle: 'necklace',
              featuredImage: { url: 'https://cdn.example.com/necklace.jpg' },
              product_category: 'necklaces',
            },
          },
        },
      ],
    };
    mockGetCurrentCart
      .mockResolvedValueOnce(shopifyCart)
      .mockResolvedValueOnce(guestCart);
    mockAddCartLines.mockResolvedValue(guestCart);
    const guestSnapshot = transformShopifyCart(guestCart);

    const cart = await mergeGuestCartAfterLogin(guestSnapshot);

    expect(mockGetCurrentCart).toHaveBeenCalledTimes(2);
    expect(mockAddCartLines).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          merchandiseId: 'gid://shopify/ProductVariant/456',
          quantity: 1,
        }),
      ],
      { waitForShopify: undefined },
    );
    expect(cart.items).toHaveLength(2);
  });

  it('resolveCartIdForLoginFlow fetches cart on checkout when store is empty', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    const setCart = jest.fn();
    useCartStore.getState.mockReturnValue({ cart: null, setCart });
    mockGetCurrentCart.mockResolvedValue(shopifyCart);

    const cartId = await resolveCartIdForLoginFlow('checkout');

    expect(mockGetCurrentCart).toHaveBeenCalledWith('long_term');
    expect(setCart).toHaveBeenCalled();
    expect(cartId).toBe('gid://shopify/Cart/abc');
  });

  it('resolveCartIdForLoginFlow prefers guest snapshot over store cart without fetch', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    const snapshotCart = transformShopifyCart(shopifyCart);
    const storeCart = {
      ...transformShopifyCart(shopifyCart),
      id: 'gid://shopify/Cart/store-only',
    };
    useCartStore.getState.mockReturnValue({ cart: storeCart, setCart: jest.fn() });
    mockReadGuestCartSnapshot.mockReturnValue(snapshotCart);

    const cartId = await resolveCartIdForLoginFlow('checkout');

    expect(mockGetCurrentCart).not.toHaveBeenCalled();
    expect(cartId).toBe('gid://shopify/Cart/abc');
  });

  it('resolveCartIdForLoginFlow does not fetch when guest had items without cart id', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({
      cart: { ...transformShopifyCart(shopifyCart), id: '', totalItems: 2 },
      setCart: jest.fn(),
    });
    mockReadGuestCartSnapshot.mockReturnValue(null);

    const cartId = await resolveCartIdForLoginFlow('normal');

    expect(mockGetCurrentCart).not.toHaveBeenCalled();
    expect(cartId).toBeUndefined();
  });

  it('resolveCartIdForLoginFlow skips fetch for normal login without store cart', async () => {
    const cartId = await resolveCartIdForLoginFlow('normal');

    expect(mockGetCurrentCart).not.toHaveBeenCalled();
    expect(cartId).toBeUndefined();
  });

  it('resolveCartIdForLoginFlow returns cart id from Zustand without fetch', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({
      cart: transformShopifyCart(shopifyCart),
      setCart: jest.fn(),
    });

    const cartId = await resolveCartIdForLoginFlow('normal');

    expect(mockGetCurrentCart).not.toHaveBeenCalled();
    expect(cartId).toBe('gid://shopify/Cart/abc');
  });

  it('fetchCartDiscounts delegates to discount list API', async () => {
    const mockFetch = fetchCartDiscountsApi as jest.MockedFunction<typeof fetchCartDiscountsApi>;
    const payload = {
      cart_id: 'gid://shopify/Cart/abc',
      platform_source: 'app',
      utm_details: '',
      request_id: 'r1',
    };
    mockFetch.mockResolvedValue({
      availableDiscounts: [
        {
          offerType: 'store_offer',
          discountCode: 'SAVE10',
          discountDetail: '10% off',
          amountSaved: 100,
        },
      ],
      unavailableDiscounts: [],
    });

    const result = await fetchCartDiscounts(payload);

    expect(mockFetch).toHaveBeenCalledWith(payload);
    expect(result.availableDiscounts[0]?.discountCode).toBe('SAVE10');
  });

  it('applyCartDiscount delegates to discount apply API', async () => {
    const mockApply = applyCartDiscountApi as jest.MockedFunction<typeof applyCartDiscountApi>;
    const payload = {
      cart_id: 'gid://shopify/Cart/abc',
      platform_source: 'app',
      utm_details: '',
      request_id: 'r2',
      coupon_codes: ['SAVE10'],
    };
    mockApply.mockResolvedValue({
      appliedDiscounts: [{ title: 'SAVE10', discount_amount: 100 }],
      applyFailures: [],
      removedDiscounts: [],
      removeFailures: [],
      discountData: { total_discount: 100, total_price: 900 },
      cart: {
        id: 'cart-1',
        checkoutUrl: '',
        items: [],
        totalItems: 0,
        subtotal: 1000,
        discount: 100,
        shipping: 0,
        tax: 0,
        total: 900,
        currency: 'INR',
      },
    });

    const result = await applyCartDiscount(payload, { existingCart: null });

    expect(mockApply).toHaveBeenCalledWith(payload, { existingCart: null });
    expect(result.discountData?.total_price).toBe(900);
  });

  it('applyCartDiscount removes via remove_coupon_codes', async () => {
    const mockApply = applyCartDiscountApi as jest.MockedFunction<typeof applyCartDiscountApi>;
    const payload = {
      cart_id: 'gid://shopify/Cart/abc',
      platform_source: 'app',
      utm_details: '',
      request_id: 'r3',
      remove_coupon_codes: ['SAVE10'],
    };
    mockApply.mockResolvedValue({
      appliedDiscounts: [],
      applyFailures: [],
      removedDiscounts: [],
      removeFailures: [],
      discountData: null,
    });

    await applyCartDiscount(payload, { existingCart: null });

    expect(mockApply).toHaveBeenCalledWith(payload, { existingCart: null });
  });
});
