import { formatLineDiscountAppliedLabel } from '@/config/cart/cart.config';
import type {
  CartDiscountOffer,
  CartItemApplicableDiscount,
  CartItemLineDiscountAllocation,
} from '@/types/cart';

/** Resolved applied-discount pill for a cart line card. */
export interface AppliedLineDiscountBadge {
  key: string;
  label: string;
}

/**
 * Reads a percent-off from Shopify value or a “40%” fragment in copy.
 *
 * @param title - Offer name or coupon title.
 * @param valueType - Shopify `value_type` when present.
 * @param value - Numeric value when the API sends one.
 * @returns Rounded 1–100 percent, or undefined.
 */
export function extractLineDiscountPercent(
  title: string,
  valueType?: string,
  value?: number,
): number | undefined {
  if (valueType === 'percentage' && typeof value === 'number' && value > 0 && value <= 100) {
    return Math.round(value);
  }

  const match = title.match(/(\d{1,2})\s*%/);
  if (!match) {
    return undefined;
  }

  const percent = Number(match[1]);
  return percent > 0 ? percent : undefined;
}

/**
 * Picks a customer-facing title for an allocation (offer name over raw code).
 *
 * @param title - Allocation `discount_application.title`.
 * @param applicableDiscounts - Line `applicable_discounts` badges.
 * @param availableOffers - Store/payment offers from the discount list API.
 * @returns Prefer matching offer name, else the allocation title.
 */
function resolveAllocationDisplayTitle(
  title: string,
  applicableDiscounts: ReadonlyArray<CartItemApplicableDiscount> | undefined,
  availableOffers: ReadonlyArray<CartDiscountOffer> | undefined,
): string {
  const code = title.trim().toUpperCase();
  if (!code) {
    return '';
  }

  const fromApplicable = applicableDiscounts?.find((discount) => {
    const key = discount.key.trim().toUpperCase();
    const discountCode = discount.code?.trim().toUpperCase() ?? '';
    return key === code || discountCode === code;
  });
  if (fromApplicable?.label.trim()) {
    return fromApplicable.label.trim();
  }

  const fromOffer = availableOffers?.find(
    (offer) => offer.discountCode.trim().toUpperCase() === code,
  );
  const detail = fromOffer?.discountDetail.trim();
  if (detail) {
    return detail;
  }

  return title.trim();
}

/**
 * Builds Figma applied-discount pills from line allocations.
 *
 * @param allocations - Transformed `line_level_discount_allocations`.
 * @param applicableDiscounts - Line `applicable_discounts` for nicer names.
 * @param availableOffers - Discount-list offers for code → detail lookup.
 * @returns Deduped badges with “Applied” copy.
 */
export function resolveAppliedLineDiscountBadges(
  allocations: ReadonlyArray<CartItemLineDiscountAllocation> | null | undefined,
  applicableDiscounts?: ReadonlyArray<CartItemApplicableDiscount> | null,
  availableOffers?: ReadonlyArray<CartDiscountOffer> | null,
): AppliedLineDiscountBadge[] {
  if (!allocations?.length) {
    return [];
  }

  const seen = new Set<string>();
  const badges: AppliedLineDiscountBadge[] = [];

  for (const allocation of allocations) {
    const displayTitle = resolveAllocationDisplayTitle(
      allocation.title,
      applicableDiscounts ?? undefined,
      availableOffers ?? undefined,
    );
    const percent = extractLineDiscountPercent(
      displayTitle,
      allocation.valueType,
      allocation.value,
    );
    const label = formatLineDiscountAppliedLabel(displayTitle, percent);
    if (!label) {
      continue;
    }

    const key = allocation.key.trim() || label;
    const dedupe = key.toUpperCase();
    if (seen.has(dedupe)) {
      continue;
    }
    seen.add(dedupe);
    badges.push({ key, label });
  }

  return badges;
}
