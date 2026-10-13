import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';

const categories = [
  {
    href: '/collections/rings',
    title: 'Rings',
    subtitle: 'Stackable, solitaire, statement',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/collections/022s01.jpg?v=1709008653',
  },
  {
    href: '/collections/stud-earrings',
    title: 'Earrings',
    subtitle: 'Studs, hoops, everyday sparkle',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PMWSSER296-G-1.jpg?v=1744518236',
  },
  {
    href: '/collections/bracelets',
    title: 'Bracelets',
    subtitle: 'Minimal links and charms',
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/01_e869a853-ae2b-4543-8f22-61455b80f6a6.webp?v=1744528231',
  },
  {
    href: '/collections/gifts',
    title: 'Gifting',
    subtitle: 'Ready-to-love favourites',
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/look_2_sq1_b88a5567-9f8a-40ab-aa36-e6301c8bc8d8.webp?v=1744527051',
  },
] as const;

const promises = ['Anti-tarnish', 'Waterproof', 'Skin safe', 'Made in India'] as const;

export function CategoryTiles() {
  return (
    <section className="py2 container">
      <div className="text-center">
        <p className="tracking-palmonas-wider text-xs font-semibold text-amber-800 uppercase">
          Shop by category
        </p>
        <h2 className="font-eb-garamond tab:text-4xl mt-1 text-3xl text-stone-950">
          Jewellery for every mood
        </h2>
      </div>
      <div className="tab:grid-cols-4 mt-5 grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <AppLink
            key={category.href}
            href={category.href}
            className="group rounded-palmonas-lg shadow-palmonas-soft overflow-hidden bg-stone-50"
          >
            <Image
              src={category.image}
              alt=""
              width={400}
              height={500}
              sizes="(min-width: 768px) 25vw, 50vw"
              className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="p-3">
              <h3 className="font-medium text-stone-950">{category.title}</h3>
              <p className="mt-1 text-xs text-stone-600">{category.subtitle}</p>
            </div>
          </AppLink>
        ))}
      </div>
      <div className="rounded-palmonas-lg mt-6 grid grid-cols-4 divide-x divide-stone-200 bg-[#f8f1ec] py-4">
        {promises.map((promise) => (
          <div key={promise} className="px-2 text-center">
            <span
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs"
              aria-hidden="true"
            >
              OK
            </span>
            <p className="mt-2 text-[11px] font-medium text-stone-700">{promise}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
