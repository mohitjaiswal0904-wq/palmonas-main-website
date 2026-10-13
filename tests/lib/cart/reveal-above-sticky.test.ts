import { revealAboveStickyDelta } from '@/lib/cart/reveal-above-sticky';

function mockBox(el: HTMLElement, top: number, bottom: number, height: number): void {
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: height });
  el.getBoundingClientRect = () =>
    ({
      top,
      bottom,
      height,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('revealAboveStickyDelta', () => {
  it('returns overlap plus gap when the card sits under the footer', () => {
    const card = document.createElement('div');
    const footer = document.createElement('div');
    mockBox(card, 500, 820, 320);
    mockBox(footer, 778, 900, 122);

    expect(revealAboveStickyDelta(card, footer, 16)).toBe(58);
  });

  it('returns 0 when the card is already above the footer', () => {
    const card = document.createElement('div');
    const footer = document.createElement('div');
    mockBox(card, 200, 400, 200);
    mockBox(footer, 700, 850, 150);

    expect(revealAboveStickyDelta(card, footer, 16)).toBe(0);
  });

  it('returns 0 when the footer is not in the layout', () => {
    const card = document.createElement('div');
    const footer = document.createElement('div');
    mockBox(card, 500, 820, 320);
    mockBox(footer, 778, 778, 0);

    expect(revealAboveStickyDelta(card, footer, 16)).toBe(0);
  });

  it('returns 0 when card or footer is missing', () => {
    expect(revealAboveStickyDelta(null, document.createElement('div'))).toBe(0);
    expect(revealAboveStickyDelta(document.createElement('div'), null)).toBe(0);
  });
});
