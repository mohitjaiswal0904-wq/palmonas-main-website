import { extractNumericId } from '@/types/cart/cart.transforms';
import type {
  CartItem,
  CartItemApplicableDiscount,
  CartItemLineDiscountAllocation,
  ClubbedCartMutation,
} from '@/types/cart/cart.types';

/** Reference to an underlying cart line within a clubbed display row. */
export interface ClubbedCartLineRef {
  id: string;
  quantity: number;
  isFree: boolean;
}

/** Cart line grouped by variant + cost tier for display. */
export interface ClubbedCartItem {
  key: string;
  id: string;
  product: CartItem['product'];
  quantity: number;
  paidQuantity: number;
  freeQuantity: number;
  price: number;
  originalPrice?: number;
  totalPrice: number;
  product_category: string;
  isAvailable: boolean;
  isFree: boolean;
  lines: ClubbedCartLineRef[];
  /** Deduped offer badges across clubbed lines. */
  applicableDiscounts: CartItemApplicableDiscount[];
  /** Deduped applied allocations across clubbed lines. */
  lineDiscountAllocations: CartItemLineDiscountAllocation[];
  lineLevelTotalDiscount: number;
}

export type { ClubbedCartMutation };

/**
 * Builds a grouping key so free lines and different unit prices stay separate.
 *
 * @param item - Cart line to key.
 * @returns Stable key: variant id + free tier or paid unit price.
 */
function buildClubGroupKey(item: CartItem): string {
  const variantId = extractNumericId(item.product.variantId);
  if (item.isFree) {
    return `${variantId}:free`;
  }
  return `${variantId}:paid:${item.price}`;
}

/**
 * Groups cart items by variant and cost so duplicate same-price SKUs render as one line.
 *
 * @param items - Raw cart lines from the cart transform.
 * @returns Clubbed rows preserving first-seen group order.
 */
export function clubCartItemsByVariant(items: CartItem[]): ClubbedCartItem[] {
  const groups = new Map<string, CartItem[]>();
  const order: string[] = [];

  for (const item of items) {
    const key = buildClubGroupKey(item);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(item);
      continue;
    }
    groups.set(key, [item]);
    order.push(key);
  }

  return order.map((key) => mergeClubbedGroup(key, groups.get(key) ?? []));
}

/**
 * Builds API mutations to set a clubbed row to a target total quantity.
 *
 * @param item - Clubbed display row (homogeneous cost tier).
 * @param targetQuantity - Desired combined quantity for the row.
 * @returns Ordered remove/update steps.
 */
export function planClubbedQuantityChange(
  item: ClubbedCartItem,
  targetQuantity: number,
): ClubbedCartMutation[] {
  if (targetQuantity <= 0) {
    return planClubbedRemove(item);
  }

  const current = item.quantity;
  if (targetQuantity === current) {
    return [];
  }

  if (targetQuantity > current) {
    const primaryLine = item.lines[0];
    if (!primaryLine) {
      return [];
    }
    return [
      {
        action: 'update',
        lineId: primaryLine.id,
        quantity: primaryLine.quantity + (targetQuantity - current),
      },
    ];
  }

  let toRemove = current - targetQuantity;
  const mutations: ClubbedCartMutation[] = [];

  for (const line of [...item.lines].reverse()) {
    if (toRemove <= 0) {
      break;
    }
    if (line.quantity <= toRemove) {
      mutations.push({ action: 'remove', lineId: line.id });
      toRemove -= line.quantity;
      continue;
    }
    mutations.push({ action: 'update', lineId: line.id, quantity: line.quantity - toRemove });
    toRemove = 0;
  }

  return mutations;
}

/**
 * Builds mutations to remove every underlying line in a clubbed row.
 *
 * @param item - Clubbed display row.
 * @returns Remove steps for each underlying cart line.
 */
export function planClubbedRemove(item: ClubbedCartItem): ClubbedCartMutation[] {
  return item.lines.map((line) => ({ action: 'remove', lineId: line.id }));
}

function mergeClubbedGroup(groupKey: string, items: CartItem[]): ClubbedCartItem {
  const primary = items[0]!;
  const isFree = Boolean(primary.isFree);

  const lines: ClubbedCartLineRef[] = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    isFree: Boolean(item.isFree),
  }));

  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeQuantity = isFree ? quantity : 0;
  const paidQuantity = isFree ? 0 : quantity;

  const discountByKey = new Map<string, CartItemApplicableDiscount>();
  const allocationByKey = new Map<string, CartItemLineDiscountAllocation>();
  for (const item of items) {
    for (const discount of item.applicableDiscounts ?? []) {
      if (!discountByKey.has(discount.key)) {
        discountByKey.set(discount.key, discount);
      }
    }
    for (const allocation of item.lineDiscountAllocations ?? []) {
      const key = allocation.key.trim().toUpperCase();
      if (!key || allocationByKey.has(key)) {
        continue;
      }
      allocationByKey.set(key, allocation);
    }
  }

  return {
    key: groupKey,
    id: primary.id,
    product: primary.product,
    quantity,
    paidQuantity,
    freeQuantity,
    price: primary.price,
    originalPrice: primary.originalPrice,
    totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
    product_category: primary.product_category,
    isAvailable: items.every((item) => item.isAvailable),
    isFree,
    lines,
    applicableDiscounts: [...discountByKey.values()],
    lineDiscountAllocations: [...allocationByKey.values()],
    lineLevelTotalDiscount: items.reduce(
      (sum, item) => sum + (item.lineLevelTotalDiscount ?? 0),
      0,
    ),
  };
}
