/** Module store so the sticky site header can show the PDP product name on mobile. */

let pdpMobileHeaderTitle = '';
const listeners = new Set<() => void>();

/**
 * Publish the product title for the mobile PDP site header.
 *
 * @param title - Product display name, or empty to clear.
 */
export function setPdpMobileHeaderTitle(title: string): void {
  if (pdpMobileHeaderTitle === title) {
    return;
  }

  pdpMobileHeaderTitle = title;
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to mobile PDP header title changes.
 *
 * @param listener - Called when the title is set or cleared.
 * @returns Unsubscribe function.
 */
export function subscribePdpMobileHeaderTitle(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** @returns Current mobile PDP header title (empty when not on a product page). */
export function getPdpMobileHeaderTitle(): string {
  return pdpMobileHeaderTitle;
}
