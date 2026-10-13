import { analyticsDataAttributes } from '@/config/analytics/analytics.config';
import {
  hapticCommerceEvents,
  hapticHrefNeedles,
  hapticLabelNeedles,
  hapticsIgnoreAttribute,
  hapticsOptInAttribute,
} from '@/config/haptics/haptics.config';
import { getClickAccessibleLabel } from '@/lib/analytics/get-click-accessible-label';

const HAPTIC_TARGET_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  'input[type="submit"]',
  'input[type="button"]',
].join(', ');

/**
 * Returns whether a control is a wishlist, cart, or checkout action.
 *
 * @param element - Interactive control under the pointer.
 * @returns True when the control is a wishlist, cart, or checkout action.
 */
export function isCommerceHapticControl(element: HTMLElement): boolean {
  if (element.hasAttribute(hapticsOptInAttribute)) {
    return true;
  }

  const analyticsEvent = element.getAttribute(analyticsDataAttributes.event)?.trim();
  if (analyticsEvent && hapticCommerceEvents.has(analyticsEvent)) {
    return true;
  }

  const href =
    element instanceof HTMLAnchorElement
      ? (element.getAttribute('href') ?? element.href)
      : (element.closest('a[href]')?.getAttribute('href') ?? null);

  if (href && hapticHrefNeedles.some((needle) => href.includes(needle))) {
    return true;
  }

  const label = getClickAccessibleLabel(element).toLowerCase();
  return hapticLabelNeedles.some((needle) => label.includes(needle));
}

/**
 * Finds the nearest wishlist / cart / checkout control for a tap.
 *
 * @param target - Raw pointer/click event target.
 * @returns Control element, or null when the tap should not vibrate.
 */
export function findHapticClickTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const control = target.closest(HAPTIC_TARGET_SELECTOR);

  if (!(control instanceof HTMLElement)) {
    return null;
  }

  if (control.closest(`[${hapticsIgnoreAttribute}]`)) {
    return null;
  }

  if (control instanceof HTMLButtonElement && control.disabled) {
    return null;
  }

  if (control instanceof HTMLInputElement && control.disabled) {
    return null;
  }

  if (control.getAttribute('aria-disabled') === 'true') {
    return null;
  }

  if (!isCommerceHapticControl(control)) {
    return null;
  }

  return control;
}
