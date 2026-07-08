import type { ProductTag } from "@/types/product-detail";

const NEW_ARRIVAL_LABELS = [
  "new arrival",
  "new-arrival",
  "new_arrival",
  "new arrivals",
  "fresh drop",
  "fresh-drop",
  "fresh drops",
  "new in",
  "just dropped",
];

/** Days after launch a product still counts as a new arrival. */
export const NEW_ARRIVAL_WINDOW_DAYS = 45;

/** Stable share of product cards that show the new-arrival tag. */
export const NEW_ARRIVAL_RANDOM_RATE = 1 / 3;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic per-product pick so tags don't flicker between renders. */
export function shouldShowRandomNewArrivalTag(productId: string) {
  return hashString(productId) / 0xffffffff < NEW_ARRIVAL_RANDOM_RATE;
}

/** Swap bestseller badges for the new-arrival tag on a random subset. */
export function applyProductCardBadges<
  P extends { id: string; badge?: string; isNewArrival?: boolean },
>(product: P): P {
  if (product.isNewArrival) {
    return { ...product, badge: undefined };
  }

  if (shouldShowRandomNewArrivalTag(product.id)) {
    return { ...product, isNewArrival: true, badge: undefined };
  }

  return { ...product, badge: undefined };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesNewArrivalLabel(value: string) {
  const normalized = normalize(value);
  return NEW_ARRIVAL_LABELS.some(
    (label) => normalized === label || normalized.includes(label),
  );
}

function isWithinNewArrivalWindow(dateString?: string | null) {
  if (!dateString) return false;
  const created = new Date(dateString);
  if (Number.isNaN(created.getTime())) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_ARRIVAL_WINDOW_DAYS);
  return created >= cutoff;
}

export function isNewArrivalProduct(input: {
  tags?: string[] | null;
  product_tags?: ProductTag[];
  createdAt?: string | null;
  created_at?: string | null;
}) {
  if (input.tags?.some(matchesNewArrivalLabel)) return true;

  if (
    input.product_tags?.some(
      (tag) =>
        matchesNewArrivalLabel(tag.name) || matchesNewArrivalLabel(tag.value),
    )
  ) {
    return true;
  }

  return (
    isWithinNewArrivalWindow(input.createdAt) ||
    isWithinNewArrivalWindow(input.created_at)
  );
}
