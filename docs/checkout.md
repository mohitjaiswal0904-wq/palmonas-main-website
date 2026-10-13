# Checkout (GoKwik + Shopify)

Storefront checkout goes through `checkoutProvider` in `src/infrastructure/checkout/`. Callers (cart page, Buy Now) never talk to GoKwik or Shopify directly.

## Default (production)

| Flag | Value | Meaning |
|---|---|---|
| `checkout.enabled` | `true` | Checkout is live |
| `checkout.provider` | `"gokwik"` | Prefer GoKwik custom checkout |
| `checkout.shopifyFallback` | `false` | Do **not** auto-redirect to Shopify if GoKwik fails |

With defaults: user taps Checkout → GoKwik opens. If GoKwik SDK/script fails, user sees an error toast and stays on cart. No Shopify redirect.

Config lives in `src/config/cart/cart.config.json` under `checkout`.

```json
"checkout": {
  "enabled": true,
  "provider": "gokwik",
  "shopifyFallback": false,
  "scriptVersion": "v4",
  "utmParams": { ... }
}
```

Helpers: `getCheckoutProvider()`, `isShopifyCheckoutFallbackEnabled()`, `isCheckoutEnabled()` in `src/config/cart/cart.config.ts`.

## Flow A — Force Shopify (long GoKwik outage)

Use when GoKwik is down for a long time and you want **every** checkout to skip GoKwik.

1. Set `"provider": "shopify"` in `cart.config.json`.
2. Redeploy / refresh (config is build-time JSON).
3. Leave `shopifyFallback` as-is (ignored when provider is `shopify`).

```json
"provider": "shopify",
"shopifyFallback": false
```

**What happens:** Cart / Buy Now call `checkoutProvider.openCheckout` with `checkoutUrl` from the cart API → toast `openingShopifyCheckout` → `window.location.assign` to HTTPS Shopify checkout (UTM params merged if missing).

**Restore GoKwik later:** set `"provider": "gokwik"` again and redeploy.

## Flow B — Auto-fallback (GoKwik first, Shopify on failure)

Use when GoKwik is usually fine but you want a safety net if the SDK fails to load or open.

1. Keep `"provider": "gokwik"`.
2. Set `"shopifyFallback": true`.
3. Redeploy / refresh.

```json
"provider": "gokwik",
"shopifyFallback": true
```

**What happens:** Try GoKwik. On failure, if `checkoutUrl` is a safe HTTPS URL, toast and redirect to Shopify. If Shopify URL is also missing/unsafe, show the original GoKwik error toast.

## Decision matrix

| `provider` | `shopifyFallback` | Behavior |
|---|---|---|
| `gokwik` | `false` | GoKwik only (default) |
| `gokwik` | `true` | GoKwik, then Shopify on open failure |
| `shopify` | `*` | Shopify only (skip GoKwik) |

`enabled: false` still shows “coming soon” stub for both providers.

## Architecture

```
CartPageContent / useBuyNow
  → checkoutProvider.openCheckout({ cartId, source, utmParams, checkoutUrl })
       → resolveCheckoutProvider()
            → stub | shopify adapter | gokwik (+ optional Shopify fallback)
```

- Shopify redirect: `src/infrastructure/checkout/shopify-checkout.ts` (HTTPS-only URL guard, UTM merge, toast, assign).
- GoKwik: `src/infrastructure/gokwik/checkout.ts` (unchanged Scenario 2 path).
- Facade router: `src/infrastructure/checkout/index.ts`.

`checkoutUrl` comes from the cart / buy-now cart payload (`cart.checkoutUrl`). Callers must pass it so force/fallback can redirect.

## Manual QA — two ways to test Shopify path

### 1) Force Shopify (no GoKwik)

1. Set `"provider": "shopify"`.
2. Restart / hard-refresh.
3. Add item → Checkout (or Buy Now).
4. Expect toast “Opening secure checkout…” then Shopify hosted checkout.
5. Complete a test payment on Shopify if validating end-to-end payment.

### 2) Fallback while GoKwik is “down”

1. Set `"provider": "gokwik"`, `"shopifyFallback": true`.
2. Restart / hard-refresh.
3. Chrome DevTools → Network → block request URL containing GoKwik CDN host (e.g. `pdp.gokwik.co`) **or** temporarily break GoKwik env so the SDK never becomes ready.
4. Checkout.
5. Expect GoKwik attempt to fail, then same Shopify toast + redirect.
6. Optional: set `shopifyFallback: false` and repeat — expect error toast only, no redirect.

Reset both flags to defaults (`gokwik` / `false`) before merging to production unless ops intentionally wants fallback on.

## Security notes

- Only absolute `https:` checkout URLs are accepted (`assertSafeShopifyCheckoutUrl`).
- `javascript:`, `data:`, `http:`, and relative URLs are rejected.
- UTM params from config are appended only when the key is not already on the URL.
