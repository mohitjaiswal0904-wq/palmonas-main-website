# Demifine Landing Page

Documentation for the Demifine landing page, built from the Figma design
([Demifine.com, node `1:3`](https://www.figma.com/design/HKUYh67CYzGPixMHy3ohBz/Demifine.com?node-id=1-3)).

## Location

| Item | Path |
| --- | --- |
| Page component | `src/app/(demifine)/demifine/page.tsx` |
| Route | `/demifine` |
| Assets | `public/demifine/` |

## Tech stack

- **Next.js 16** (App Router, React 19, React Compiler enabled)
- **Tailwind CSS v4** (`@import "tailwindcss"` in `src/app/globals.css`)
- **`next/font/google`** — body type is **Nunito Sans** (loaded locally in the page via the `--font-nunito` CSS variable)
- **`next/image`** for all imagery

The page is a single server component. All content is defined as typed data arrays at the top of the file and rendered through `.map(...)`, so copy and lists can be edited without touching markup.

## Page sections (top → bottom)

| # | Section | Notes |
| --- | --- | --- |
| 1 | Announcement bar | Black strip: "Everyday Demi-Fine Jewellery — Skin Safe, Waterproof & Made to Last" |
| 2 | Header | Sticky, `DEMIFINE ✦` wordmark + nav links to `/gold`, `/silver`, `/` |
| 3 | Hero | Full-width image with a left→right black gradient overlay and headline |
| 4 | About the Brand | "What is Demifine Jewellery?" intro + "The gap we fill" two-column text/image |
| 5 | Value cards | 3 cards: *What it means / Who it's for / What we promise* |
| 6 | Craftsmanship | Image + 4 material points (`craftPoints`) |
| 7 | Trust badges | 3 badges with SVG icons (`trustBadges`) |
| 8 | How Demifine is Made | 4-step process (`steps`) |
| 9 | Meet the Founders | Image, pull quote, founder credits (`founders`) |
| 10 | Our Products | Category grid (`categories`) — see responsive layout below |
| 11 | SEO copy | Headings, paragraphs, materials list |
| 12 | FAQs | Interactive accordion using native `<details>` (`faqs`) |
| 13 | Footer | Newsletter, company info, link columns (`footerColumns`), socials, app-download box, payments, Popular Searches (`popularSearches`) |

## Responsive behavior

- **Product category grid**: `grid-cols-2` on phones (2×3) and `lg:grid-cols-6` on desktop (single 1×6 row). Tiles are `aspect-square w-full` capped at `max-w-[197px]`.
- Two-column content sections (gap / craftsmanship / founders) collapse to a single column below the `lg` breakpoint.
- Header nav links are hidden below `lg`.

## Data arrays (edit copy here)

All defined at the top of `page.tsx`:

- `valueCards` — the 3 brand-value cards
- `craftPoints` — the 4 craftsmanship points
- `trustBadges` — badge `{ icon, title, body }`
- `steps` — the "How it's made" steps
- `founders` — `{ name, role }`
- `categories` — `{ name, image }`
- `faqs` — `{ q, a }` for the accordion
- `footerColumns` — footer link groups
- `popularSearches` — `{ label, links }` rows

## Assets

Images were exported (flattened) from Figma into `public/demifine/` so the page
does not depend on Figma's temporary asset URLs.

| File | Used in |
| --- | --- |
| `hero.jpg` | Hero |
| `gap.jpg` | "The gap we fill" |
| `craftsmanship.jpg` | Craftsmanship |
| `founders.jpg` | Meet the Founders |
| `cat-rings.png`, `cat-bracelets.png`, `cat-mens.png`, `cat-earrings.png`, `cat-mangalsutras.png`, `cat-necklaces.png` | Product category grid |
| `icon-delivery.svg`, `icon-skinsafe.svg`, `icon-gold.svg` | Trust badges |

## Design tokens

| Purpose | Value |
| --- | --- |
| Gold accent | `#b8956a` |
| Heading text | `#111` / `#151515` |
| Body / muted text | `#555` / `#6c6c6c` |
| Card background | `#fbfbfa` |
| Card / divider border | `#e5e4e0` |
| Founders section background | `#fffefa` |
| App-download box | `#ffe3e3` |
| Link blue | `#06c` |
| Founders divider | `#fadfbb` |

## Known placeholders

These were brand/third-party image assets in Figma and are rendered as styled
labels/buttons rather than real logos. Swap in real images when available:

- App Store / Google Play download buttons (footer)
- Payment method logos: GPay, Mastercard, PayPal, Visa (footer)
- Social icons: IG, FB, YT, X (footer)

## Local development

```bash
pnpm run dev
# open http://localhost:3000/demifine
```
