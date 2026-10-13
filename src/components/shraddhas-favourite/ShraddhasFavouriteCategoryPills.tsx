import Image from 'next/image';
import Link from 'next/link';

import { shraddhasFavouriteCategories } from '@/config/shraddhas-favourite.config';

export function ShraddhasFavouriteCategoryPills() {
  return (
    <section aria-label="Shop by category" className="tab:py-10 laptop:py-12 w-full py-8">
      <div className="tab:gap-3 laptop:gap-4 grid w-full grid-cols-4 gap-2" role="list">
        {shraddhasFavouriteCategories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
            role="listitem"
            aria-label={`Shop ${category.label}`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#f8e4e9]">
              <Image
                src={category.imageSrc}
                alt={category.imageAlt}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-nunito-sans tab:py-4 tab:text-base py-3 text-center text-sm leading-normal font-normal text-[#151515]">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
