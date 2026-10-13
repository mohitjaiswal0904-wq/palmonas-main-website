import type { CartItem } from '@/types/cart/cart.types';

import {
  clubCartItemsByVariant,
  planClubbedQuantityChange,
  planClubbedRemove,
} from '@/lib/cart/club-cart-items';

function buildItem(overrides: Partial<CartItem> & Pick<CartItem, 'id'>): CartItem {
  return {
    quantity: 1,
    price: 100,
    totalPrice: 100,
    product_category: 'rings',
    isAvailable: true,
    product: {
      id: 'product-1',
      name: 'Test Ring',
      handle: 'test-ring',
      primaryImage: '',
      variantId: '44446378918145',
      variantTitle: 'Gold / 7',
      product_category: 'rings',
    },
    ...overrides,
  };
}

describe('clubCartItemsByVariant', () => {
  it('keeps paid and free lines with the same variant as separate rows', () => {
    const items = [
      buildItem({ id: 'line-paid', quantity: 1, price: 6493, totalPrice: 6493 }),
      buildItem({
        id: 'line-free',
        quantity: 1,
        price: 0,
        totalPrice: 0,
        isFree: true,
        originalPrice: 6493,
      }),
    ];

    const clubbed = clubCartItemsByVariant(items);

    expect(clubbed).toHaveLength(2);
    expect(clubbed[0]).toMatchObject({
      id: 'line-paid',
      quantity: 1,
      isFree: false,
      price: 6493,
    });
    expect(clubbed[1]).toMatchObject({
      id: 'line-free',
      quantity: 1,
      isFree: true,
      price: 0,
    });
  });

  it('merges same variant lines at the same paid unit price', () => {
    const items = [
      buildItem({ id: 'line-a', quantity: 1, price: 6493, totalPrice: 6493 }),
      buildItem({ id: 'line-b', quantity: 2, price: 6493, totalPrice: 12986 }),
    ];

    const clubbed = clubCartItemsByVariant(items);

    expect(clubbed).toHaveLength(1);
    expect(clubbed[0]).toMatchObject({
      quantity: 3,
      price: 6493,
      isFree: false,
      applicableDiscounts: [],
      lineDiscountAllocations: [],
      lines: [
        { id: 'line-a', quantity: 1, isFree: false },
        { id: 'line-b', quantity: 2, isFree: false },
      ],
    });
  });

  it('dedupes applicable discounts across merged paid lines', () => {
    const items = [
      buildItem({
        id: 'line-a',
        quantity: 1,
        applicableDiscounts: [
          { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
          { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
        ],
      }),
      buildItem({
        id: 'line-b',
        quantity: 1,
        applicableDiscounts: [
          { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
          { key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' },
        ],
      }),
    ];

    const clubbed = clubCartItemsByVariant(items);
    expect(clubbed).toHaveLength(1);
    expect(clubbed[0]?.applicableDiscounts).toEqual([
      { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
      { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
      { key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' },
    ]);
  });

  it('dedupes line discount allocations across merged paid lines', () => {
    const items = [
      buildItem({
        id: 'line-a',
        quantity: 1,
        lineDiscountAllocations: [
          { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
        ],
      }),
      buildItem({
        id: 'line-b',
        quantity: 1,
        lineDiscountAllocations: [
          { key: 'mega40', title: 'mega40', amount: 100, valueType: 'fixed_amount' },
          { key: 'SAVE10', title: 'SAVE10', amount: 50, valueType: 'percentage', value: 10 },
        ],
      }),
    ];

    const clubbed = clubCartItemsByVariant(items);
    expect(clubbed).toHaveLength(1);
    expect(clubbed[0]?.lineDiscountAllocations).toEqual([
      { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
      { key: 'SAVE10', title: 'SAVE10', amount: 50, valueType: 'percentage', value: 10 },
    ]);
  });

  it('keeps same variant lines at different paid prices separate', () => {
    const items = [
      buildItem({ id: 'line-a', quantity: 1, price: 6493, totalPrice: 6493 }),
      buildItem({ id: 'line-b', quantity: 1, price: 4999, totalPrice: 4999 }),
    ];

    expect(clubCartItemsByVariant(items)).toHaveLength(2);
  });

  it('merges multiple free lines for the same variant', () => {
    const items = [
      buildItem({ id: 'line-free-1', isFree: true, price: 0, totalPrice: 0 }),
      buildItem({ id: 'line-free-2', isFree: true, price: 0, totalPrice: 0 }),
    ];

    const clubbed = clubCartItemsByVariant(items);

    expect(clubbed).toHaveLength(1);
    expect(clubbed[0]).toMatchObject({
      isFree: true,
      quantity: 2,
    });
  });

  it('keeps distinct variants as separate rows', () => {
    const items = [
      buildItem({ id: 'line-a', product: { ...buildItem({ id: 'line-a' }).product, variantId: '111' } }),
      buildItem({ id: 'line-b', product: { ...buildItem({ id: 'line-b' }).product, variantId: '222' } }),
    ];

    expect(clubCartItemsByVariant(items)).toHaveLength(2);
  });
});

describe('planClubbedQuantityChange', () => {
  const clubbed = clubCartItemsByVariant([
    buildItem({ id: 'line-a', quantity: 1 }),
    buildItem({ id: 'line-b', quantity: 2 }),
  ])[0]!;

  it('removes all underlying lines when quantity reaches zero', () => {
    expect(planClubbedQuantityChange(clubbed, 0)).toEqual([
      { action: 'remove', lineId: 'line-a' },
      { action: 'remove', lineId: 'line-b' },
    ]);
  });

  it('reduces the last line first when decreasing', () => {
    expect(planClubbedQuantityChange(clubbed, 2)).toEqual([
      { action: 'update', lineId: 'line-b', quantity: 1 },
    ]);
  });

  it('updates the primary line when increasing quantity', () => {
    expect(planClubbedQuantityChange(clubbed, 4)).toEqual([
      { action: 'update', lineId: 'line-a', quantity: 2 },
    ]);
  });
});

describe('planClubbedRemove', () => {
  it('returns remove mutations for every underlying line', () => {
    const clubbed = clubCartItemsByVariant([
      buildItem({ id: 'line-a' }),
      buildItem({ id: 'line-b', quantity: 2 }),
    ])[0]!;

    expect(planClubbedRemove(clubbed)).toEqual([
      { action: 'remove', lineId: 'line-a' },
      { action: 'remove', lineId: 'line-b' },
    ]);
  });
});
