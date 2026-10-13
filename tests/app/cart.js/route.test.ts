/**
 * @jest-environment node
 */

import { GET } from '@/app/cart.js/route';
import { cartMessages } from '@/config/cart/cart.config';
import { AppError } from '@/lib/errors';

const mockGetCart = jest.fn();

jest.mock('@/services/server/shopify-ajax-cart.service.server', () => ({
  getShopifyAjaxCart: (...args: unknown[]) => mockGetCart(...args),
}));

describe('GET /cart.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCart.mockResolvedValue({ item_count: 2, token: 'abc?key=secret' });
  });

  it('returns the Ajax cart', async () => {
    const response = await GET();
    const body = (await response.json()) as { item_count: number; token: string };

    expect(response.status).toBe(200);
    expect(mockGetCart).toHaveBeenCalledTimes(1);
    expect(body.item_count).toBe(2);
    expect(body.token).toBe('abc?key=secret');
  });

  it('forwards backend status codes', async () => {
    mockGetCart.mockRejectedValue(new AppError('UNAUTHORISED', cartMessages.errors.updateQuantity, 401));

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
