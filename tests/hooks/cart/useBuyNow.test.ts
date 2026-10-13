import { act, renderHook } from '@testing-library/react';

import { useBuyNow } from '@/hooks/cart/useBuyNow';
import { cartMessages } from '@/config/cart/cart.config';
import { checkoutProvider } from '@/infrastructure/checkout';
import { createBuyNowCart } from '@/repositories/cart/cart.repository';
import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  createBuyNowCart: jest.fn(),
}));

jest.mock('@/infrastructure/checkout', () => ({
  checkoutProvider: { openCheckout: jest.fn() },
}));

const mockCreateBuyNowCart = createBuyNowCart as jest.MockedFunction<typeof createBuyNowCart>;
const mockOpenCheckout = checkoutProvider.openCheckout as jest.Mock;

describe('useBuyNow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateBuyNowCart.mockResolvedValue({
      id: 'buy-now-1',
      idWithKey: 'buy-now-1?key=x',
      checkoutUrl: 'https://checkout',
      totalQuantity: 1,
      cost: {
        subtotalAmount: { amount: '100', currencyCode: 'INR' },
        totalAmount: { amount: '100', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
      lines: [],
    });
    mockOpenCheckout.mockResolvedValue(undefined);
  });

  it('creates buy-now cart and opens checkout without auth guard', async () => {
    const { result } = renderHook(() => useBuyNow());

    await act(async () => {
      await result.current.createAndCheckout('variant-1', 1);
    });

    expect(mockCreateBuyNowCart).toHaveBeenCalledWith('variant-1', 1);
    expect(mockOpenCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: 'buy-now-1?key=x',
        source: 'buy_now',
        checkoutUrl: 'https://checkout',
      }),
    );
    expect(toastMock.showInfo).toHaveBeenCalledWith(cartMessages.toasts.buyNowProceeding);
    expect(result.current.loading).toBe(false);
  });

  it('formats variant id when formatGid is true', async () => {
    const { result } = renderHook(() => useBuyNow());

    await act(async () => {
      await result.current.createAndCheckout('123', 1, true);
    });

    expect(mockCreateBuyNowCart).toHaveBeenCalledWith('gid://shopify/ProductVariant/123', 1);
  });

  it('sets error and shows toast on failure', async () => {
    mockCreateBuyNowCart.mockRejectedValue(new Error('buy now failed'));
    const { result } = renderHook(() => useBuyNow());

    await act(async () => {
      try {
        await result.current.createAndCheckout('variant-1', 1);
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('buy now failed');
    expect(toastMock.showError).toHaveBeenCalledWith('buy now failed');
  });

  it('uses default buy-now error message for non-Error throws', async () => {
    mockCreateBuyNowCart.mockRejectedValue('unknown');
    const { result } = renderHook(() => useBuyNow());

    await act(async () => {
      try {
        await result.current.createAndCheckout('variant-1', 1);
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe(cartMessages.errors.buyNow);
    expect(toastMock.showError).toHaveBeenCalledWith(cartMessages.errors.buyNow);
  });
});
