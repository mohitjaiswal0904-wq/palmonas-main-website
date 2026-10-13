import { cartTokens } from '@/config/theme/cart.tokens';

/** DOM id for the preferred header cart fly target. */
export const CART_FLY_TARGET_ID = 'cart-fly-target';

/** Marks header or bottom-nav cart icons as fly landing spots. */
export const CART_FLY_TARGET_ATTR = 'data-cart-fly-target';

export type CartFlyTargetKind = 'header' | 'nav';

export const PRODUCT_CARD_FLY_ATTR = 'data-product-card';
export const PRODUCT_CARD_HANDLE_ATTR = 'data-product-handle';

export interface AddToCartFlightOrigin {
  source: Element | null;
  imageUrl?: string;
  /** Collection card handle — used to find the article when the CTA is not inside it. */
  productHandle?: string;
}

export interface AddToCartFlight {
  id: number;
  productHandle?: string;
  imageUrl?: string;
  fromX: number;
  fromY: number;
  fromLeft: number;
  fromTop: number;
  fromWidth: number;
  fromHeight: number;
  endScale: number;
  toX: number;
  toY: number;
  reducedMotion: boolean;
}

type FlightListener = (flight: AddToCartFlight) => void;
type BadgeHoldListener = (holds: number) => void;

const listeners = new Set<FlightListener>();
const badgeHoldListeners = new Set<BadgeHoldListener>();
let nextFlightId = 1;
let cartBadgeHolds = 0;

/**
 * Return whether the current page should play the card fly-to-cart motion.
 *
 * @param pathname - Current app path.
 * @returns True for home, `/collections`, and nested collection handles.
 */
export function isCollectionAddToCartFlightPath(pathname: string): boolean {
  return pathname === '/' || pathname === '/collections' || pathname.startsWith('/collections/');
}

/**
 * Subscribe to fly-to-cart particles spawned after a successful add.
 *
 * @param listener - Called with one flight payload.
 * @returns Unsubscribe function.
 */
export function subscribeAddToCartFlight(listener: FlightListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribe to how many cart-badge increments are held until a flight lands.
 *
 * @param listener - Called with the current hold count.
 * @returns Unsubscribe function.
 */
export function subscribeCartBadgeHold(listener: BadgeHoldListener): () => void {
  badgeHoldListeners.add(listener);
  listener(cartBadgeHolds);
  return () => {
    badgeHoldListeners.delete(listener);
  };
}

/**
 * Return the badge count to show while flights are still in the air.
 *
 * @param actualCount - Live cart item count.
 * @param holds - In-flight increments not yet released.
 * @returns Count that should paint on the bag.
 */
export function visibleCartBadgeCount(actualCount: number, holds: number): number {
  return Math.max(0, actualCount - holds);
}

/**
 * Find the product card article to fly, from a CTA or a listing handle.
 *
 * @param from - Clicked control, or null.
 * @param handle - Product handle when the control is outside the card.
 * @returns The card element, or the original control.
 */
export function resolveProductCardFlySource(from: Element | null, handle?: string): Element | null {
  if (from) {
    const card = from.closest(`[${PRODUCT_CARD_FLY_ATTR}]`);
    if (card) {
      return card;
    }
  }

  if (handle && typeof document !== 'undefined') {
    const escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(handle) : handle;
    const byHandle = document.querySelector(
      `[${PRODUCT_CARD_FLY_ATTR}][${PRODUCT_CARD_HANDLE_ATTR}="${escaped}"]`,
    );
    if (byHandle) {
      return byHandle;
    }
  }

  return from;
}

function setCartBadgeHolds(next: number): void {
  cartBadgeHolds = Math.max(0, next);
  badgeHoldListeners.forEach((listener) => {
    listener(cartBadgeHolds);
  });
}

/** Clear held badge increments. Used by unit tests between cases. */
export function clearCartBadgeHolds(): void {
  setCartBadgeHolds(0);
}

/**
 * Report whether an element is painted with a non-zero box.
 *
 * @param element - Candidate fly target.
 * @returns True when the element has a visible rectangle.
 */
export function isVisibleFlyTarget(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Pick the visible header cart icon, or the bottom-nav cart as fallback.
 *
 * @returns The landing element, or null when none is on screen.
 */
export function resolveAddToCartFlyTarget(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const preferred = document.getElementById(CART_FLY_TARGET_ID);
  if (preferred && isVisibleFlyTarget(preferred)) {
    return preferred;
  }

  const marked = Array.from(document.querySelectorAll<HTMLElement>(`[${CART_FLY_TARGET_ATTR}]`));
  const visible = marked.filter((element) => isVisibleFlyTarget(element));
  return (
    visible.find((element) => element.getAttribute(CART_FLY_TARGET_ATTR) === 'header') ??
    visible[0] ??
    null
  );
}

/**
 * Replay the bag swallow class so the land squash can run again.
 *
 * @param target - Cart icon wrapper.
 */
export function playCartSwallow(target: HTMLElement): void {
  target.classList.remove(cartTokens.addToCartFlight.swallowClass);
  void target.getBoundingClientRect();
  target.classList.add(cartTokens.addToCartFlight.swallowClass);
  window.setTimeout(() => {
    target.classList.remove(cartTokens.addToCartFlight.swallowClass);
  }, cartTokens.addToCartFlight.swallowDurationMs);
}

/**
 * Replay the badge pop on the landing cart control.
 *
 * @param target - Cart icon wrapper that owns the count badge.
 */
export function playCartBadgePop(target: HTMLElement): void {
  target.classList.remove(cartTokens.addToCartFlight.badgePopClass);
  void target.getBoundingClientRect();
  target.classList.add(cartTokens.addToCartFlight.badgePopClass);
  window.setTimeout(() => {
    target.classList.remove(cartTokens.addToCartFlight.badgePopClass);
  }, cartTokens.addToCartFlight.swallowDurationMs);
}

/**
 * Play a short swallow + badge pop on the visible header (or nav) cart icon.
 *
 * @returns True when a visible cart target was pulsed.
 */
export function pulseCartFlyTarget(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const target = resolveAddToCartFlyTarget();
  if (!target) {
    return false;
  }

  playCartSwallow(target);
  playCartBadgePop(target);
  return true;
}

/**
 * Start a fly-to-cart of the product card toward the visible cart icon.
 *
 * @param origin - Source element and optional product image.
 * @returns The flight payload, or null when there is no landing target.
 */
export function playAddToCartFlight(origin: AddToCartFlightOrigin): AddToCartFlight | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const target = resolveAddToCartFlyTarget();
  if (!target) {
    return null;
  }

  const source = resolveProductCardFlySource(origin.source, origin.productHandle);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetRect = target.getBoundingClientRect();
  const toX = targetRect.left + targetRect.width / 2;
  const toY = targetRect.top + targetRect.height / 2;
  const sourceRect = source?.getBoundingClientRect();
  const fromWidth = sourceRect?.width || cartTokens.addToCartFlight.landSizePx;
  const fromHeight = sourceRect?.height || cartTokens.addToCartFlight.landSizePx;
  const fromLeft = sourceRect?.left ?? toX;
  const fromTop = sourceRect?.top ?? toY;
  const fromX = sourceRect ? sourceRect.left + sourceRect.width / 2 : toX;
  const fromY = sourceRect ? sourceRect.top + sourceRect.height / 2 : toY;
  const endScale = cartTokens.addToCartFlight.landSizePx / Math.max(fromWidth, 1);

  const flight: AddToCartFlight = {
    id: nextFlightId,
    productHandle: origin.productHandle,
    imageUrl: origin.imageUrl,
    fromX,
    fromY,
    fromLeft,
    fromTop,
    fromWidth,
    fromHeight,
    endScale,
    toX,
    toY,
    reducedMotion,
  };
  nextFlightId += 1;

  if (reducedMotion || !source) {
    playCartSwallow(target);
    playCartBadgePop(target);
    return flight;
  }

  setCartBadgeHolds(cartBadgeHolds + 1);
  listeners.forEach((listener) => {
    listener(flight);
  });

  window.setTimeout(() => {
    setCartBadgeHolds(cartBadgeHolds - 1);
    playCartSwallow(target);
    playCartBadgePop(target);
  }, cartTokens.addToCartFlight.durationMs);

  return flight;
}
