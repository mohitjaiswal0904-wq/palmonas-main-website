# Cart feature flags

Cart UI and routes are driven by `src/config/cart/cart.config.json` under `features.*.enabled`.

## JSON shape

```json
"features": {
  "offers": { "enabled": false },
  "bundleDeal": { "enabled": false },
  "freeGift": { "enabled": false },
  "giftCard": { "enabled": false },
  "wallet": { "enabled": true },
  "giftWrap": { "enabled": false },
  "limitedTimeOffers": { "enabled": false },
  "address": { "enabled": false, "apiEnabled": true }
}
```

Set `"enabled": true` to turn a feature on. `address.apiEnabled` is reserved for future address API wiring; UI gating uses `address.enabled` via `isCartFeatureEnabled('address')`.

## What each flag controls

| Flag | UI / routes |
|------|-------------|
| `offers` | Coupon rows, `/cart/offers`, offer banners |
| `bundleDeal` | Bundle deal card in checkout sidebar |
| `freeGift` | Free-gift progress sections |
| `giftCard` | Gift card section, `/cart/gift-cards` |
| `wallet` | Wallet toggle on cart (authenticated users only) |
| `giftWrap` | Per-item gift wrap option |
| `limitedTimeOffers` | LTO carousel on cart |
| `address` | Delivery address bar, address sheet, checkout address UI |

Core cart (line items, quantity, price breakdown, checkout bar) is always available when the cart page is enabled.

## How to enable a feature

1. Set `"enabled": true` for the feature in `cart.config.json`.
2. Confirm related components use `isCartFeatureEnabled('<key>')` (most already do).
3. For route-only features, ensure the app route exists:
   - `offers` → `src/app/cart/offers/page.tsx` (redirects to `/cart` when disabled)
   - `giftCard` → `src/app/cart/gift-cards/page.tsx` (redirects when disabled)
4. Check API prerequisites:
   - **wallet** — requires authenticated session; guest users never see wallet UI.
   - **address** — mock addresses in `cart.config.json` until address API is wired. Cart Continue to Checkout is guest-allowed (GoKwik checkout).

## Helpers

- `isCartFeatureEnabled(feature)` — `src/config/cart/cart.config.ts`
- Theme tokens for cart — `src/config/theme/cart.tokens.ts`

After changing JSON, restart the dev server if hot reload does not pick up config changes.
