import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import { formatPrice } from '@/lib/format-price';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

const products = [
  {
    href: '/products/7670886924545',
    name: 'Cross-Over Stones Ring',
    category: 'Rings',
    price: 2903,
    compareAtPrice: 4147,
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-041.jpg?v=1744528549',
  },
  {
    href: '/products/7782826115329',
    name: 'Dainty Solitaire Ring',
    category: 'Rings',
    price: 2032,
    compareAtPrice: 2438,
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/products/01_2aa47a63-6c8f-4bbe-8e5b-ee11e027a449.jpg?v=1744528066',
  },
  {
    href: '/products/7759111586049',
    name: 'Hearts All Over Bracelet',
    category: 'Bracelets',
    price: 2229,
    compareAtPrice: 2674,
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/01_e869a853-ae2b-4543-8f22-61455b80f6a6.webp?v=1744528231',
  },
  {
    href: '/products/8670501863681',
    name: 'Dewdrop Delight Studs',
    category: 'Earrings',
    price: 3360,
    compareAtPrice: 4032,
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PMWSSER296-G-1.jpg?v=1744518236',
  },
] as const;

const tabs = ['Bestsellers', 'New In', 'Rings', 'Gifting'] as const;

export function TopStylesTabs() {
  return (
    <section className="tab:py-14 bg-white py-8">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="tracking-palmonas-wider text-xs font-semibold text-amber-800 uppercase">
              Trending now
            </p>
            <h2 className="font-eb-garamond tab:text-4xl mt-1 text-3xl text-stone-950">
              Top styles
            </h2>
          </div>
          <AppLink
            href={resolveCollectionPagePath('best-sellers')}
            className="text-sm font-medium text-stone-800"
          >
            View all
          </AppLink>
        </div>
        <div
          className={cn('mt-4 flex gap-2 overflow-x-auto pb-1', HORIZONTAL_SCROLL_PASS_VERTICAL)}
          role="tablist"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
                index === 0 ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-700'
              }`}
              aria-selected={index === 0}
              role="tab"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tab:grid-cols-4 mt-5 grid grid-cols-2 gap-3">
          {products.map((product) => (
            <article key={product.href} className="rounded-palmonas-lg bg-white">
              <AppLink href={product.href} aria-label={`View ${product.name}`} className="block">
                <div className="rounded-palmonas-lg relative overflow-hidden bg-stone-100">
                  <Image
                    src={product.image}
                    alt=""
                    width={360}
                    height={480}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium">
                    Bestseller
                  </span>
                </div>
                <p className="mt-2 text-[11px] tracking-wide text-stone-500 uppercase">
                  {product.category}
                </p>
                <h3 className="line-clamp-2 text-sm font-medium text-stone-950">{product.name}</h3>
              </AppLink>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
