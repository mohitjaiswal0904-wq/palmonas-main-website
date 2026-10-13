import { ENDPOINTS } from '@/lib/endpoints';
import { AppError } from '@/lib/errors';
import {
  applyShopifyAjaxCartUpdates,
  getShopifyAjaxCart,
} from '@/services/server/shopify-ajax-cart.service.server';
import type { ShopifyCart } from '@/types/cart';

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/server-api', () => ({
  createServerApi: jest.fn(async () => ({
    get: mockGet,
    put: mockPut,
    delete: mockDelete,
  })),
}));

const shopifyCart: ShopifyCart = {
  id: 'gid://shopify/Cart/abc',
  checkoutUrl: 'https://checkout',
  totalQuantity: 2,
  cost: {
    subtotalAmount: { amount: '1998', currencyCode: 'INR' },
    totalAmount: { amount: '1998', currencyCode: 'INR' },
    totalTaxAmount: null,
  },
  lines: [
    {
      id: 'gid://shopify/CartLine/111',
      quantity: 2,
      cost: {
        totalAmount: { amount: '1998', currencyCode: 'INR' },
        amountPerQuantity: { amount: '999', currencyCode: 'INR' },
      },
      merchandise: {
        id: 'gid://shopify/ProductVariant/45111239999745',
        title: 'Size 6',
        product: { title: 'Ring', handle: 'ring' },
      },
    },
  ],
};

describe('applyShopifyAjaxCartUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: shopifyCart } });
    mockPut.mockResolvedValue({ data: { data: shopifyCart } });
    mockDelete.mockResolvedValue({ data: { data: { ...shopifyCart, lines: [], totalQuantity: 0 } } });
  });

  it('updates matching lines and waits for Shopify', async () => {
    const result = await applyShopifyAjaxCartUpdates({ '45111239999745': 2 });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.cart.current, {
      params: { cart_type: 'long_term' },
    });
    expect(mockPut).toHaveBeenCalledWith(
      ENDPOINTS.cart.update,
      [{ id: 'gid://shopify/CartLine/111', quantity: 2 }],
      { params: { wait_for_shopify: true } },
    );
    expect(result.item_count).toBe(2);
    expect(result.note).toBe('');
    expect(result.attributes).toEqual({});
    expect(result.discount_codes).toEqual([]);
    expect(result.items_changelog).toEqual({ added: [], removed: [] });
  });

  it('removes lines when quantity is zero', async () => {
    await applyShopifyAjaxCartUpdates({ '45111239999745': 0 });

    expect(mockDelete).toHaveBeenCalledWith(ENDPOINTS.cart.remove, {
      data: ['gid://shopify/CartLine/111'],
    });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('skips mutations when no line matches', async () => {
    const result = await applyShopifyAjaxCartUpdates({ '1': 2 });

    expect(mockPut).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(result.item_count).toBe(2);
  });

  it('throws a normalised error when GET fails', async () => {
    mockGet.mockRejectedValue(new Error('network'));

    await expect(applyShopifyAjaxCartUpdates({ '45111239999745': 2 })).rejects.toBeInstanceOf(
      AppError,
    );
  });
});

describe('getShopifyAjaxCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: shopifyCart } });
  });

  it('returns the current cart as Ajax JSON', async () => {
    const result = await getShopifyAjaxCart();

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.cart.current, {
      params: { cart_type: 'long_term' },
    });
    expect(result.item_count).toBe(2);
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('throws a normalised error when GET fails', async () => {
    mockGet.mockRejectedValue(new Error('network'));

    await expect(getShopifyAjaxCart()).rejects.toBeInstanceOf(AppError);
  });
});
