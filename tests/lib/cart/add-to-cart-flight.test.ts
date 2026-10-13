import { cartTokens } from '@/config/theme/cart.tokens';
import {
  CART_FLY_TARGET_ID,
  isCollectionAddToCartFlightPath,
  clearCartBadgeHolds,
  playAddToCartFlight,
  pulseCartFlyTarget,
  resolveAddToCartFlyTarget,
  resolveProductCardFlySource,
  subscribeAddToCartFlight,
  subscribeCartBadgeHold,
  visibleCartBadgeCount,
} from '@/lib/cart/add-to-cart-flight';

function mockRect(element: HTMLElement, rect: Partial<DOMRect>): void {
  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    top: rect.top ?? 0,
    left: rect.left ?? 0,
    bottom: rect.bottom ?? 20,
    right: rect.right ?? 20,
    width: rect.width ?? 20,
    height: rect.height ?? 20,
    toJSON: () => ({}),
  });
}

describe('add-to-cart-flight', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearCartBadgeHolds();
    jest.restoreAllMocks();
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }) as unknown as typeof window.matchMedia;
  });

  it('returns true for collection listing paths', () => {
    expect(isCollectionAddToCartFlightPath('/')).toBe(true);
    expect(isCollectionAddToCartFlightPath('/collections')).toBe(true);
    expect(isCollectionAddToCartFlightPath('/collections/rings')).toBe(true);
  });

  it('returns false for non-collection paths', () => {
    expect(isCollectionAddToCartFlightPath('/products/ring')).toBe(false);
    expect(isCollectionAddToCartFlightPath('/wishlist')).toBe(false);
  });

  it('flies from the CTA to a visible header cart target', () => {
    const source = document.createElement('button');
    const target = document.createElement('a');
    target.id = CART_FLY_TARGET_ID;
    document.body.append(source, target);
    mockRect(source, { left: 10, top: 200, width: 20, height: 20 });
    mockRect(target, { left: 390, top: 40, width: 20, height: 20 });

    const listener = jest.fn();
    const unsubscribe = subscribeAddToCartFlight(listener);
    const flight = playAddToCartFlight({
      source,
      productHandle: 'ring',
      imageUrl: 'https://cdn.example.com/ring.jpg',
    });

    expect(resolveAddToCartFlyTarget()).toBe(target);
    expect(flight).toEqual(
      expect.objectContaining({
        productHandle: 'ring',
        imageUrl: 'https://cdn.example.com/ring.jpg',
        fromX: 20,
        fromY: 210,
        fromLeft: 10,
        fromTop: 200,
        fromWidth: 20,
        fromHeight: 20,
        endScale: 24 / 20,
        toX: 400,
        toY: 50,
        reducedMotion: false,
      }),
    );
    expect(listener).toHaveBeenCalledWith(flight);
    unsubscribe();
  });

  it('swallows without notifying listeners when motion is reduced', () => {
    const source = document.createElement('button');
    const target = document.createElement('a');
    target.id = CART_FLY_TARGET_ID;
    document.body.append(source, target);
    mockRect(source, { left: 0, top: 0, width: 20, height: 20 });
    mockRect(target, { left: 100, top: 10, width: 20, height: 20 });
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }) as unknown as typeof window.matchMedia;

    const listener = jest.fn();
    subscribeAddToCartFlight(listener);
    const flight = playAddToCartFlight({ source });

    expect(flight?.reducedMotion).toBe(true);
    expect(listener).not.toHaveBeenCalled();
    expect(target).toHaveClass(cartTokens.addToCartFlight.swallowClass);
  });

  it('returns null when no cart target is on screen', () => {
    const source = document.createElement('button');
    document.body.append(source);
    mockRect(source, { left: 0, top: 0, width: 20, height: 20 });

    expect(playAddToCartFlight({ source })).toBeNull();
    expect(resolveAddToCartFlyTarget()).toBeNull();
  });

  it('ignores a zero-size header target and uses the nav fallback', () => {
    const header = document.createElement('a');
    header.id = CART_FLY_TARGET_ID;
    header.setAttribute('data-cart-fly-target', 'header');
    const nav = document.createElement('a');
    nav.setAttribute('data-cart-fly-target', 'nav');
    document.body.append(header, nav);
    mockRect(header, { width: 0, height: 0 });
    mockRect(nav, { left: 200, top: 700, width: 24, height: 24 });

    expect(resolveAddToCartFlyTarget()).toBe(nav);
  });

  it('pulses the visible header cart', () => {
    const target = document.createElement('a');
    target.id = CART_FLY_TARGET_ID;
    document.body.append(target);
    mockRect(target, { left: 390, top: 40, width: 20, height: 20 });

    expect(pulseCartFlyTarget()).toBe(true);
    expect(target).toHaveClass(cartTokens.addToCartFlight.swallowClass);
    expect(target).toHaveClass(cartTokens.addToCartFlight.badgePopClass);
  });

  it('does not pulse when no cart target is visible', () => {
    expect(pulseCartFlyTarget()).toBe(false);
  });

  it('resolves the product card wrapping a CTA', () => {
    const card = document.createElement('article');
    card.setAttribute('data-product-card', '');
    const button = document.createElement('button');
    card.append(button);
    document.body.append(card);

    expect(resolveProductCardFlySource(button)).toBe(card);
  });

  it('resolves a listing card by product handle', () => {
    const card = document.createElement('article');
    card.setAttribute('data-product-card', '');
    card.setAttribute('data-product-handle', 'golden-layers');
    document.body.append(card);

    expect(resolveProductCardFlySource(null, 'golden-layers')).toBe(card);
  });

  it('falls back to the CTA when the handle is not on the page', () => {
    const button = document.createElement('button');
    document.body.append(button);
    expect(resolveProductCardFlySource(button, 'missing-handle')).toBe(button);
  });

  it('holds the badge count until the flight lands', () => {
    jest.useFakeTimers();
    const source = document.createElement('button');
    const target = document.createElement('a');
    target.id = CART_FLY_TARGET_ID;
    document.body.append(source, target);
    mockRect(source, { left: 10, top: 200, width: 80, height: 120 });
    mockRect(target, { left: 390, top: 40, width: 20, height: 20 });

    const holds = jest.fn();
    subscribeCartBadgeHold(holds);
    playAddToCartFlight({ source });

    expect(holds).toHaveBeenLastCalledWith(1);
    expect(visibleCartBadgeCount(3, 1)).toBe(2);

    jest.advanceTimersByTime(cartTokens.addToCartFlight.durationMs);
    expect(holds).toHaveBeenLastCalledWith(0);
    jest.useRealTimers();
  });

  it('does not hold the badge when motion is reduced', () => {
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }) as unknown as typeof window.matchMedia;
    const source = document.createElement('button');
    const target = document.createElement('a');
    target.id = CART_FLY_TARGET_ID;
    document.body.append(source, target);
    mockRect(source, { width: 20, height: 20 });
    mockRect(target, { left: 100, top: 10, width: 20, height: 20 });

    const holds = jest.fn();
    subscribeCartBadgeHold(holds);
    playAddToCartFlight({ source });

    expect(holds).toHaveBeenLastCalledWith(0);
  });
});
