/** @jest-environment jsdom */

import { findHapticClickTarget } from '@/lib/haptics/find-haptic-click-target';

describe('findHapticClickTarget', () => {
  it('matches add-to-cart and wishlist buttons by label', () => {
    document.body.innerHTML = `
      <button type="button" aria-label="Add to cart">Add</button>
      <button type="button" aria-label="Add Halo to wishlist">Heart</button>
    `;

    const buttons = document.querySelectorAll('button');
    expect(findHapticClickTarget(buttons[0]!)).toBe(buttons[0]);
    expect(findHapticClickTarget(buttons[1]!)).toBe(buttons[1]);
  });

  it('matches cart / wishlist links and checkout CTAs', () => {
    document.body.innerHTML = `
      <a href="/cart"><span>Bag</span></a>
      <button type="button">Continue to Checkout</button>
    `;

    expect(findHapticClickTarget(document.querySelector('a span'))).toBe(
      document.querySelector('a'),
    );
    expect(findHapticClickTarget(document.querySelector('button'))).toBe(
      document.querySelector('button'),
    );
  });

  it('matches explicit data-haptics and commerce analytics events', () => {
    document.body.innerHTML = `
      <button type="button" data-haptics>Pay</button>
      <button type="button" data-analytics-event="add_to_cart_clicked">Bag</button>
    `;

    const buttons = document.querySelectorAll('button');
    expect(findHapticClickTarget(buttons[0]!)).toBe(buttons[0]);
    expect(findHapticClickTarget(buttons[1]!)).toBe(buttons[1]);
  });

  it('ignores unrelated buttons and plain text', () => {
    document.body.innerHTML = `
      <button type="button">Change pincode</button>
      <p>copy</p>
    `;

    expect(findHapticClickTarget(document.querySelector('button'))).toBeNull();
    expect(findHapticClickTarget(document.querySelector('p'))).toBeNull();
    expect(findHapticClickTarget(null)).toBeNull();
  });

  it('skips disabled, aria-disabled, and data-haptics-ignore commerce controls', () => {
    document.body.innerHTML = `
      <button type="button" aria-label="Add to cart" disabled>Off</button>
      <button type="button" aria-label="Buy now" aria-disabled="true">Busy</button>
      <div data-haptics-ignore>
        <button type="button" aria-label="Add to cart">Skip</button>
      </div>
    `;

    expect(findHapticClickTarget(document.querySelector('button[disabled]'))).toBeNull();
    expect(findHapticClickTarget(document.querySelector('[aria-disabled="true"]'))).toBeNull();
    expect(findHapticClickTarget(document.querySelector('[data-haptics-ignore] button'))).toBeNull();
  });
});
