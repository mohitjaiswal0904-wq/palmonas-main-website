import { ProductCarousel } from '@/components/global/product-listing';
import { ShraddhasFavouriteSectionHeading } from '@/components/shraddhas-favourite/ShraddhasFavouriteSectionHeading';
import { SHRADDHAS_FAVOURITE_SECTION_CLASS } from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import type { Product } from '@/types/product';

interface ShraddhasFavouriteSignatureStylesProps {
  products: Product[];
}

export function ShraddhasFavouriteSignatureStyles({
  products,
}: ShraddhasFavouriteSignatureStylesProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-label="Shraddha's signature styles" className={SHRADDHAS_FAVOURITE_SECTION_CLASS}>
      <ShraddhasFavouriteSectionHeading title="Shraddha's Signature Styles" />
      <ProductCarousel
        products={products}
        ariaLabel="Shraddha's signature styles"
        className="tab:mt-8 mt-6"
        itemClassName="w-[49.9vw] tab:w-[25vw] laptop:w-[19vw]"
      />
    </section>
  );
}
