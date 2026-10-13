import { ProductGalleryMobile } from '@/components/product/ProductGalleryMobile';
import type { Product } from '@/types/product';

interface ProductGalleryProps {
  product: Product;
}

function getGalleryImages(product: Product): string[] {
  if (product.images.length > 0) {
    return product.images;
  }

  return product.image ? [product.image] : [];
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = getGalleryImages(product);

  if (images.length === 0) {
    return (
      <section aria-label={`${product.name} gallery`}>
        <div className="aspect-square bg-stone-100" />
      </section>
    );
  }

  return (
    <section
      aria-label={`${product.name} gallery`}
      className="laptop:absolute laptop:inset-0 laptop:overflow-y-auto scrollbar-hide min-w-0"
    >
      <ProductGalleryMobile
        images={images}
        productName={product.name}
        productHandle={product.handle}
      />
    </section>
  );
}
