import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';

const recipients = [
  {
    href: '/collections/gifts-for-her',
    label: 'For Her',
    image:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-023_a7ab9814-705e-44ff-b0c8-2235e5690718.jpg?v=1769061990',
  },
  {
    href: '/collections/gifts-for-him',
    label: 'For Him',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PMMSSRG607-S-6.jpg?v=1744515814',
  },
  {
    href: '/collections/couple-rings',
    label: 'For Couples',
    image: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-002.jpg?v=1744529185',
  },
] as const;

export function RecipientSection() {
  return (
    <section className="tab:py-14 container py-8">
      <div className="overflow-hidden rounded-[28px] bg-[#f3e6dd]">
        <div className="tab:grid-cols-[1.1fr_0.9fr] grid">
          <div className="tab:p-10 p-6">
            <p className="tracking-palmonas-wider text-xs font-semibold text-amber-900 uppercase">
              Gift edit
            </p>
            <h2 className="font-eb-garamond mt-2 text-4xl leading-none text-stone-950">
              Thoughtful gifts, minus the guesswork
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-700">
              Shop anti-tarnish favourites by recipient, occasion, and everyday style.
            </p>
            <AppLink
              href="/collections/gifts"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-stone-950 px-5 text-sm font-medium text-white"
            >
              Explore Gifts
            </AppLink>
          </div>
          <div className="tab:p-4 grid grid-cols-3 gap-2 p-3">
            {recipients.map((recipient) => (
              <AppLink
                key={recipient.href}
                href={recipient.href}
                className="rounded-palmonas-lg relative min-h-40 overflow-hidden"
              >
                <Image
                  src={recipient.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 16vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-center text-[11px] font-semibold">
                  {recipient.label}
                </span>
              </AppLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
