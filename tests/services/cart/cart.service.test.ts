import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import {
  addCartLines,
  applyCartDiscountApi,
  checkItemInCartApi,
  clearCartApi,
  createBuyNowCartApi,
  fetchCartDiscountsApi,
  getCurrentCart,
  fetchCartStatsApi,
  removeCartLines,
  updateCartLines,
  validatePreCheckoutApi,
} from '@/services/cart/cart.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('cart.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCurrentCart calls v2 current endpoint', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          id: 'gid://shopify/Cart/1',
          checkoutUrl: 'https://checkout',
          totalQuantity: 0,
          cost: {
            subtotalAmount: { amount: '0', currencyCode: 'INR' },
            totalAmount: { amount: '0', currencyCode: 'INR' },
            totalTaxAmount: null,
          },
          lines: [],
        },
      },
    });

    const cart = await getCurrentCart();
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.cart.current, {
      params: { cart_type: 'long_term' },
    });
    expect(cart.id).toBe('gid://shopify/Cart/1');
  });

  it('getCurrentCart unwraps raw cart payload without envelope', async () => {
    mockApi.get.mockResolvedValue({
      data: shopifyCartPayload,
    });

    const cart = await getCurrentCart();
    expect(cart.id).toBe('gid://shopify/Cart/1');
  });

  it('addCartLines posts merchandise array body', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 'gid://shopify/Cart/1',
          checkoutUrl: 'https://checkout',
          totalQuantity: 1,
          cost: {
            subtotalAmount: { amount: '100', currencyCode: 'INR' },
            totalAmount: { amount: '100', currencyCode: 'INR' },
            totalTaxAmount: null,
          },
          lines: [],
        },
      },
    });

    await addCartLines([
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1, attributes: [{}] },
    ]);

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.cart.add,
      [
        {
          merchandiseId: 'gid://shopify/ProductVariant/1',
          quantity: 1,
          attributes: [{}],
        },
      ],
      { params: undefined },
    );
  });

  it('addCartLines passes wait_for_shopify when requested', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 'gid://shopify/Cart/1',
          checkoutUrl: 'https://checkout',
          totalQuantity: 1,
          cost: {
            subtotalAmount: { amount: '100', currencyCode: 'INR' },
            totalAmount: { amount: '100', currencyCode: 'INR' },
            totalTaxAmount: null,
          },
          lines: [],
        },
      },
    });

    await addCartLines(
      [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1, attributes: [{}] }],
      { waitForShopify: true },
    );

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.cart.add,
      [
        {
          merchandiseId: 'gid://shopify/ProductVariant/1',
          quantity: 1,
          attributes: [{}],
        },
      ],
      { params: { wait_for_shopify: true } },
    );
  });

  it('fetchCartStatsApi maps stats', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: { cart_item_count: 3, wishlist_item_count: 1 },
      },
    });

    const stats = await fetchCartStatsApi();
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.cart.stats);
    expect(stats).toEqual({ cartCount: 3, wishlistCount: 1 });
  });

  const shopifyCartPayload = {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://checkout',
    totalQuantity: 1,
    cost: {
      subtotalAmount: { amount: '100', currencyCode: 'INR' },
      totalAmount: { amount: '100', currencyCode: 'INR' },
      totalTaxAmount: null,
    },
    lines: [],
  };

  it('updateCartLines puts line updates', async () => {
    mockApi.put.mockResolvedValue({ data: { data: shopifyCartPayload } });

    await updateCartLines([{ id: 'line-1', quantity: 2 }]);

    expect(mockApi.put).toHaveBeenCalledWith(
      ENDPOINTS.cart.update,
      [{ id: 'line-1', quantity: 2 }],
      { params: undefined },
    );
  });

  it('updateCartLines passes wait_for_shopify when requested', async () => {
    mockApi.put.mockResolvedValue({ data: { data: shopifyCartPayload } });

    await updateCartLines([{ id: 'line-1', quantity: 2 }], { waitForShopify: true });

    expect(mockApi.put).toHaveBeenCalledWith(
      ENDPOINTS.cart.update,
      [{ id: 'line-1', quantity: 2 }],
      { params: { wait_for_shopify: true } },
    );
  });

  it('removeCartLines deletes line ids', async () => {
    mockApi.delete.mockResolvedValue({ data: { data: shopifyCartPayload } });

    await removeCartLines(['line-1']);

    expect(mockApi.delete).toHaveBeenCalledWith(ENDPOINTS.cart.remove, {
      data: ['line-1'],
    });
  });

  it('clearCartApi clears cart', async () => {
    mockApi.delete.mockResolvedValue({ data: { data: shopifyCartPayload } });

    await clearCartApi();

    expect(mockApi.delete).toHaveBeenCalledWith(ENDPOINTS.cart.clear);
  });

  it('validatePreCheckoutApi returns validation payload', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { is_valid: true, cart_id: 'cart-1', items: [] } },
    });

    const result = await validatePreCheckoutApi();
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.cart.preCheckout);
    expect(result.is_valid).toBe(true);
  });

  it('createBuyNowCartApi posts buy-now lines', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 'gid://shopify/Cart/bn1',
          idWithKey: 'gid://shopify/Cart/bn1?key=x',
          checkoutUrl: 'https://checkout',
        },
      },
    });

    const result = await createBuyNowCartApi([
      { merchandiseId: '123', quantity: 1, attributes: [{}] },
    ]);

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.cart.buyNow, [
      { merchandiseId: '123', quantity: 1, attributes: [{}] },
    ]);
    expect(result.id).toBe('gid://shopify/Cart/bn1');
  });

  it('checkItemInCartApi queries product and variant', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { is_in_cart: true, quantity: 1 } },
    });

    const result = await checkItemInCartApi('prod-1', 'var-1');
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.cart.checkItem, {
      params: { product_id: 'prod-1', variant_id: 'var-1' },
    });
    expect(result.is_in_cart).toBe(true);
  });

  it('getCurrentCart unwraps raw cart payload without envelope', async () => {
    mockApi.get.mockResolvedValue({
      data: shopifyCartPayload,
    });

    const cart = await getCurrentCart();
    expect(cart.id).toBe('gid://shopify/Cart/1');
  });

  it('normalises API errors from getCurrentCart', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(getCurrentCart()).rejects.toThrow();
  });

  it('addCartLines uses default attributes when none provided', async () => {
    mockApi.post.mockResolvedValue({ data: { data: shopifyCartPayload } });

    await addCartLines([{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 }]);

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.cart.add,
      [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1, attributes: [{}] }],
      { params: undefined },
    );
  });

  it('updateCartLines normalises API errors', async () => {
    mockApi.put.mockRejectedValue(new Error('update failed'));

    await expect(updateCartLines([{ id: 'line-1', quantity: 2 }])).rejects.toThrow();
  });

  it('fetchCartStatsApi unwraps raw stats payload without envelope', async () => {
    mockApi.get.mockResolvedValue({
      data: { cart_item_count: 1, wishlist_item_count: 0 },
    });

    const stats = await fetchCartStatsApi();
    expect(stats.cartCount).toBe(1);
  });

  it('clearCartApi normalises API errors', async () => {
    mockApi.delete.mockRejectedValue(new Error('clear failed'));

    await expect(clearCartApi()).rejects.toThrow();
  });

  it('removeCartLines normalises API errors', async () => {
    mockApi.delete.mockRejectedValue(new Error('remove failed'));

    await expect(removeCartLines(['line-1'])).rejects.toThrow();
  });

  const discountListPayload = {
    cart_id: 'gid://shopify/Cart/1',
    platform_source: 'app',
    utm_details: '',
    request_id: 'req-1',
  };

  const discountEnvelope = {
    data: {
      availableDiscounts: [
        {
          offerType: 'store_offer' as const,
          discountCode: 'monsoon3',
          discountDetail: 'Get any 3 for ₹2699',
          amountSaved: 298,
        },
        {
          offerType: 'payment_offer' as const,
          discountCode: 'NAVIUPI',
          discountDetail: 'Upto ₹100 cashback',
          cashbackAmount: 89.91,
        },
      ],
      unavailableDiscounts: [
        {
          offerType: 'store_offer' as const,
          discountCode: 'eoss',
          discountDetail: 'Buy 1 Get 1 Free',
          failure_data: { reason: 'bxgy_items_not_added' },
        },
      ],
    },
  };

  it('fetchCartDiscountsApi posts list payload and unwraps discounts', async () => {
    mockApi.post.mockResolvedValue({ data: discountEnvelope });

    const result = await fetchCartDiscountsApi(discountListPayload);

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.cart.discountList, discountListPayload);
    expect(result.availableDiscounts).toHaveLength(2);
    expect(result.unavailableDiscounts[0]?.discountCode).toBe('eoss');
  });

  it('fetchCartDiscountsApi unwraps raw payload without envelope', async () => {
    mockApi.post.mockResolvedValue({ data: discountEnvelope.data });

    const result = await fetchCartDiscountsApi(discountListPayload);
    expect(result.availableDiscounts[0]?.discountCode).toBe('monsoon3');
  });

  it('fetchCartDiscountsApi normalises API errors', async () => {
    mockApi.post.mockRejectedValue(new Error('list failed'));

    await expect(fetchCartDiscountsApi(discountListPayload)).rejects.toThrow();
  });

  it('applyCartDiscountApi posts coupon codes and unwraps apply result', async () => {
    const applyEnvelope = {
      data: {
        appliedDiscounts: [
          {
            title: 'monsoon3',
            discount_amount: 298,
            value_type: 'fixed_amount',
            discount_type: 'BXatY',
          },
        ],
        applyFailures: [],
        removedDiscounts: [],
        removeFailures: [],
        discountData: {
          total_discount: 298,
          total_price: 5045,
          offer_type: 'store_offer',
        },
        updatedCart: {
          token: 'cart-token',
          item_count: 1,
          original_total_price: 99900,
          total_price: 96902,
          items: [
            {
              id: 43070320148737,
              key: 'gid://shopify/CartLine/line-1',
              quantity: 1,
              variant_id: 43070320148737,
              product_title: 'Ring',
              handle: 'ring',
              final_price: 99900,
              final_line_price: 99900,
              original_price: 120000,
            },
          ],
          discount: {
            title: 'monsoon3',
            total_discount: 298,
            total_price: 5045,
          },
        },
      },
    };
    mockApi.post.mockResolvedValue({ data: applyEnvelope });
    const applyPayload = { ...discountListPayload, coupon_codes: ['monsoon3'] };
    const existingCart = {
      id: 'cart-1',
      checkoutUrl: 'https://checkout.example.com',
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      currency: 'INR',
    };

    const result = await applyCartDiscountApi(applyPayload, { existingCart });

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.cart.discountApply, applyPayload);
    expect(result.appliedDiscounts[0]?.title).toBe('monsoon3');
    expect(result.discountData?.total_price).toBe(5045);
    expect(result.cart?.items).toHaveLength(1);
    expect(result.cart?.id).toBe('cart-1');
    expect(result.cart?.total).toBe(5045);
  });

  it('applyCartDiscountApi posts remove_coupon_codes to clear', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          appliedDiscounts: [],
          applyFailures: [],
          removedDiscounts: [],
          removeFailures: [],
          discountData: null,
        },
      },
    });
    const clearPayload = {
      ...discountListPayload,
      remove_coupon_codes: ['monsoon3'],
    };

    await applyCartDiscountApi(clearPayload);

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.cart.discountApply, clearPayload);
  });

  it('applyCartDiscountApi normalises API errors', async () => {
    mockApi.post.mockRejectedValue(new Error('apply failed'));

    await expect(
      applyCartDiscountApi({ ...discountListPayload, coupon_codes: ['bad'] }),
    ).rejects.toThrow();
  });
});
