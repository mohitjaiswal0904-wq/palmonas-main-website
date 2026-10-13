# Auth guard system

Unified client and middleware auth gating for Palmonas. **Single registry** in `src/config/auth/auth.config.json` — never duplicate protected paths in middleware manually.

## Registry schema

```json
{
  "protected": {
    "routes": ["/checkout", "/account/orders", "/account/profile"],
    "actions": { "reviews.write": "authenticated" },
    "modals": { "checkout.address": "authenticated" },
    "apis": { "wishlist.add": "authenticated" }
  }
}
```

Requirement value `"authenticated"` means a **non-guest** user. Guests always receive JWTs from guest-login — middleware must reject guest tokens on protected routes.

## Four guard surfaces

| Surface | API | When to use |
|---------|-----|-------------|
| **Navigation** | Middleware + optional `guardNavigation()` | Full-page routes |
| **Actions** | `useRequireAuth().guard()` | Buttons, menu items, callbacks |
| **Modals** | `useRequireAuth().guardModal()` | Dialog/drawer open handlers |
| **API mutations** | `useRequireAuth().guardApi()` | Before calling a service from a hook |

All client guards delegate to `AuthProvider` pending-action flow: if denied → stash callback → `startLogin()` → replay after success.

## Navigation (middleware)

1. Add path to `protected.routes` in `auth.config.json`
2. Middleware matcher is **auto-synced** via `getMiddlewareMatcherFromConfig()` — do not hardcode matcher arrays
3. Middleware rejects missing token **or** guest JWT (`isGuestToken`) → `/?login=1&redirect=<path>`

## Client examples

### Action (button)

```tsx
const { guard } = useRequireAuth();

guard(() => openReviewSheet(), { actionId: 'reviews.write' });
```

### Navigation (programmatic)

```tsx
const { guardNavigation } = useRequireAuth();

guardNavigation('/checkout');
```

### Modal

```tsx
const { guardModal } = useRequireAuth();

<Button onClick={() => guardModal(() => setOpen(true), { modalId: 'checkout.address' })}>
  Edit address
</Button>
```

### API mutation (hook)

```tsx
const { guardApi } = useRequireAuth();

const addToWishlist = async (productId: string) => {
  await guardApi(() => addWishlistItem(productId), { apiId: 'wishlist.add' });
};
```

**Note:** Cart mutations (add / update / remove / clear), **Buy Now**, and **cart Continue to Checkout** are **guest-allowed** — call repository services directly when a session exists. `guardApi` is a **client UX gate** for protected APIs only. Palmonas API enforces authorization server-side. `lib/api` still attaches Bearer tokens for all sessions including guests.

## Guest vs authenticated

| State | `session.user.isGuest` | Protected route | Protected action/modal/api |
|-------|------------------------|-----------------|----------------------------|
| No session | — | Redirect to login | Opens login flow |
| Guest | `true` | Redirect to login | Opens login flow (except cart mutations and buy now) |
| Logged in | `false` | Pass through | Runs immediately |

## Implementation modules

| Module | Role |
|--------|------|
| `config/auth/auth.config.json` | Registry source of truth |
| `config/auth/auth.config.ts` | Typed loader + `sanitizeAuthRedirect`, CSP, matcher helpers |
| `lib/auth/auth.client.ts` | `isGuestToken`, `canAccessSession`, token storage, JWT parse |
| `providers/auth/AuthProvider.tsx` | Pending action refs, KwikPass login, guard implementations |
| `hooks/auth/useAuth.ts` | `useRequireAuth()` facade |
| `middleware.ts` | Route guard + CSP headers |

## Dev warnings

In development, unregistered `actionId` / `modalId` / `apiId` values log `[auth.guard] Unregistered …` — register them in `auth.config.json`.
