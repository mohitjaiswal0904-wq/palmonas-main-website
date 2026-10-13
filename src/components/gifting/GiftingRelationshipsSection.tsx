import Image from 'next/image';
import Link from 'next/link';

import { GIFTING_RELATIONSHIPS } from '@/config/gifting/gifting.config';

/**
 * For Her / Him / Friend relationship gift cards (complete mobile + desktop artwork).
 */
export function GiftingRelationshipsSection() {
  return (
    <section className="tab:px-6 bg-[#FFF6E866] px-4 py-4" aria-labelledby="relationships-heading">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 text-center">
          <h2
            id="relationships-heading"
            className="font-nunito-sans tab:text-2xl text-xl font-semibold text-[#151515]"
          >
            {GIFTING_RELATIONSHIPS.titlePrefix}{' '}
            <span className="text-[#C9A227]">{GIFTING_RELATIONSHIPS.titleHighlight}</span>
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">{GIFTING_RELATIONSHIPS.subtitle}</p>
        </div>

        <ul className="tab:gap-5 grid grid-cols-3 gap-1">
          {GIFTING_RELATIONSHIPS.cards.map((card) => (
            <li key={card.id}>
              <Link href={card.href} aria-label={`Shop ${card.title}`} className="block w-full">
                <Image
                  src={card.mobileImageSrc}
                  alt={card.imageAlt}
                  width={208}
                  height={365}
                  className="tab:hidden h-auto w-full"
                  sizes="33vw"
                />
                <Image
                  src={card.desktopImageSrc}
                  alt=""
                  width={320}
                  height={420}
                  className="tab:block hidden h-auto w-full"
                  sizes="220px"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
