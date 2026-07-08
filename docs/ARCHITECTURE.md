# Project structure

Palmonas main website — Next.js App Router (Next 16).

## Directory layout

```
src/
├── app/                    # Routes only: metadata, thin page wrappers, layouts
│   ├── layout.tsx          # Root shell (Header, CategoryTabs, BottomNav)
│   ├── page.tsx            # Home (/)
│   ├── (home)/             # Marketing landing pages
│   │   ├── layout.tsx      # Shared Footer for /gold, /silver, /demifine, /new-arrivals
│   │   ├── gold/
│   │   ├── silver/
│   │   ├── demifine/
│   │   └── new-arrivals/
│   └── (core)/             # Commerce pages (cart, collection, product, …)
│
├── features/               # Page-level UI grouped by domain
│   ├── home/
│   ├── new-arrivals/
│   │   ├── components/     # Section components for this page only
│   │   ├── data/           # Static content & config
│   │   └── constants/      # Page-specific tokens (fonts, etc.)
│   ├── demifine/
│   ├── gold/
│   └── silver/
│
├── components/             # Shared, reusable UI
│   ├── layout/             # Header, Footer, BottomNav, CategoryTabs
│   ├── ui/                 # Design-system primitives (SectionHeading, ViewAllButton, …)
│   ├── product/            # ProductCard, carousels, PDP pieces
│   ├── collection/
│   ├── cart/
│   ├── profile/
│   └── …
│
├── lib/                    # Pure utilities & API clients
├── hooks/                  # Zustand-backed data hooks
├── stores/                 # Zustand stores
├── services/               # API service layer
├── types/                  # Shared TypeScript types
├── constants/              # Navigation, mega-menu, static config
├── data/                   # Mock/static content (products, footer, SEO)
├── providers/
└── styles/
    └── globals.css
```

## Conventions

| Layer | Responsibility |
|-------|----------------|
| `app/**/page.tsx` | Route entry, SEO metadata, compose feature page |
| `features/*/` | Full landing-page UI + page-specific components/data |
| `components/` | Cross-page reusable building blocks |
| `data/` | Static/mock content shared across features |
| `lib/` | Formatters, adapters, fetch clients — no JSX |

## Import aliases

- `@/` → `src/`
- Prefer `@/features/...` for page implementations
- Prefer `@/components/ui/...` for shared primitives

## Adding a new marketing page

1. Create `src/features/{name}/` with page component + `data/content.ts`
2. Add `src/app/(home)/{name}/page.tsx` with metadata + import
3. Footer is included automatically via `(home)/layout.tsx`
