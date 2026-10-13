/**
 * @jest-environment jsdom
 */

import {
  attachHorizontalMouseScroll,
  canScrollHorizontally,
  resolveHorizontalWheelDelta,
} from '@/lib/layout/horizontal-mouse-scroll';

class TestPointerEvent extends Event {
  pointerType: string;
  button: number;
  clientX: number;
  pointerId: number;

  constructor(
    type: string,
    init: { pointerType?: string; button?: number; clientX?: number; pointerId?: number } = {},
  ) {
    super(type, { bubbles: true, cancelable: true });
    this.pointerType = init.pointerType ?? 'mouse';
    this.button = init.button ?? 0;
    this.clientX = init.clientX ?? 0;
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'PointerEvent', {
    configurable: true,
    writable: true,
    value: TestPointerEvent,
  });
});

function createRail(options: { scrollWidth: number; clientWidth: number; scrollLeft?: number }) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollWidth', { configurable: true, get: () => options.scrollWidth });
  Object.defineProperty(el, 'clientWidth', { configurable: true, get: () => options.clientWidth });
  el.scrollLeft = options.scrollLeft ?? 0;
  document.body.appendChild(el);
  return el;
}

describe('canScrollHorizontally', () => {
  it('allows scrolling when content overflows and room remains', () => {
    const el = createRail({ scrollWidth: 400, clientWidth: 200, scrollLeft: 50 });
    expect(canScrollHorizontally(el, 10)).toBe(true);
    expect(canScrollHorizontally(el, -10)).toBe(true);
  });

  it('blocks scrolling when content fits or edges are reached', () => {
    const fitted = createRail({ scrollWidth: 200, clientWidth: 200 });
    expect(canScrollHorizontally(fitted, 10)).toBe(false);

    const atStart = createRail({ scrollWidth: 400, clientWidth: 200, scrollLeft: 0 });
    expect(canScrollHorizontally(atStart, -10)).toBe(false);

    const atEnd = createRail({ scrollWidth: 400, clientWidth: 200, scrollLeft: 200 });
    expect(canScrollHorizontally(atEnd, 10)).toBe(false);
  });
});

describe('resolveHorizontalWheelDelta', () => {
  it('uses deltaX when the gesture is clearly horizontal', () => {
    expect(resolveHorizontalWheelDelta({ deltaX: 40, deltaY: 5, shiftKey: false })).toBe(40);
  });

  it('maps shift+wheel vertical delta to horizontal without stealing plain vertical scroll', () => {
    expect(resolveHorizontalWheelDelta({ deltaX: 0, deltaY: 30, shiftKey: true })).toBe(30);
    expect(resolveHorizontalWheelDelta({ deltaX: 0, deltaY: 30, shiftKey: false })).toBeNull();
  });
});

describe('attachHorizontalMouseScroll', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('does not convert plain vertical wheel into horizontal scroll', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    const scrollBy = jest.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    const cleanup = attachHorizontalMouseScroll(el);

    const event = new WheelEvent('wheel', { deltaY: 40, cancelable: true });
    const prevented = !el.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(el.scrollLeft).toBe(0);
    expect(scrollBy).toHaveBeenCalledWith(0, 40);
    cleanup();
    scrollBy.mockRestore();
  });

  it('scrolls horizontally on shift+wheel when overflow exists', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    const cleanup = attachHorizontalMouseScroll(el);

    const event = new WheelEvent('wheel', { deltaY: 40, shiftKey: true, cancelable: true });
    const prevented = !el.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(el.scrollLeft).toBe(40);
    cleanup();
  });

  it('does not trap shift+wheel when the rail cannot scroll further', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    const scrollBy = jest.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    const cleanup = attachHorizontalMouseScroll(el);

    const event = new WheelEvent('wheel', { deltaY: -20, shiftKey: true, cancelable: true });
    el.dispatchEvent(event);

    expect(el.scrollLeft).toBe(0);
    cleanup();
    scrollBy.mockRestore();
  });

  it('drags horizontal scroll with mouse pointers and suppresses the following click', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    el.setPointerCapture = jest.fn();
    el.releasePointerCapture = jest.fn();
    el.hasPointerCapture = jest.fn(() => true);
    el.scrollTo = jest.fn();
    const cleanup = attachHorizontalMouseScroll(el);

    el.dispatchEvent(
      new TestPointerEvent('pointerdown', {
        pointerType: 'mouse',
        button: 0,
        clientX: 100,
        pointerId: 1,
      }),
    );
    el.dispatchEvent(
      new TestPointerEvent('pointermove', { pointerType: 'mouse', clientX: 60, pointerId: 1 }),
    );
    el.dispatchEvent(
      new TestPointerEvent('pointerup', { pointerType: 'mouse', clientX: 60, pointerId: 1 }),
    );

    expect(el.scrollLeft).toBe(40);
    expect(el.setPointerCapture).toHaveBeenCalledWith(1);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = !el.dispatchEvent(click);
    expect(prevented).toBe(true);
    cleanup();
  });

  it('does not capture the pointer or steal a click when the mouse did not drag', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    el.setPointerCapture = jest.fn();
    el.releasePointerCapture = jest.fn();
    el.hasPointerCapture = jest.fn(() => false);
    const cleanup = attachHorizontalMouseScroll(el);

    el.dispatchEvent(
      new TestPointerEvent('pointerdown', {
        pointerType: 'mouse',
        button: 0,
        clientX: 100,
        pointerId: 1,
      }),
    );
    el.dispatchEvent(
      new TestPointerEvent('pointerup', { pointerType: 'mouse', clientX: 100, pointerId: 1 }),
    );

    expect(el.setPointerCapture).not.toHaveBeenCalled();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    expect(el.dispatchEvent(click)).toBe(true);
    cleanup();
  });

  it('blocks native dragstart so media carousels can be mouse-swiped', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200 });
    const cleanup = attachHorizontalMouseScroll(el);
    const event = new Event('dragstart', { bubbles: true, cancelable: true });
    const prevented = !el.dispatchEvent(event);

    expect(prevented).toBe(true);
    cleanup();
  });

  it('ignores touch pointers so native swipe keeps working', () => {
    const el = createRail({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
    const cleanup = attachHorizontalMouseScroll(el);

    el.dispatchEvent(
      new TestPointerEvent('pointerdown', {
        pointerType: 'touch',
        button: 0,
        clientX: 100,
        pointerId: 2,
      }),
    );
    el.dispatchEvent(
      new TestPointerEvent('pointermove', { pointerType: 'touch', clientX: 40, pointerId: 2 }),
    );

    expect(el.scrollLeft).toBe(0);
    cleanup();
  });
});
