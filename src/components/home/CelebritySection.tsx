import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

const looks = [
  {
    href: '/collections/date-night',
    label: 'Date night',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-029.jpg?v=1744528599',
  },
  {
    href: '/collections/office-wear',
    label: 'Office wear',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-035.jpg?v=1744528574',
  },
  {
    href: '/collections/vacay-mode',
    label: 'Vacay mode',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/RG095.jpg?v=1744527670',
  },
  {
    href: '/collections/party-wear',
    label: 'Party wear',
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/RG151_49b40051-551f-4f17-9d8c-2b5014e41fde.jpg?v=1744527078',
  },
] as const;

export function CelebritySection() {
  return (
    <section className="tab:py-14 bg-stone-950 py-8 text-white">
      <div className="container">
        <div className="text-center">
          <p className="tracking-palmonas-wider text-xs font-semibold text-amber-200 uppercase">
            Style stories
          </p>
          <h2 className="font-eb-garamond mt-1 text-4xl leading-none">
            Looks made for your camera roll
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-stone-300">
            Build the reference-inspired long scroll with occasion-led edits and easy shopping.
          </p>
        </div>
        <div className="tab:grid-cols-4 mt-6 grid grid-cols-2 gap-3">
          {looks.map((look) => (
            <AppLink
              key={look.href}
              href={look.href}
              className="group rounded-palmonas-lg overflow-hidden bg-white/10"
            >
              <Image
                src={look.image}
                alt=""
                width={360}
                height={480}
                sizes="(min-width: 768px) 25vw, 50vw"
                className="aspect-[3/4] w-full object-cover opacity-90 transition group-hover:opacity-100"
              />
              <span className="block p-3 text-sm font-medium">{look.label}</span>
            </AppLink>
          ))}
        </div>
        <div className="mt-8 rounded-[28px] border border-white/10 p-5 text-center">
          <p className="font-eb-garamond text-3xl leading-none">Still browsing?</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-stone-300">
            Start with our bestselling rings, bracelets, and giftable everyday pieces.
          </p>
          <AppLink
            href={resolveCollectionPagePath('best-sellers')}
            className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-stone-950"
          >
            Shop Bestsellers
          </AppLink>
        </div>
      </div>
    </section>
  );
}
