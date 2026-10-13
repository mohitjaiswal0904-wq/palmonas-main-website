/**
 * @jest-environment node
 */

import { POST } from '@/app/cart/update.js/route';
import { cartMessages } from '@/config/cart/cart.config';
import { AppError } from '@/lib/errors';

const mockApply = jest.fn();

jest.mock('@/services/server/shopify-ajax-cart.service.server', () => ({
  applyShopifyAjaxCartUpdates: (...args: unknown[]) => mockApply(...args),
}));

describe('POST /cart/update.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApply.mockResolvedValue({ item_count: 2, token: 'abc' });
  });

  it('applies JSON updates and returns the Ajax cart', async () => {
    const request = new Request('http://localhost:3000/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: { '45111239999745:0576422178ee42eb81bd8b22bbe9698e': 2 },
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { item_count: number };

    expect(response.status).toBe(200);
    expect(mockApply).toHaveBeenCalledWith(
      {
        '45111239999745:0576422178ee42eb81bd8b22bbe9698e': 2,
      },
      { attributes: {} },
    );
    expect(body.item_count).toBe(2);
  });

  it('applies form-encoded updates', async () => {
    const request = new Request('http://localhost:3000/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'updates[45111239999745]=2',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockApply).toHaveBeenCalledWith({ '45111239999745': 2 }, { attributes: {} });
  });

  it('returns 400 for invalid JSON', async () => {
    const request = new Request('http://localhost:3000/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toBe('Invalid cart update payload');
    expect(mockApply).not.toHaveBeenCalled();
  });

  it('forwards backend status codes', async () => {
    mockApply.mockRejectedValue(new AppError('UNAUTHORISED', cartMessages.errors.updateQuantity, 401));

    const request = new Request('http://localhost:3000/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: { '45111239999745': 2 } }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
