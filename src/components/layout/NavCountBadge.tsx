'use client';

import { useEffect, useState } from 'react';

import { subscribeCartBadgeHold, visibleCartBadgeCount } from '@/lib/cart/add-to-cart-flight';

/**
 * Builds an accessible label that appends the item count after hydration.
 *
 * @param label - Base label for the control.
 * @param count - Current badge count.
 * @param hydrated - Whether client-side count data is ready to expose.
 * @returns Label string for `aria-label`.
 */
export function buildNavCountAriaLabel(label: string, count: number, hydrated: boolean): string {
  return hydrated && count > 0 ? `${label}, ${count} items` : label;
}

/** Small circular count badge for header and bottom-nav utility icons. */
export function NavCountBadge({ count }: { count: number }) {
  const [holds, setHolds] = useState(0);

  // Hold the painted count until the collection card flight lands on the bag.
  useEffect(() => subscribeCartBadgeHold(setHolds), []);

  const shown = visibleCartBadgeCount(count, holds);
  if (shown <= 0) {
    return null;
  }

  return (
    <span
      data-nav-count-badge
      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-950 text-[10px] font-bold text-white"
    >
      {shown}
    </span>
  );
}
