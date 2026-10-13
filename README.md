# Palmonas Main Website

Next.js 16 · TypeScript · TanStack Query · Axios · Zustand · Tailwind CSS v4

## Stack

- **Next.js 16** — App Router, Turbopack, React Compiler, Cache Components
- **TanStack Query** — client data fetching
- **Axios** — external API client (no Next.js API routes)
- **Zustand** — UI state
- **Jest + Testing Library** — unit/component tests
- **Husky + lint-staged + commitlint** — git hooks

## Architecture

```
External APIs → services/ → hooks/ → components & app/
```

| Layer | Path | Purpose |
|---|---|---|
| Types | `src/types/` | API shapes, Zod DTOs, transforms |
| Services | `src/services/` | Client-side API calls + error normalisation |
| Server services | `src/services/server/` | Server Component API calls |
| Hooks | `src/hooks/` | TanStack Query + utility hooks |
| Components | `src/components/` | UI, layout, SEO |
| App | `src/app/` | Routes, metadata, sitemap |

See `.cursor/rules/architecture.mdc` for full rules.

## Getting started

```bash
pnpm install
cp .env.example .env.development   # then fill in values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm type-check   # TypeScript
pnpm lint         # ESLint (0 warnings)
pnpm test         # Jest (fast, no coverage table)
pnpm test:coverage # Jest + layer/feature coverage report (WARN below 90%)
pnpm test:ci      # Jest with coverage (CI)
pnpm format       # Prettier
```

## Environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_DEV=https://app-backend.palmonas.tech
NEXT_PUBLIC_API_PROD=https://app-backend.palmonas.tech
AUTH_SECRET=your-secret
```

## Breakpoints (mobile-first)

| Prefix | Min width |
|---|---|
| default | 0px |
| `mini-mobile:` | 320px |
| `mobile:` | 480px |
| `tab:` | 768px |
| `laptop:` | 1024px |
| `desktop:` | 1280px |

## Fonts

- **Sans/display** — system stack (`-apple-system` renders SF Pro on Apple devices)
- **Serif** — EB Garamond via `next/font`
- Drop licensed SF Pro `.woff2` files into `public/fonts/` when available
