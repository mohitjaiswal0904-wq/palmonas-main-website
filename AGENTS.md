<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Palmonas frontend — agent rules

## Feature module layout

Every feature (`auth`, `cart`, `product`, …) uses:

- `src/types/<feature>/` — DTOs, Zod schemas, transforms (no HTTP, no React)
- `src/config/<feature>/` — constants, UI copy, feature config
- `src/services/<feature>/` — HTTP via shared `lib/api.ts` only
- `src/repositories/<feature>/` — orchestration; calls services, never `axios`/`api` directly
- `src/lib/<feature>/` — pure feature utils only (not vendor SDKs). Shared helpers go here (or `@/lib/utils/`), never exported from a component for another module to import.
- `src/infrastructure/<capability>/` — third-party vendor adapters (see Vendor SDKs)
- `src/hooks/<feature>/`, `src/providers/<feature>/`, `src/components/<feature>/`

**Dependency rule:** UI → hooks/providers → repositories → services → `lib/api.ts`.

## HTTP and auth tokens

- All client HTTP uses `lib/api.ts` → `getApiBaseUrl()` (direct Palmonas API, no BFF).
- JWTs live in **secure client cookies** via `lib/auth/auth.client.ts` (`cookieClient`: `secure` in prod, `sameSite: 'lax'`). Use one host in dev (`localhost` **or** `127.0.0.1`, not both — separate cookie jars).
- Request interceptor on `lib/api` attaches `Authorization: Bearer` on every call (guest and authenticated); 401 triggers refresh via `ENDPOINTS.auth.refresh` then retries once.
- `user_id`, `session_id`, `is_guest` come from `useAuth().claims` (hydrated from JWT + validate API in `auth.repository`).
- Register protected routes/actions/modals/apis in `config/auth/auth.config.json`; use `useRequireAuth()` — never ad-hoc `if (!user)` checks. See [`docs/auth-guard.md`](docs/auth-guard.md).
- **SSR:** `lib/server-api.ts` reads `auth_token` cookie from `cookies()` for server-side authenticated requests.

## Vendor SDKs (infrastructure)

- Third-party SDKs live under `src/infrastructure/<capability>/<vendor>/`.
- Only `<vendor>/adapter.ts` may touch vendor globals (`window`, script tags).
- Define a vendor-agnostic port in `src/types/<feature>/` (e.g. `identity-provider.port.ts`).
- Features import `@/infrastructure/<capability>` (facade), never the vendor subfolder directly.
- **Button haptics:** `web-haptics` via `@/infrastructure/haptics`. Do not call the SDK in components — `HapticClickTracker` covers wishlist / cart / checkout taps. Opt out with `data-haptics-ignore`.
- Example: `src/infrastructure/identity/kwikpass/adapter.ts` implements `IdentityProviderPort`;
  `src/infrastructure/identity/index.ts` exports `identityProvider`.
- `src/lib/<feature>/` is for pure feature utils only (e.g. `lib/auth/auth.client.ts`), not vendor SDKs.

## Documentation

- TSDoc on every **exported** function (required). TSDoc on exported types and interface properties when non-obvious.
- TSDoc on **module-private helpers** and **React `useCallback` handlers** in feature modules when they encode business logic (auth bootstrap, token refresh, guards, vendor SDK wiring, transforms, optimistic mutations).
- Use `@param`, `@returns`, and `@throws` where applicable; one-line imperative summary first.
- **Inline comments** inside function bodies only where logic is non-obvious (business rules, workarounds, API quirks) — not on every line.
- Skip TSDoc on trivial one-liners (e.g. `cn()` wrappers, inline JSX handlers) and inner closure loops.
- **`useEffect` blocks**: add a one-line block comment above the effect describing *why* it runs (not what React does).

## User-facing copy (localization-ready)

- All user-facing strings for a feature live in `src/config/<feature>/<feature>.config.json` under a `messages` object.
- Export typed constants from `<feature>.config.ts` (e.g. `authMessages`, `cartMessages`) — never import JSON directly from components/hooks.
- Group messages consistently: **labels** (UI copy), **toasts** (success feedback), **errors** (fallback when API message unavailable), **validation** (client-side / pre-submit checks), **a11y** (`aria-label`, region labels), and feature-specific groups (e.g. **checkout**).
- **No hardcoded** user-facing strings in hooks, stores, components, or infrastructure adapters. Dynamic API `err.message` may pass through; config holds fallback copy only.
- Mock/fixture data in config (e.g. `mock.addresses`) is exempt — it is test/placeholder content, not the copy registry.
- Reference: [`auth.config.json`](src/config/auth/auth.config.json) → `authMessages`; cart mirrors with `cartMessages`.

## Tests

- Unit tests live in `tests/` mirroring `src/` exactly:
  - `src/foo/bar.ts` → `tests/foo/bar.test.ts`
  - `src/components/auth/MyPanel.tsx` → `tests/components/auth/MyPanel.test.tsx`
- Do not add `*.test.ts` under `src/`.
- **Every folder under `src/` needs tests when you add or change code:**
  `config`, `types`, `lib`, `services`, `repositories`, `hooks`, `providers`, `components`, `infrastructure`.
- **Components:** React Testing Library; mock hooks/context — test visible states and a11y (roles, labels).
- **Logic layers:** mock at `api` / service boundary — no real network or cookies.
- **Per export or UI state:** minimum 2 happy-path + 2 failure-path scenarios.
- Follow Documentation rules above in test files for exported test helpers.
- **Coverage target:** 90–95% (stmts, branches, functions, lines) on touched modules.
- Before PR: `pnpm test:coverage` — tests must pass; address WARN rows (advisory, not commit-blocking).
- Exclude from coverage: Next `<Script>` loaders, E2E-only flows (comment in test file).

## Theme and styling

- Brand and feature colors live in `src/config/theme/` — add tokens there first, then wire via CSS variables in `src/styles/globals.css` and semantic Tailwind classes in `tailwind.config.ts`. Lib color helpers import those tokens; they do not declare hex or layout numbers.
- Feature layout/type/gradient tokens (e.g. making-charges width, offer ribbon) live in `src/config/theme/<feature>.tokens.ts`. Delays/URLs/flags stay in `config/<feature>/<feature>.config.json` (including which routes get which header chrome via `routeConfigs`).
- Fonts: use `themeFonts` from `@/config/theme/fonts` — do not add per-file `next/font` loaders.
- Never hardcode `#hex` values in components; use semantic classes (`bg-surface-elevated`, `text-brand-navy`, `rounded-palmonas-lg`, etc.) or feature theme tokens.
- Auth UI: KwikPass plugin overlay for login OTP; `AuthLoginStatusOverlay` for loading/success/error states.

## Horizontal scroll (mobile touch)

- Any horizontal scroll region must allow vertical page scroll when the user swipes up/down on the track.
- Use `HORIZONTAL_SCROLL_PASS_VERTICAL` from `@/lib/layout/horizontal-scroll` on the scroll container (with `cn()`).
- **Do not** add Tailwind `touch-pan-x` — it locks touch to the horizontal axis and stops vertical scrolling (PW-567).
- Prefer `overscroll-x-contain` via the shared constant; see `CmsSlideCarousel`, `BannerSlideCarousel`, `ProductCarousel`, `OfferBadges`.

## Button haptics

- `HapticClickTracker` fires only on wishlist, cart, and checkout controls. Do not add `useWebHaptics` or `navigator.vibrate` in components.
- Import `@/infrastructure/haptics` when an extra named pulse is required. Opt out with `data-haptics-ignore`.
## Cache Components — do not undo

`cacheComponents: true` (Next 16). Instant-nav validation and iOS/Android swipe-back break if these come back.

- **Never re-add `loading.tsx`** on `/collections/[handle]`, Emily / Shraddha (+ `/pages/` aliases), `/cart`, `/products/[handle]`, `/` (`(marketing)`), `/search`, `/wishlist`. That file wraps the whole segment; Cache Components then sticks the skeleton on soft-nav and replaces the Activity-preserved page on gesture-back. `StreamingPageShell` / page `<Suspense>` already owns the fallback.
- **Public catalog + CMS SSR** (`collection.service.server`, `cms-page.service.server`, their `generateMetadata`) must use `createPublicServerApi()` — never `createServerApi()` / `cookies()`. Cookie reads make the route dynamic and block `/` and listings.
- **Page-level `<Suspense>`** around uncached fetches. A layout `StreamingPageShell` is too high (`blocking-prerender-dynamic`). Keep `HomeCmsPage` wrapping `HomeCmsMain` in `<Suspense fallback={<HomePageSkeleton />}>`.
- Keep `export const prefetch = 'partial'` on those listing / PDP / cart / home / search pages.
- `StreamingPageShell` main must stay `StableMainSuspense` (last body per pathname). Do not switch it back to a raw `<Suspense>` — swipe-back remounts the page and would flash the listing skeleton.
- `CartPageContent` must not wait on `useAuth().isLoading` / bootstrap. First fetch is `loading && !cart` only.
- `NavigationPendingProvider` must clear on `popstate` and persisted `pageshow`. Pathname arrival is enough — cart UTM search must not hold the overlay.
