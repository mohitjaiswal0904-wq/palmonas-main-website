import {
  lineMatchesAjaxKey,
  parseShopifyAjaxAttributes,
  parseShopifyAjaxUpdatesForm,
  parseShopifyAjaxUpdatesJson,
  resolveShopifyAjaxLineMutations,
  toShopifyAjaxCart,
} from '@/lib/cart/shopify-ajax-update';
import type { ShopifyCart, ShopifyCartLine } from '@/types/cart';

function line(overrides: Partial<ShopifyCartLine> & { key?: string } = {}): ShopifyCartLine {
  return {
    id: 'gid://shopify/CartLine/111',
    quantity: 1,
    cost: {
      totalAmount: { amount: '999', currencyCode: 'INR' },
      amountPerQuantity: { amount: '999', currencyCode: 'INR' },
    },
    merchandise: {
      id: 'gid://shopify/ProductVariant/45111239999745',
      title: 'Size 6',
      priceV2: { amount: '999', currencyCode: 'INR' },
      product: {
        id: 'gid://shopify/Product/1',
        title: 'Mini Solitaire Ring',
        handle: 'mini-solitaire-ring',
        featuredImage: { url: 'https://cdn.example.com/ring.jpg' },
      },
    },
    ...overrides,
  };
}

const cart: ShopifyCart = {
  id: 'gid://shopify/Cart/abc?key=secret',
  checkoutUrl: 'https://checkout',
  totalQuantity: 1,
  cost: {
    subtotalAmount: { amount: '999', currencyCode: 'INR' },
    totalAmount: { amount: '999', currencyCode: 'INR' },
    totalTaxAmount: null,
  },
  lines: [line()],
};

describe('parseShopifyAjaxAttributes', () => {
  it('reads a cart attributes object', () => {
    expect(parseShopifyAjaxAttributes({ attributes: { Gokwik: 'Checkout' } })).toEqual({
      Gokwik: 'Checkout',
    });
  });

  it('returns empty when attributes are missing', () => {
    expect(parseShopifyAjaxAttributes({ updates: { '1': 2 } })).toEqual({});
  });

  it('returns empty when the body is not an object', () => {
    expect(parseShopifyAjaxAttributes(null)).toEqual({});
    expect(parseShopifyAjaxAttributes([])).toEqual({});
  });

  it('returns empty when attributes is an array', () => {
    expect(parseShopifyAjaxAttributes({ attributes: [{ key: 'a' }] })).toEqual({});
  });
});

describe('parseShopifyAjaxUpdatesJson', () => {
  it('reads the wrapped updates map', () => {
    expect(
      parseShopifyAjaxUpdatesJson({
        updates: { '45111239999745:0576422178ee42eb81bd8b22bbe9698e': 2 },
      }),
    ).toEqual({ '45111239999745:0576422178ee42eb81bd8b22bbe9698e': 2 });
  });

  it('reads a bare updates map', () => {
    expect(parseShopifyAjaxUpdatesJson({ '45111239999745': 3 })).toEqual({
      '45111239999745': 3,
    });
  });

  it('throws when the body is not an object', () => {
    expect(() => parseShopifyAjaxUpdatesJson(null)).toThrow('Invalid cart update payload');
    expect(() => parseShopifyAjaxUpdatesJson([])).toThrow('Invalid cart update payload');
  });

  it('drops invalid quantities', () => {
    expect(parseShopifyAjaxUpdatesJson({ updates: { a: -1, b: 'x', c: 2.9 } })).toEqual({
      c: 2,
    });
  });
});

describe('parseShopifyAjaxUpdatesForm', () => {
  it('reads updates[key] fields', () => {
    const form = new FormData();
    form.set('updates[45111239999745:abc]', '2');
    expect(parseShopifyAjaxUpdatesForm(form)).toEqual({ '45111239999745:abc': 2 });
  });

  it('returns an empty map when no updates fields exist', () => {
    const form = new FormData();
    form.set('quantity', '2');
    expect(parseShopifyAjaxUpdatesForm(form)).toEqual({});
  });
});

describe('lineMatchesAjaxKey', () => {
  it('matches a classic Shopify line key', () => {
    const keyed = line({ key: '45111239999745:0576422178ee42eb81bd8b22bbe9698e' } as never);
    expect(lineMatchesAjaxKey(keyed, '45111239999745:0576422178ee42eb81bd8b22bbe9698e')).toBe(
      true,
    );
  });

  it('matches a numeric variant id', () => {
    expect(lineMatchesAjaxKey(line(), '45111239999745')).toBe(true);
  });

  it('rejects an empty key', () => {
    expect(lineMatchesAjaxKey(line(), '   ')).toBe(false);
  });

  it('rejects a different variant', () => {
    expect(lineMatchesAjaxKey(line(), '999')).toBe(false);
  });
});

describe('resolveShopifyAjaxLineMutations', () => {
  it('updates the matching line', () => {
    expect(
      resolveShopifyAjaxLineMutations([line()], { '45111239999745': 2 }),
    ).toEqual({
      updates: [{ id: 'gid://shopify/CartLine/111', quantity: 2 }],
      removes: [],
    });
  });

  it('falls back to variant id when the unique suffix is unknown', () => {
    expect(
      resolveShopifyAjaxLineMutations([line()], {
        '45111239999745:0576422178ee42eb81bd8b22bbe9698e': 2,
      }),
    ).toEqual({
      updates: [{ id: 'gid://shopify/CartLine/111', quantity: 2 }],
      removes: [],
    });
  });

  it('removes the line when quantity is zero', () => {
    expect(resolveShopifyAjaxLineMutations([line()], { '45111239999745': 0 })).toEqual({
      updates: [],
      removes: ['gid://shopify/CartLine/111'],
    });
  });

  it('returns empty mutations when no line matches', () => {
    expect(resolveShopifyAjaxLineMutations([line()], { '1': 2 })).toEqual({
      updates: [],
      removes: [],
    });
  });
});

describe('toShopifyAjaxCart', () => {
  it('maps token, item_count, and paise prices', () => {
    const ajax = toShopifyAjaxCart(cart);
    expect(ajax.token).toBe('abc?key=secret');
    expect(ajax.note).toBe('');
    expect(ajax.item_count).toBe(1);
    expect(ajax.total_price).toBe(99900);
    expect(ajax.currency).toBe('INR');
    expect(ajax.discount_codes).toEqual([]);
    expect(ajax.attributes).toEqual({});
    expect(ajax.items_changelog).toEqual({ added: [], removed: [] });
  });

  it('emits a classic line key and Shopify Ajax item fields', () => {
    const items = toShopifyAjaxCart(cart).items as Array<{
      key: string;
      variant_id: number;
      properties: Record<string, unknown>;
      discounts: unknown[];
      original_line_price: number;
    }>;
    expect(items[0]?.variant_id).toBe(45111239999745);
    expect(items[0]?.key).toBe('45111239999745:111');
    expect(items[0]?.properties).toEqual({});
    expect(items[0]?.discounts).toEqual([]);
    expect(items[0]?.original_line_price).toBe(99900);
  });

  it('echoes the request line key so GoKwik can match the updated item', () => {
    const items = toShopifyAjaxCart(cart, {
      requestKeys: ['45111239999745:0576422178ee42eb81bd8b22bbe9698e'],
    }).items as Array<{ key: string }>;
    expect(items[0]?.key).toBe('45111239999745:0576422178ee42eb81bd8b22bbe9698e');
  });

  it('drops GoKwik attributes and keeps other cart attributes', () => {
    const ajax = toShopifyAjaxCart({
      ...cart,
      attributes: {
        'GoKwik-Cart': true,
        _gk_sc: 'fully_loaded',
        _gk_route: 'gokwik',
        customfit_user_id: 'c240cd10-9d2a-11f1-831a-a9895c3a3f06',
        rzp_device_id: 'device-1',
      },
    } as ShopifyCart & { attributes: Record<string, unknown> });

    expect(ajax.attributes).toEqual({
      customfit_user_id: 'c240cd10-9d2a-11f1-831a-a9895c3a3f06',
      rzp_device_id: 'device-1',
    });
  });

  it('builds items_changelog from the previous cart', () => {
    const previous: ShopifyCart = { ...cart, totalQuantity: 1, lines: [line({ quantity: 1 })] };
    const next: ShopifyCart = { ...cart, totalQuantity: 2, lines: [line({ quantity: 2 })] };

    expect(toShopifyAjaxCart(next, { previous }).items_changelog).toEqual({
      added: [{ variant_id: 45111239999745, quantity: 1 }],
      removed: [],
    });
  });

  it('records removed quantities in items_changelog', () => {
    const previous: ShopifyCart = { ...cart, totalQuantity: 2, lines: [line({ quantity: 2 })] };
    const next: ShopifyCart = { ...cart, totalQuantity: 0, lines: [] };

    expect(toShopifyAjaxCart(next, { previous }).items_changelog).toEqual({
      added: [],
      removed: [{ variant_id: 45111239999745, quantity: 2 }],
    });
  });
});
