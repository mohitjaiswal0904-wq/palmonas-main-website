import rawConfig from '@/config/haptics/haptics.config.json';

export const hapticsConfig = rawConfig;

/** web-haptics preset used for commerce taps. */
export const hapticButtonClickPreset = hapticsConfig.buttonClickPreset;

/** Synchronous Vibration API pulse so Android feels the tap in the same gesture. */
export const hapticFallbackVibrateMs = hapticsConfig.fallbackVibrateMs;

/** Canonical analytics events that should vibrate. */
export const hapticCommerceEvents = new Set(hapticsConfig.commerceEvents);

/** Href fragments that mark cart / wishlist / checkout controls. */
export const hapticHrefNeedles = hapticsConfig.hrefNeedles;

/** Case-insensitive label fragments for commerce buttons. */
export const hapticLabelNeedles = hapticsConfig.labelNeedles;

/** DOM attribute that opts an element (or subtree) out of button haptics. */
export const hapticsIgnoreAttribute = 'data-haptics-ignore';

/** Explicit opt-in attribute when inference is not enough. */
export const hapticsOptInAttribute = 'data-haptics';
