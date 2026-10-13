import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';

const fineGoldCards = [
  {
    title: 'Lab grown diamonds',
    text: 'Real sparkle with a lighter footprint.',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/LR018_3_0040.jpg?v=1744517970',
  },
  {
    title: '925 silver',
    text: 'Everyday pieces with premium plating.',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-016.jpg?v=1744529146',
  },
] as const;

export function FineGoldSection() {
  return (
    <section className="tab:py-14 bg-[#fbf8f2] py-8">
      <div className="container">
        <div className="relative overflow-hidden rounded-[28px] bg-stone-100">
          <Image
            src="https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Ring-041_365f5490-9342-4554-b6fa-2cf5a47da13d.jpg?v=1744528549"
            alt=""
            width={1200}
            height={700}
            sizes="100vw"
            className="tab:h-[440px] h-80 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="tab:p-10 absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="tracking-palmonas-wider text-xs font-semibold uppercase">
              Fine jewellery
            </p>
            <h2 className="font-eb-garamond tab:text-5xl mt-2 max-w-md text-4xl leading-none">
              Made to shine every single day
            </h2>
            <AppLink
              href="/collections/fine-gold"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-stone-950"
            >
              Shop Fine Gold
            </AppLink>
          </div>
        </div>
        <div className="tab:grid-cols-2 mt-4 grid gap-3">
          {fineGoldCards.map((card) => (
            <article
              key={card.title}
              className="rounded-palmonas-lg shadow-palmonas-soft grid grid-cols-[112px_1fr] overflow-hidden bg-white"
            >
              <Image
                src={card.image}
                alt=""
                width={224}
                height={256}
                sizes="112px"
                className="h-full min-h-32 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-eb-garamond text-2xl text-stone-950">{card.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
