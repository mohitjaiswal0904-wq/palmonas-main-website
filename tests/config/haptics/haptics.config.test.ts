import {
  hapticButtonClickPreset,
  hapticCommerceEvents,
  hapticFallbackVibrateMs,
  hapticLabelNeedles,
  hapticsConfig,
  hapticsIgnoreAttribute,
} from '@/config/haptics/haptics.config';

describe('haptics config', () => {
  it('uses a feelable medium preset and sync vibrate fallback', () => {
    expect(hapticButtonClickPreset).toBe('medium');
    expect(hapticsConfig.buttonClickPreset).toBe('medium');
    expect(hapticFallbackVibrateMs).toBe(30);
  });

  it('scopes commerce events and labels to cart, wishlist, and checkout', () => {
    expect(hapticCommerceEvents.has('add_to_cart_clicked')).toBe(true);
    expect(hapticCommerceEvents.has('add_to_wishlist')).toBe(true);
    expect(hapticLabelNeedles).toEqual(expect.arrayContaining(['add to cart', 'checkout', 'wishlist']));
    expect(hapticsIgnoreAttribute).toBe('data-haptics-ignore');
  });
});
