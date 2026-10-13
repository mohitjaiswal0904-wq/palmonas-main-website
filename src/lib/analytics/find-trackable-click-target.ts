import { analyticsDataAttributes } from '@/config/analytics/analytics.config';

const TRACKABLE_CLICK_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="link"]',
  'input[type="submit"]',
  'input[type="button"]',
  'summary',
  `[${analyticsDataAttributes.name}]`,
  `[${analyticsDataAttributes.event}]`,
].join(', ');

/**
 * Finds the nearest interactive ancestor for a click target.
 *
 * @param target - Raw event target from a click.
 * @returns Trackable element or null when the click is not on interactive UI.
 */
export function findTrackableClickTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const trackable = target.closest(TRACKABLE_CLICK_SELECTOR);

  return trackable instanceof HTMLElement ? trackable : null;
}

/**
 * Returns whether click tracking should be skipped for an element.
 *
 * @param element - Resolved trackable element.
 * @returns True when the element or an ancestor opts out of analytics.
 */
export function shouldSkipClickTracking(element: HTMLElement): boolean {
  if (element.matches(`[${analyticsDataAttributes.ignore}]`)) {
    return true;
  }

  if (element.closest(`[${analyticsDataAttributes.ignore}]`)) {
    return true;
  }

  if (element.matches('input[type="password"], input[type="hidden"]')) {
    return true;
  }

  return false;
}

/**
 * Resolves a stable element type label for analytics payloads.
 *
 * @param element - Trackable DOM element.
 * @returns Tag name or explicit ARIA role.
 */
export function getClickElementType(element: HTMLElement): string {
  const role = element.getAttribute('role')?.trim();
  if (role) {
    return role;
  }

  if (element instanceof HTMLAnchorElement) {
    return 'link';
  }

  return element.tagName.toLowerCase();
}
