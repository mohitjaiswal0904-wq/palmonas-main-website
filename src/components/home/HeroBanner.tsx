import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';

const categoryLinks = [
  {
    href: '/collections/rings',
    label: 'Rings',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-041.jpg?v=1744528549',
  },
  {
    href: '/collections/bracelets',
    label: 'Bracelets',
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/image_1d061912-76a4-4220-9bbb-475da1ede948.jpg?v=1768828558',
  },
  {
    href: '/collections/stud-earrings',
    label: 'Earrings',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PMWSSER296-G-1.jpg?v=1744518236',
  },
  {
    href: '/collections/necklaces',
    label: 'Necklaces',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/LR018_3_0040.jpg?v=1744517970',
  },
] as const;

export function HeroBanner() {
  return (
    <section className="bg-[#fbf2ed]">
      <div className="tab:min-h-[640px] relative min-h-[560px] overflow-hidden bg-stone-200">
        <Image
          src="https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-002.jpg?v=1744529185"
          alt="Palmonas jewellery campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
        <div className="tab:min-h-[640px] relative container flex min-h-[560px] items-end pb-8">
          <div className="rounded-palmonas-lg shadow-palmonas-medium max-w-sm bg-white/90 p-5 text-center">
            <p className="tracking-palmonas-wider text-xs font-semibold text-amber-800 uppercase">
              New season edit
            </p>
            <h1 className="font-eb-garamond mt-2 text-4xl leading-none text-stone-950">
              Everyday luxury that never waits for an occasion
            </h1>
            <p className="mt-3 text-sm text-stone-700">
              Waterproof, anti-tarnish jewellery for workdays, weddings, and everything between.
            </p>
            <AppLink
              href="/collections/rings"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-stone-950 px-6 text-sm font-medium text-white"
            >
              Shop Now
            </AppLink>
          </div>
        </div>
      </div>
      <nav aria-label="Featured categories" className="container -mt-9 grid grid-cols-4 gap-2 pb-5">
        {categoryLinks.map((item) => (
          <AppLink
            key={item.href}
            href={item.href}
            className="rounded-palmonas-md shadow-palmonas-soft bg-white p-2 text-center"
          >
            <Image
              src={item.image}
              alt=""
              width={160}
              height={160}
              sizes="25vw"
              className="rounded-palmonas-sm mx-auto aspect-square w-full object-cover"
            />
            <span className="mt-2 block text-[11px] font-medium text-stone-800">{item.label}</span>
          </AppLink>
        ))}
      </nav>
    </section>
  );
}
