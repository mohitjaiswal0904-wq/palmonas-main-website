import { cartTokens } from '@/config/theme/cart.tokens';

describe('cart.tokens mobile footer clearance', () => {
  it('exposes fallback height and gap under the Order Summary', () => {
    expect(cartTokens.mobileStickyFooterFallbackPx).toBeGreaterThan(0);
    expect(cartTokens.mobileStickyFooterGapPx).toBeGreaterThan(0);
  });
});

describe('cart.tokens order summary', () => {
  it('uses a 16px card and Figma row colors', () => {
    expect(cartTokens.orderSummaryCardClass).toContain('rounded-2xl');
    expect(cartTokens.orderSummaryCardBorder).toBe('#e8e8e8');
    expect(cartTokens.orderSummaryPositive).toBe('#16a34a');
    expect(cartTokens.orderSummaryDivider).toBe('#ececec');
  });

  it('sizes title and values to the desktop frame', () => {
    expect(cartTokens.orderSummaryTitleClass).toContain('text-[15px]');
    expect(cartTokens.orderSummaryLabelClass).toContain('text-[13px]');
    expect(cartTokens.orderSummaryTotalValueClass).toContain('text-base');
  });
});

describe('cart.tokens coupon fail panel', () => {
  it('uses a bordered panel, not loose red text', () => {
    expect(cartTokens.couponFailPanelClass).toContain('rounded-lg');
    expect(cartTokens.couponFailErrorClass).toContain('text-[11px]');
  });
});

describe('cart.tokens chooseOptionsOverlay', () => {
  it('docks as a bottom sheet below tab', () => {
    expect(cartTokens.chooseOptionsOverlay.backdropClass).toContain('items-end');
    expect(cartTokens.chooseOptionsOverlay.shellClass).toContain('rounded-t-[20px]');
  });

  it('centers the Figma dialog from tab up', () => {
    expect(cartTokens.chooseOptionsOverlay.backdropClass).toContain('tab:items-center');
    expect(cartTokens.chooseOptionsOverlay.shellClass).toContain('tab:max-w-[396px]');
    expect(cartTokens.chooseOptionsOverlay.shellClass).toContain('tab:rounded-[13px]');
  });

  it('does not use laptop as the sheet/dialog split', () => {
    expect(cartTokens.chooseOptionsOverlay.backdropClass).not.toContain('laptop:');
    expect(cartTokens.chooseOptionsOverlay.shellClass).not.toContain('laptop:');
  });

  it('keeps the dialog narrower than a full-bleed sheet', () => {
    expect(cartTokens.chooseOptionsOverlay.shellClass).not.toContain('tab:max-w-full');
    expect(cartTokens.chooseOptionsOverlay.shellClass).toContain('w-full');
  });
});

describe('cart.tokens addToCartFlight', () => {
  it('exposes flight duration and chip classes', () => {
    expect(cartTokens.addToCartFlight.durationMs).toBe(760);
    expect(cartTokens.addToCartFlight.arcLiftPx).toBe(56);
    expect(cartTokens.addToCartFlight.chipClass).toContain('cart-fly-chip');
    expect(cartTokens.addToCartFlight.landSizePx).toBe(24);
  });

  it('exposes swallow and badge pop classes', () => {
    expect(cartTokens.addToCartFlight.swallowClass).toBe('cart-fly-swallow');
    expect(cartTokens.addToCartFlight.badgePopClass).toBe('cart-fly-badge-pop');
  });

  it('keeps the overlay above page chrome', () => {
    expect(cartTokens.addToCartFlight.layerClass).toContain('z-fixed');
    expect(cartTokens.addToCartFlight.chipClass).toContain('z-fixed');
    expect(cartTokens.addToCartFlight.chipClass).toContain('origin-center');
  });

  it('uses a shorter swallow than the flight', () => {
    expect(cartTokens.addToCartFlight.swallowDurationMs).toBeLessThan(
      cartTokens.addToCartFlight.durationMs,
    );
  });
});
