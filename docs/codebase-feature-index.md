# Codebase feature index

Use this **before** Plan/Agent explore. Point Cursor at a feature row + path globs so it does not crawl the whole monorepo.

Stack reminder (from `AGENTS.md`):

```text
UI (components) → hooks/providers → repositories → services → lib/api | lib/server-api
SSR pages (app/) → services/server only
```

**Maintenance:** when you add a feature folder or move an entrypoint, update **that section only**. Prefer folders + key files over every leaf file.

## Cursor cost habits (keep short — do not copy into AGENTS.md)

| Task | Mode |
|---|---|
| Multi-file / unclear location | Plan, then **new** Agent chat with plan file list only |
| Tiny Figma / ≤ ~5 known files | Skip Plan — Agent with exact paths |
| Question only | Ask mode |

- Plan: read this file’s feature section first; explore only that section’s **Plan globs**; max ~15 files; no explore subagents.
- Execute: new chat; touch only listed files; no re-crawl.
- Figma MCP: off unless that chat needs design pull.
- Do not paste this index into always-on rules — `@docs/codebase-feature-index.md` when needed.

---

## Quick route → feature

| Route / area | Feature key | Primary UI |
|---|---|---|
| `/` (marketing home) | `home` / `cms` | `components/home`, `components/cms` |
| `/products/[handle]` | `product` | `components/product` |
| `/collections/[handle]` | `collection` | `components/collection`, `global/product-listing` |
| `/cart`, `/cart/offers`, `/cart/gift-cards` | `cart` | `components/cart` |
| `/wishlist` | `wishlist` | `components/wishlist` |
| `/search` | `search` | `components/search` |
| `/account`, `/account/profile`, `/account/order-history`, `/account/wallet`, `/account/wishlist`, `/account/delivery-address`, `/account/refer-and-earn`, `/account/support`, `/account/how-to-earn`, `/account/how-to-redeem`, `/account/faqs`, `/account/privacy-policy`, `/account/plan-of-purchase`, `/account/login`, `/account/register` | `account` | `components/account` |
| `/dashboard` | `account` / `auth` | `components/account`, `config/auth` guards |
| KwikPass overlay | `auth` | `components/auth`, `infrastructure/identity` |
| `/order-success` | `cart` | `app/order-success` (post-checkout) |
| `/pop`, `/pop/my-plan/*` | `pop` | `components/pop` |
| `/blogs`, `/blogs/[handle]` | `blog` | `components/blog` |
| `/pages/*`, CMS pages | `cms` | `components/cms` |
| `/palmonas-stores` | `stores` | `components/stores` |
| `/contact-us` | `contact` | `components/contact` |
| `/careers` | `careers` | `components/careers` |
| `/pages/faqs` | `faqs` | `components/faqs` |
| campaigns (`emily-in-paris`, `shraddhas-favourite`) | campaign configs | matching `components/*` |

---

## Cross-cutting (always relevant)

| Path | What exists |
|---|---|
| `src/lib/api.ts` | Browser HTTP → main external API |
| `src/lib/server-api.ts` | SSR HTTP → main external API |
| `src/lib/mto-api.ts` | MTO utils (EDD / live price) |
| `src/lib/oms-api.ts` | OMS stores API |
| `src/lib/endpoints.ts` | External API path constants |
| `src/lib/env.ts` | Env accessors (never raw `process.env` in app code) |
| `src/lib/errors.ts` | Error normalisation |
| `src/lib/seo/` + `src/lib/seo.ts` | Metadata helpers (`buildMetadata`) |
| `src/lib/query/` | TanStack Query keys, retry helpers |
| `src/lib/cookies/` | Cookie key constants (`AUTH_TOKEN_KEY`, etc.) |
| `src/middleware.ts` | CSP headers + guest redirect on protected routes (`config/auth`) |
| `src/app/layout.tsx` | Root layout + provider tree |
| `src/store/` | Client UI state (`cart/`, `ui.store.ts`) |
| `src/config/site.config.ts` | Site-wide constants |
| `src/config/pincode.config.ts` | Pincode copy / validation config |
| `src/config/theme/` | Brand tokens |
| `src/config/user/` | User/wallet messages (`user.config.json`) |
| `src/components/ui/` | Shared UI primitives |
| `src/components/icons/` | Shared SVG icons (USP, delivery, gold, etc.) |
| `src/components/layout/` | Header, Footer, drawer, cart drawer, pincode modal — see **layout** section |
| `src/components/global/` | Shared listing / cross-page UI |
| `src/providers/` | App, Query, Theme, Toast, Cart, Pincode, auth |
| `src/services/server/header.service.server.ts`, `footer.service.server.ts` | SSR chrome data |
| `tests/` | Mirrors `src/` — `src/foo/bar.ts` → `tests/foo/bar.test.ts` |
| `src/app/api/` | **Do not add Route Handlers for backend BFF** — project rule: external API only (existing folders may be legacy; prefer services) |

Plan globs for “shared chrome only”:

```text
src/components/layout/**, src/components/ui/**, src/components/icons/**, src/config/menu.config.ts, src/config/drawer-menu.config.ts, src/config/brand-content.config.ts, src/services/server/header*, src/services/server/footer*, src/types/layout.ts, src/types/footer.ts, src/types/drawer-menu.ts, src/middleware.ts, src/app/layout.tsx
```

---

## Feature: `layout` (header, footer, global chrome)

**Routes:** all pages (via `app/layout.tsx`)

| Layer | Path | What exists |
|---|---|---|
| UI | `components/layout/` | `Header/`, `Footer/`, `drawer/`, `BrandContent/` |
| UI (top-level) | `components/layout/*.tsx` | `CartDrawer`, `PincodeModal`, `MegaMenu`, `MobileMenu`, `SearchDrawer`, `AnnouncementBar`, `PageChromeSkeleton` |
| Config | `config/menu.config.ts`, `drawer-menu.config.ts`, `brand-content.config.ts` | Nav, drawer, brand slots |
| Types | `types/layout.ts`, `types/footer.ts`, `types/drawer-menu.ts` | Chrome DTOs |
| SSR | `services/server/header.service.server.ts`, `footer.service.server.ts` | Header/footer payload |
| Icons | `components/icons/` | Header/search/cart/USP SVGs |

**Key UI files (Figma / nav updates):**

| File | Role |
|---|---|
| `layout/Header/Header.tsx` | Main header shell |
| `HeaderNavigation.tsx` / `MegaMenu.tsx` / `MobileMenu.tsx` | Nav |
| `HeaderSearch.tsx` / `SearchDrawer.tsx` | Search entry |
| `CartDrawer.tsx` | Mini-cart drawer |
| `PincodeModal.tsx` | Global pincode modal |
| `layout/Footer/Footer.tsx` | Footer shell |
| `layout/BrandContent/` | Brand content blocks |

**Plan globs:** see cross-cutting chrome globs above.

---

## Feature: `product` (PDP + cards)

**Routes:** `src/app/products/[handle]/page.tsx`

| Layer | Path | What exists |
|---|---|---|
| Page | `app/products/[handle]/` | SSR product page entry |
| UI | `components/product/` | PDP layout, gallery, price, variants, pincode, ATC, wishlist, gold/demifine pages |
| UI (gold) | `components/product/gold/` | Gold-specific PDP bits |
| Config / copy | `config/product/` | `product.config.json` + `product.config.ts` messages |
| Types | `types/product.ts`, `types/gold-product-details.ts`, `types/product-filters.ts`, `types/product-listing.ts`, `types/mto-price.ts`, `types/edd.ts` | DTOs / shapes |
| Client service | `services/product.service.ts`, `services/product-transform.ts`, `services/mto-price.service.ts`, `services/pincode.service.ts` | Client fetch / transforms |
| SSR service | `services/server/product.service.server.ts`, `product-page.service.server.ts`, `mto-price.service.server.ts` | Page data |
| Hooks | `hooks/useProducts.ts`, `useMtoPrice.ts`, `usePincode.ts`, `useGoldUspIconIds.ts`, `useProductListingControls.tsx` | Client queries / UI controls |
| Providers | `providers/PincodeProvider.tsx` | Pincode state |
| Constants | `components/product/product.constants.ts` | Local PDP constants |

**Key UI files (Figma / UI updates often land here):**

| File | Role |
|---|---|
| `ProductPageContent.tsx` | PDP composition |
| `DemifineProductPage.tsx` / `GoldProductPage.tsx` | Product-type shells |
| `ProductDetailLayout.tsx` | Layout chrome |
| `ProductGallery.tsx` / `ProductGalleryMobile.tsx` | Media — PDP frames `aspect-square` (PW-619); mobile dots below image (Figma 963:75550); `sellingFastBadge` flag exists, UI deferred until API |
| `ProductHeader.tsx` / `ProductInfo.tsx` | Title / info |
| `PriceBlock.tsx` | Price display |
| `VariantSelector.tsx` (+ color/size selectors) | Variants |
| `PincodeChecker.tsx` / `PincodeDeliveryResult.tsx` | EDD / pincode |
| `AddToCartButton.tsx` / `StickyAddToCartBar.tsx` | ATC |
| `ProductCard*.tsx` | Listing cards |
| `ProductAccordion*.tsx` | PDP accordions |
| `SizeGuide*.tsx` | Size guide sheet |
| `gold/GoldProductPage.tsx` (shell) | Gold PDP entry |
| `gold/GoldProductInfo.tsx` / `GoldProductDetailsContent.tsx` | Gold info blocks |
| `gold/GoldLimitedTimeOffer.tsx` | Gold Limited-time Offer banner (PW-621); flag `goldLimitedTimeOffer` + mock |
| `gold/GoldPriceBreakdown.tsx` | Gold price breakdown |
| `gold/DiamondGuideContent.tsx` | Diamond guide accordion |
| `gold/GoldProductUsp.tsx` | Gold USP row |
| `DemifineProductUsp.tsx` / `ProductUsp.tsx` | Demifine USP |

**Static assets (gold diamond guide):** `public/images/product/diamond-guide/` (colour PNGs, `colour-arrow.svg`)

**Plan globs:**

```text
src/app/products/**, src/components/product/**, src/config/product/**, src/types/product*.ts, src/types/gold*.ts, src/types/mto*.ts, src/types/edd.ts, src/services/product*, src/services/mto*, src/services/pincode*, src/services/server/product*, src/services/server/mto*, src/hooks/useProduct*, src/hooks/useMto*, src/hooks/usePincode*, src/hooks/useGold*
```

---

## Feature: `collection` + product listing

**Routes:** `src/app/collections/[handle]/page.tsx`

| Layer | Path | What exists |
|---|---|---|
| Config | `config/product-listing/` | Empty-state copy, filter toast messages |
| UI | `components/collection/` | Collection page UI |
| UI shared | `components/global/product-listing/` | Shared listing grid/controls (filters, sort, price range) |
| Types | `types/collection.ts`, `types/product-listing.ts`, `types/product-filters.ts` | |
| Services | `services/server/collection*.server.ts` | SSR collection/page data |
| Hooks | `hooks/useCollection.ts`, `useProductListingControls.tsx` | |
| Lib | `lib/utils/product-filters.ts`, `collection-search-params.ts`, `collection-products-query.ts` | Filter transform, URL params, API query |

**Plan globs:**

```text
src/app/collections/**, src/components/collection/**, src/components/global/product-listing/**, src/config/product-listing/**, src/types/collection.ts, src/types/product-listing.ts, src/types/product-filters.ts, src/services/server/collection*, src/hooks/useCollection.ts, src/hooks/useProductListingControls.tsx, src/lib/utils/product-filters.ts, src/lib/utils/collection-search-params.ts, src/components/product/WishlistButton.tsx
```

---

## Feature: `cart`

**Routes:** `app/cart/`, `app/cart/offers/`, `app/cart/gift-cards/`, `app/order-success/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/cart/` (+ `sheets/`, `offers/`, `gift-cards/`) | Cart drawer/page, offers, gift cards |
| Config | `config/cart/` | Messages / cart config |
| Types | `types/cart/` | Cart DTOs |
| Services | `services/cart/` | Client cart API |
| Repositories | `repositories/cart/` | Cart orchestration |
| Hooks | `hooks/cart/useCart.ts`, `useBuyNow.ts`, `useCartStats.ts`, `useCartWalletPayable.ts`, `useProductCartState.ts` | Cart mutations / derived state |
| Providers | `providers/cart/`, `CartProvider.tsx` | Cart context |
| Lib | `lib/cart/` | Pure cart helpers (`club-cart-items`, `gift-wrap`, `format-offer-text`, …) |
| Checkout vendor | `infrastructure/checkout/` (GoKwik), `types/checkout/` | Checkout adapter |
| Wallet | `services/user/wallet.service.ts`, `types/user/wallet.*`, `hooks/user/useWallet.ts`, `hooks/cart/useCartWalletPayable.ts` | Wallet balance + cart payable |
| UI (wallet) | `components/cart/CartWalletToggleRow.tsx`, `CartPriceBreakdown.tsx` | Wallet toggle on cart |
| Store | `store/cart/` | Cart client store |
| Docs | `docs/cart-features.md`, `docs/checkout.md` | Behaviour notes |

**Key UI files:**

| File | Role |
|---|---|
| `CartPageContent.tsx` | Cart page shell |
| `CartItemCard.tsx` | Line item |
| `CartCheckoutSidebar.tsx` / `CartCheckoutBar.tsx` | Checkout CTA |
| `CartWalletToggleRow.tsx` / `CartPriceBreakdown.tsx` | Wallet + totals |
| `sheets/` | Cart drawer sheets |
| `OrderSuccessContent.tsx` | Post-checkout (`app/order-success`) |

**Plan globs:**

```text
src/app/cart/**, src/app/order-success/**, src/components/cart/**, src/config/cart/**, src/config/user/**, src/types/cart/**, src/types/checkout/**, src/types/user/wallet*, src/services/cart/**, src/services/user/wallet*, src/repositories/cart/**, src/hooks/cart/**, src/hooks/useCart.ts, src/hooks/user/useWallet.ts, src/providers/cart/**, src/lib/cart/**, src/store/cart/**, src/infrastructure/checkout/**
```

---

## Feature: `auth` + account

**Routes:** `account/login`, `account/register`, `account` hub + shell panels (`profile`, `order-history`, `orders`, `wishlist`, `wallet`, `delivery-address`, `plan-of-purchase`, `refer-and-earn`, `support`, `how-to-earn`, `how-to-redeem`, `faqs`, `privacy-policy`), `dashboard`

| Layer | Path | What exists |
|---|---|---|
| UI (auth) | `components/auth/` | KwikPass login overlays, mock-auth (dev) |
| UI (account) | `components/account/` | Hub/split layout, profile, orders, wishlist, wallet, delivery address, POP, Others panels (`refer-and-earn`, `support`, `how-to-earn`, `how-to-redeem`, `faqs`, `privacy-policy`) |
| UI (account others) | `components/account/others/` | Verbatim live dumps in document shell (`AccountDocumentShell`, `AccountRichFaqList`, `AccountProseBlocks`) — theme tokens + account-wide responsive width |
| Edge | `middleware.ts` | Protected-route redirect for guest JWT |
| Config | `config/auth/` | Guarded routes, messages (`auth.config.json`) |
| Config (account) | `config/account/` | Feature flags only in `account.config.json` (`features.*.enabled` + `panelId`) — helpers in `account.config.ts` like cart (`isAccountFeatureEnabled` / `isAccountPanelFeatureEnabled`). Verbatim dumps in `content/*.content.json`. Disabled: `referAndEarn` |
| Config (wallet) | `config/wallet/` | Wallet benefits + FAQs |
| Types | `types/auth/`, `types/customer.ts`, `types/user/` | |
| Services | `services/auth/`, `services/user/`, `services/customer.service.ts`, `services/server/auth.service.server.ts` | |
| Repositories | `repositories/auth/` | Token / session orchestration |
| Hooks | `hooks/auth/useAuth.ts`, `hooks/user/` | Session, profile, orders, wallet, addresses |
| Providers | `providers/auth/` | Auth bootstrap |
| Lib | `lib/auth/`, `lib/wallet/` | Cookie/JWT helpers, wallet formatting |
| Identity vendor | `infrastructure/identity/kwikpass/` | KwikPass adapter |
| Docs | `docs/auth-guard.md`, `docs/login-kwikpass-integration.md` | |

**Plan globs:**

```text
src/app/(auth)/**, src/app/account/**, src/app/dashboard/**, src/middleware.ts, src/components/auth/**, src/components/account/**, src/config/auth/**, src/config/account/**, src/config/account/content/**, src/config/user/**, src/config/wallet/**, src/types/auth/**, src/types/user/**, src/types/customer.ts, src/services/auth/**, src/services/user/**, src/services/customer*, src/services/server/auth*, src/repositories/auth/**, src/hooks/auth/**, src/hooks/user/**, src/providers/auth/**, src/lib/auth/**, src/lib/wallet/**, src/infrastructure/identity/**
```

---

## Feature: `wishlist`

**Routes:** `app/wishlist/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/wishlist/` | Wishlist page UI |
| Types | `types/wishlist.ts` | |
| Services | `services/wishlist.service.ts`, `wishlist-transform.ts` | |
| Hooks | `hooks/wishlist/`, `useWishlist.ts`, `useWishlistPage.ts` | |
| Lib | `lib/wishlist/` | |

**Plan globs:**

```text
src/app/wishlist/**, src/components/wishlist/**, src/types/wishlist.ts, src/services/wishlist*, src/hooks/wishlist/**, src/hooks/useWishlist*, src/lib/wishlist/**
```

---

## Feature: `search`

**Routes:** `app/search/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/search/`, `components/layout/HeaderSearch*.tsx` | Search page + header dropdown |
| Config | `config/search/` | History limit, search copy (`searchMessages`) |
| Types | `types/search.ts`, `types/search-suggestions.ts` | |
| Services | `services/search.service.ts`, `services/server/search*.server.ts` | Client + SSR (static suggestions) |
| Hooks | `hooks/useSearch.ts`, `useSearchAutocomplete.ts`, `useSearchHistory.ts` | Live search + auth recent history |

**Plan globs:**

```text
src/app/search/**, src/components/search/**, src/components/layout/HeaderSearch*.tsx, src/config/search/**, src/types/search*.ts, src/services/search*, src/services/server/search*, src/hooks/useSearch*.ts, src/lib/search/**
```

---

## Feature: `cms` + home + static pages

**Routes:** `(marketing)/`, `(cms-pages)/`, `app/pages/[slug]/`, home categories

| Layer | Path | What exists |
|---|---|---|
| UI | `components/cms/` (`builder/`, `shared/`), `components/home/` | CMS sections, home blocks (`HomeCmsPageContent`, `HomePageSkeleton`, `CmsSectionsLoadingSkeleton` for chunk load) |
| Config | `config/cms-pages.config.ts`, `cms-sections.config.ts`, `home-page-categories.config.ts`, `brand-content.config.ts` | |
| Types | `types/cms*.ts`, `types/cms-builder.ts`, `types/cms-page.ts`, `types/cms-section.ts`, `types/cms-slot.ts` | |
| Services | `services/cms.service.ts`, `cms-page.service.ts`, `services/server/cms*.server.ts` | |
| Hooks | `hooks/useCms.ts`, `useCmsAction.ts`, `useCmsPageChunks.ts`, `hooks/home/useHomePageCategoryNavigation.ts` | |
| Providers | `providers/home/HomePageCategoryNavigationProvider.tsx` | Shared home category pending (tabs + bottom nav); scroll-to-top on switch (PW-464); idle/hover `router.prefetch` for inactive categories |

**Plan globs:**

```text
src/app/(marketing)/**, src/app/(cms-pages)/**, src/app/pages/**, src/components/cms/**, src/components/home/**, src/config/cms*, src/config/home*, src/config/brand*, src/types/cms*, src/services/cms*, src/services/server/cms*, src/hooks/useCms*, src/hooks/home/**, src/providers/home/**
```

---

## Feature: `pop` (subscription / plan)

**Routes:** `app/pop/`, `app/pop/my-plan/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/pop/` | POP screens |
| Config | `config/pop.config.ts` | |
| Types | `types/pop/` | |
| Services | `services/pop.service.ts`, `services/server/pop.service.server.ts` | |
| Hooks | `hooks/pop/` | |
| Lib | `lib/pop/` | |

**Plan globs:**

```text
src/app/pop/**, src/components/pop/**, src/config/pop*, src/types/pop/**, src/services/pop*, src/services/server/pop*, src/hooks/pop/**, src/lib/pop/**
```

---

## Feature: `blog`

**Routes:** `app/blogs/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/blog/` | Blog list/article UI |
| Types | `types/blog.ts` | |
| Services | `services/blog.service.ts`, `blog-transform.ts`, `services/server/blog.service.server.ts` | |
| Hooks | `hooks/useBlog.ts`, `useBlogArticles.ts` | |

**Plan globs:**

```text
src/app/blogs/**, src/components/blog/**, src/types/blog.ts, src/services/blog*, src/services/server/blog*, src/hooks/useBlog*
```

---

## Feature: `stores`

**Routes:** `app/palmonas-stores/`

| Layer | Path | What exists |
|---|---|---|
| UI | `components/stores/` | Store locator UI |
| Types | `types/store.ts` | |
| Services | `services/store.service.ts`, `services/server/store.service.server.ts` | OMS-backed |
| Hooks | `hooks/useStores.ts` | |
| API client | `lib/oms-api.ts` | OMS base URL |

**Plan globs:**

```text
src/app/palmonas-stores/**, src/components/stores/**, src/types/store.ts, src/services/store*, src/services/server/store*, src/hooks/useStores.ts, src/lib/oms-api.ts
```

---

## Feature: marketing / content (lighter)

| Feature | Routes | UI | Config | Notes |
|---|---|---|---|---|
| `about` | `(marketing)/about` | `components/about/` | `config/about.config.ts` | Mostly static/config-driven |
| `contact` | `contact-us` | `components/contact/` | `config/contact.config.ts` | |
| `careers` | `careers` | `components/careers/` | `config/careers.config.ts`, `lib/careers/`, `services/careers.service.ts`, `hooks/useCareerApplication.ts` | Form submit path |
| `faqs` | `pages/faqs` | `components/faqs/` | `config/faqs/` | |
| `emily-in-paris` | `emily-in-paris` | `components/emily-in-paris/` | `config/emily-in-paris.config.ts` | Campaign |
| `shraddhas-favourite` | `shraddhas-favourite` | `components/shraddhas-favourite/` | `config/shraddhas-favourite.config.ts` | Campaign |
| `seo` | — | `components/seo/` | `lib/seo/` | Shared SEO UI/helpers |

---

## How Agent should use this file

1. Find feature key from the route table.
2. Open that section — copy **Plan globs**.
3. For Figma UI: prefer **Key UI files** (product) or the UI folder listed.
4. Only then read files. Do not `find src` from root.

When something is missing from this index, add one row — do not re-explore the whole tree to rediscover it next time.
