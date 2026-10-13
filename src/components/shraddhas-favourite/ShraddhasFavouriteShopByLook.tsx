import { ShraddhasFavouriteSectionHeading } from '@/components/shraddhas-favourite/ShraddhasFavouriteSectionHeading';
import { ShraddhasFavouriteShopByLookCard } from '@/components/shraddhas-favourite/ShraddhasFavouriteShopByLookCard';
import { SHRADDHAS_FAVOURITE_SECTION_CLASS } from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import type { Product } from '@/types/product';

interface ShraddhasFavouriteShopByLookProps {
  products: Product[];
}

const SHOP_BY_LOOK_CAROUSEL_CLASS = [
  'mt-6 flex gap-4 overflow-x-auto pb-2',
  'snap-x snap-mandatory scroll-smooth',
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  'tab:hidden',
].join(' ');

const SHOP_BY_LOOK_GRID_CLASS = [
  'mt-6 hidden gap-4',
  'tab:mt-8 tab:grid tab:grid-cols-2 tab:gap-5',
  'laptop:grid-cols-4 laptop:gap-6',
].join(' ');

export function ShraddhasFavouriteShopByLook({ products }: ShraddhasFavouriteShopByLookProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-label="Shop by look" className={SHRADDHAS_FAVOURITE_SECTION_CLASS}>
      <ShraddhasFavouriteSectionHeading title="Shop by Look" />

      <div
        className={SHOP_BY_LOOK_CAROUSEL_CLASS}
        role="region"
        aria-label="Shop by look carousel"
        tabIndex={0}
      >
        <div className="flex w-max gap-4" role="list">
          {products.map((product) => (
            <ShraddhasFavouriteShopByLookCard
              key={product.id}
              product={product}
              className="w-[78vw] max-w-[300px] shrink-0 snap-start"
            />
          ))}
        </div>
      </div>

      <div className={SHOP_BY_LOOK_GRID_CLASS} role="list">
        {products.map((product) => (
          <ShraddhasFavouriteShopByLookCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
