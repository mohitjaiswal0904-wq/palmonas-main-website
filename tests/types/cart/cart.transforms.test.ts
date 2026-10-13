import {
  cartToSummary,
  extractCartId,
  extractNumericId,
  formatVariantId,
  resolveCartDiscountApplyFailureMessage,
  toShopifyCartGid,
  transformCartStats,
  transformDiscountApplyUpdatedCart,
  transformShopifyCart,
} from '@/types/cart';
import type { ShopifyCart } from '@/types/cart';

const sampleShopifyCart: ShopifyCart = {
  id: 'gid://shopify/Cart/abc?key=secret',
  checkoutUrl: 'https://checkout.example.com',
  totalQuantity: 1,
  cost: {
    subtotalAmount: { amount: '1000', currencyCode: 'INR' },
    totalAmount: { amount: '1000', currencyCode: 'INR' },
    totalTaxAmount: null,
  },
  lines: [
    {
      id: 'line-1',
      quantity: 1,
      merchandise: {
        id: 'gid://shopify/ProductVariant/123',
        title: 'Gold',
        priceV2: { amount: '1000', currencyCode: 'INR' },
        product: {
          id: 'prod-1',
          title: 'Test Ring',
          handle: 'test-ring',
          featuredImage: { url: 'https://cdn.example.com/img.jpg' },
          product_category: 'demifine',
        },
      },
    },
  ],
};

describe('cart.transforms', () => {
  it('formatVariantId wraps numeric ids', () => {
    expect(formatVariantId('123')).toBe('gid://shopify/ProductVariant/123');
    expect(formatVariantId('gid://shopify/ProductVariant/123')).toBe(
      'gid://shopify/ProductVariant/123',
    );
  });

  it('extractCartId strips query key', () => {
    expect(extractCartId('gid://shopify/Cart/abc?key=secret')).toBe('gid://shopify/Cart/abc');
  });

  it('toShopifyCartGid wraps bare ids and preserves GID with key', () => {
    expect(toShopifyCartGid('cart-abc')).toBe('gid://shopify/Cart/cart-abc');
    expect(toShopifyCartGid('gid://shopify/Cart/abc?key=secret')).toBe(
      'gid://shopify/Cart/abc?key=secret',
    );
  });

  it('transformShopifyCart maps lines and totals', () => {
    const cart = transformShopifyCart(sampleShopifyCart);
    expect(cart.id).toBe('gid://shopify/Cart/abc');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.product.name).toBe('Test Ring');
    expect(cart.items[0]?.applicableDiscounts).toEqual([]);
    expect(cart.items[0]?.lineDiscountAllocations).toEqual([]);
    expect(cart.subtotal).toBe(1000);
  });

  it('transformShopifyCart maps line applicable_discounts into badges', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          ...sampleShopifyCart.lines[0]!,
          line_level_total_discount: 13174,
          applicable_discounts: [
            {
              key: 'MONSOON4',
              name: 'Buy 4 At ₹2999',
              code: 'MONSOON4',
              type: 'DISCOUNT',
              discount_category: 'applicable',
            },
            {
              key: 'B1G1',
              name: 'Buy 1 Get 1',
              code: 'B1G1',
              type: 'FREEBIE',
              discount_category: 'applicable',
            },
            {
              key: 'MONSOON4',
              name: 'Buy 4 At ₹2999',
              code: 'MONSOON4',
            },
          ],
        },
      ],
    });

    expect(cart.items[0]?.lineLevelTotalDiscount).toBe(13174);
    expect(cart.items[0]?.applicableDiscounts).toEqual([
      { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
      { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
    ]);
  });

  it('transformShopifyCart maps line_level_discount_allocations', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          ...sampleShopifyCart.lines[0]!,
          line_level_discount_allocations: [
            {
              amount: 90320,
              discount_application: {
                type: 'discount_code',
                title: 'mega40',
                value_type: 'fixed_amount',
                target_type: 'line_item',
                total_allocated_amount: 90320,
              },
            },
            {
              amount: 100,
              discount_application: {
                type: 'discount_code',
                title: 'mega40',
                value_type: 'fixed_amount',
              },
            },
          ],
        },
      ],
    });

    expect(cart.items[0]?.lineDiscountAllocations).toEqual([
      { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
    ]);
  });

  it('transformShopifyCart skips allocations without a title', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          ...sampleShopifyCart.lines[0]!,
          line_level_discount_allocations: [
            { amount: 10, discount_application: { type: 'automatic' } },
            { amount: 20 },
          ],
        },
      ],
    });

    expect(cart.items[0]?.lineDiscountAllocations).toEqual([]);
  });

  it('cartToSummary returns zeros for null cart', () => {
    expect(cartToSummary(null).totalItems).toBe(0);
  });

  it('transformCartStats maps API fields', () => {
    expect(
      transformCartStats({ cart_item_count: 2, wishlist_item_count: 1 }),
    ).toEqual({ cartCount: 2, wishlistCount: 1 });
  });

  it('cartToSummary maps populated cart totals', () => {
    const cart = transformShopifyCart(sampleShopifyCart);
    const summary = cartToSummary(cart);

    expect(summary.subtotal).toBe(1000);
    expect(summary.total).toBe(1000);
    expect(summary.totalItems).toBe(1);
  });

  it('cartToSummary falls back to line totals when API subtotal is zero', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      cost: {
        subtotalAmount: { amount: '0', currencyCode: 'INR' },
        totalAmount: { amount: '1000', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
    });
    const summary = cartToSummary(cart);

    expect(summary.subtotal).toBe(1000);
  });

  it('transformShopifyCart handles empty lines', () => {
    const empty = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [],
      totalQuantity: 0,
      cost: {
        subtotalAmount: { amount: '0', currencyCode: 'INR' },
        totalAmount: { amount: '0', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
    });

    expect(empty.items).toHaveLength(0);
    expect(empty.total).toBe(0);
  });

  it('transformShopifyCart uses alternate price fields and tax', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      totalQuantity: 2,
      cost: {
        subtotalAmount: { amount: '2000', currencyCode: 'INR' },
        totalAmount: { amount: '2360', currencyCode: 'INR' },
        totalTaxAmount: { amount: '360', currencyCode: 'INR' },
      },
      lines: [
        {
          id: 'line-2',
          quantity: 2,
          cost: { totalAmount: { amount: '2000', currencyCode: 'INR' } },
          merchandise: {
            id: 'gid://shopify/ProductVariant/456',
            title: 'Silver',
            availableForSale: true,
            compareAtPriceV2: { amount: '1500', currencyCode: 'INR' },
            priceV2: { amount: '1000', currencyCode: 'INR' },
            product: {
              id: 'prod-2',
              title: 'Bracelet',
              handle: 'bracelet',
              product_category: 'demifine',
            },
          },
        },
      ],
    });

    expect(cart.tax).toBe(360);
    expect(cart.items[0]?.originalPrice).toBe(1500);
    expect(cart.items[0]?.totalPrice).toBe(2000);
  });

  it('extractNumericId returns original when no trailing digits', () => {
    expect(extractNumericId('variant-raw')).toBe('variant-raw');
  });

  it('extractCartId handles empty id', () => {
    expect(extractCartId('')).toBe('');
  });

  it('transformShopifyCart resolves prices from legacy numeric fields', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-legacy',
          quantity: 2,
          selling_price_total: 800,
          selling_price_per_unit: 400,
          unit_price: 400,
          merchandise: {
            id: 'gid://shopify/ProductVariant/999',
            title: 'Legacy',
            price: 400,
            product: {
              id: 'prod-legacy',
              title: 'Legacy Product',
              handle: 'legacy',
            },
          },
        },
      ],
    } as unknown as ShopifyCart);

    expect(cart.items[0]?.price).toBe(400);
    expect(cart.items[0]?.totalPrice).toBe(800);
  });

  it('transformShopifyCart uses mrp_total for original price', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-mrp',
          quantity: 2,
          price_calculations: {
            selling_price_per_unit: 500,
            mrp_total: 1200,
          },
          merchandise: {
            id: 'gid://shopify/ProductVariant/888',
            title: 'MRP',
            priceV2: { amount: '500', currencyCode: 'INR' },
            product: {
              id: 'prod-mrp',
              title: 'MRP Product',
              handle: 'mrp',
            },
          },
        },
      ],
    } as unknown as ShopifyCart);

    expect(cart.items[0]?.originalPrice).toBe(600);
  });

  it('transformShopifyCart handles merchandise price object and unit_price fallbacks', () => {
    const baseLine = {
      id: 'line-fallback',
      quantity: 1,
      merchandise: {
        id: 'gid://shopify/ProductVariant/777',
        title: 'Fallback',
        unit_price: 250,
        price: { amount: '300', currencyCode: 'INR' },
        product: {
          id: 'prod-fallback',
          title: 'Fallback Product',
          handle: 'fallback',
        },
      },
    };

    const fromUnit = transformShopifyCart({
      ...sampleShopifyCart,
      totalQuantity: 1,
      lines: [
        {
          ...baseLine,
          merchandise: { ...baseLine.merchandise, price: 250 },
        },
      ],
    } as unknown as ShopifyCart);

    expect(fromUnit.items[0]?.price).toBe(250);

    const fromMerchPrice = transformShopifyCart({
      ...sampleShopifyCart,
      totalQuantity: 1,
      lines: [
        {
          ...baseLine,
          merchandise: { ...baseLine.merchandise, unit_price: undefined, price: 300 },
        },
      ],
    } as unknown as ShopifyCart);

    expect(fromMerchPrice.items[0]?.price).toBe(300);
  });

  it('transformShopifyCart uses compareAtPriceV2 and mrp_per_unit for original price', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-orig',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/555',
            title: 'Orig',
            compareAtPriceV2: { amount: '1500', currencyCode: 'INR' },
            priceV2: { amount: '1000', currencyCode: 'INR' },
            product: { id: 'p', title: 'P', handle: 'p' },
          },
        },
      ],
    } as ShopifyCart);

    expect(cart.items[0]?.originalPrice).toBe(1500);
  });

  it('transformCartStats defaults missing counts to zero', () => {
    expect(transformCartStats({} as { cart_item_count: number; wishlist_item_count: number })).toEqual({
      cartCount: 0,
      wishlistCount: 0,
    });
  });

  it('transformShopifyCart covers additional legacy pricing branches', () => {
    const variants: Array<Record<string, unknown>> = [
      {
        id: 'line-a',
        quantity: 2,
        selling_price_total: 600,
        merchandise: {
          id: 'gid://shopify/ProductVariant/1',
          title: 'A',
          product: { id: 'p1', title: 'A', handle: 'a' },
        },
      },
      {
        id: 'line-b',
        quantity: 1,
        selling_price_per_unit: 450,
        merchandise: {
          id: 'gid://shopify/ProductVariant/2',
          title: 'B',
          product: { id: 'p2', title: 'B', handle: 'b' },
        },
      },
      {
        id: 'line-c',
        quantity: 1,
        price_calculations: { selling_price_per_unit: 320, mrp_per_unit: 400 },
        merchandise: {
          id: 'gid://shopify/ProductVariant/3',
          title: 'C',
          product: { id: 'p3', title: 'C', handle: 'c' },
        },
      },
      {
        id: 'line-d',
        quantity: 2,
        price_calculations: { mrp_total: 1000 },
        merchandise: {
          id: 'gid://shopify/ProductVariant/4',
          title: 'D',
          priceV2: { amount: '200', currencyCode: 'INR' },
          product: { id: 'p4', title: 'D', handle: 'd' },
        },
      },
    ];

    for (const line of variants) {
      const cart = transformShopifyCart({
        ...sampleShopifyCart,
        totalQuantity: 2,
        lines: [line],
      } as unknown as ShopifyCart);
      expect(cart.items[0]?.price).toBeGreaterThan(0);
    }
  });

  it('transformShopifyCart uses fallback unit price when line price stays zero', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      totalQuantity: 2,
      cost: {
        subtotalAmount: { amount: '1000', currencyCode: 'INR' },
        totalAmount: { amount: '1000', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
      lines: [
        {
          id: 'line-zero',
          quantity: 2,
          merchandise: {
            id: 'gid://shopify/ProductVariant/0',
            title: 'Zero',
            product: { id: 'p0', title: 'Zero', handle: 'zero' },
          },
        },
      ],
    } as unknown as ShopifyCart);

    expect(cart.items[0]?.price).toBe(500);
    expect(cart.items[0]?.totalPrice).toBe(1000);
  });

  it('transformShopifyCart resolves product id from merchandise when product id is missing', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-merch-id',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/321',
            title: 'Variant only',
            priceV2: { amount: '200', currencyCode: 'INR' },
            product: {
              title: 'No Product Id',
              handle: 'no-id',
            },
          },
        },
      ],
    } as unknown as ShopifyCart);

    expect(cart.items[0]?.product.id).toBe('gid://shopify/ProductVariant/321');
    expect(cart.items[0]?.product_category).toBe('product');
  });

  it('transformShopifyCart marks unavailable lines and defaults blank categories', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-unavail',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/444',
            title: 'Sold out',
            availableForSale: false,
            priceV2: { amount: '100', currencyCode: 'INR' },
            product: {
              id: 'prod-4',
              title: 'Sold out ring',
              handle: 'sold-out',
              product_category: '   ',
            },
          },
        },
      ],
    } as ShopifyCart);

    expect(cart.items[0]?.isAvailable).toBe(false);
    expect(cart.items[0]?.product_category).toBe('product');
  });

  it('maps pre-applied coupon codes and cart-level discount totals', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      coupon_codes: ['b1g1'],
      coupon_code: 'b1g1',
      price_calculations: {
        total_mrp: 21722,
        total_selling_price: 6493,
        total_discount: 15229,
        currency_code: 'INR',
      },
      cost: {
        subtotalAmount: { amount: '6493.0', currencyCode: 'INR' },
        totalAmount: { amount: '6493.0', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
    });

    expect(cart.appliedCouponCodes).toEqual(['b1g1']);
    expect(cart.discount).toBe(15229);
    expect(cart.subtotal).toBe(21722);
    expect(cart.total).toBe(6493);
    expect(cart.coupon?.code).toBe('b1g1');
  });

  it('maps five-row cart price_calculations onto cart totals', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      coupon_codes: ['bling40'],
      price_calculations: {
        total_mrp: 61671,
        mrp_discount: 21179,
        subtotal_before_coupon: 40492,
        coupon_discount: 21179,
        payable_total: 19313,
      },
    });

    expect(cart.totalMrp).toBe(61671);
    expect(cart.mrpDiscount).toBe(21179);
    expect(cart.sellingPrice).toBe(40492);
    expect(cart.couponDiscount).toBe(21179);
    expect(cart.payableTotal).toBe(19313);
    expect(cart.subtotal).toBe(61671);
    expect(cart.discount).toBe(21179);
    expect(cart.total).toBe(19313);
  });

  it('marks freenie lines as free with zero selling price', () => {
    const cart = transformShopifyCart({
      ...sampleShopifyCart,
      lines: [
        {
          id: 'line-paid',
          quantity: 1,
          cost: {
            totalAmount: { amount: '2497.0', currencyCode: 'INR' },
          },
          merchandise: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            priceV2: { amount: '2497.0', currencyCode: 'INR' },
            compareAtPriceV2: { amount: '3567.0', currencyCode: 'INR' },
            product: {
              id: 'prod-paid',
              title: 'Paid Necklace',
              handle: 'paid-necklace',
            },
          },
          price_calculations: {
            selling_price_per_unit: 2497,
            selling_price_total: 2497,
            mrp_per_unit: 3567,
            is_free: false,
          },
        },
        {
          id: 'line-free',
          quantity: 1,
          cost: {
            totalAmount: { amount: '0.0', currencyCode: 'INR' },
          },
          tags: ['freenie'],
          merchandise: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            priceV2: { amount: '2497.0', currencyCode: 'INR' },
            compareAtPriceV2: { amount: '3567.0', currencyCode: 'INR' },
            product: {
              id: 'prod-paid',
              title: 'Paid Necklace',
              handle: 'paid-necklace',
            },
          },
          price_calculations: {
            selling_price_per_unit: 2497,
            selling_price_total: 0,
            mrp_per_unit: 3567,
            is_free: true,
          },
        },
      ],
    } as ShopifyCart);

    expect(cart.items[0]?.isFree).toBe(false);
    expect(cart.items[0]?.price).toBe(2497);
    expect(cart.items[1]?.isFree).toBe(true);
    expect(cart.items[1]?.price).toBe(0);
    expect(cart.items[1]?.originalPrice).toBe(3567);
  });
});

describe('transformDiscountApplyUpdatedCart', () => {
  it('maps legacy apply updatedCart items and coupon totals into UI cart', () => {
    const cart = transformDiscountApplyUpdatedCart(
      {
        token: 'hWNEQWu2OqsXFG9BNCjRUZBk',
        item_count: 3,
        original_total_price: 299700,
        total_price: 299700,
        items: [
          {
            id: 43070320148737,
            key: 'gid://shopify/CartLine/paid-line?cart=hWNEQWu2OqsXFG9BNCjRUZBk',
            quantity: 2,
            variant_id: 43070320148737,
            product_id: 7759111586049,
            product_title: 'Hearts All Over Bracelet',
            variant_title: 'Default Title',
            handle: 'hearts-all-over-bracelet',
            image: 'https://cdn.example/bracelet.webp',
            product_type: 'Bracelets',
            final_price: 99900,
            final_line_price: 199800,
            original_price: 318400,
          },
          {
            id: 43786050339073,
            key: 'gid://shopify/CartLine/free-line?cart=hWNEQWu2OqsXFG9BNCjRUZBk',
            quantity: 1,
            variant_id: 43786050339073,
            product_title: 'Mini Solitaire Ring',
            variant_title: '6',
            handle: 'mini-solitaire-ring',
            final_price: 0,
            final_line_price: 0,
            original_price: 324100,
          },
        ],
        discount: {
          title: 'monsoon3',
          total_discount: 298,
          order_discount: 298,
          total_price: 2699,
        },
      },
      {
        existingCart: {
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
        },
      },
    );

    expect(cart.id).toBe('cart-1');
    expect(cart.checkoutUrl).toBe('https://checkout.example.com');
    expect(cart.items).toHaveLength(2);
    expect(cart.items[0]).toMatchObject({
      id: 'gid://shopify/CartLine/paid-line',
      quantity: 2,
      price: 999,
      totalPrice: 1998,
      isFree: false,
    });
    expect(cart.items[1]).toMatchObject({
      id: 'gid://shopify/CartLine/free-line',
      quantity: 1,
      price: 0,
      isFree: true,
    });
    expect(cart.discount).toBe(298);
    expect(cart.total).toBe(2699);
    expect(cart.appliedCouponCodes).toEqual(['monsoon3']);
  });
});

describe('resolveCartDiscountApplyFailureMessage', () => {
  it('returns the first trimmed error_message', () => {
    expect(
      resolveCartDiscountApplyFailureMessage([
        { discount_code: '123', error_message: '  Invalid code.  ' },
      ]),
    ).toBe('Invalid code.');
  });

  it('returns null when no failures include a message', () => {
    expect(resolveCartDiscountApplyFailureMessage([{ discount_code: '123' }, {}])).toBeNull();
  });
});
