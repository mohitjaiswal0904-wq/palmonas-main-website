import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

/**
 * Edge-to-edge horizontal carousel of product cards. The first card sits flush
 * with the left edge (no leading padding) and the row scrolls horizontally with
 * a hidden scrollbar. Used by the home / gold / silver / demi-fine showcase
 * sections (which pad their content with `px-4 sm:px-8`, cancelled here).
 */
export default function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max border-y border-black/10">
        {products.map((product, i) => (
          <div
            key={product.id}
            className={`w-[43vw] shrink-0 sm:w-[264px] lg:w-[288px] ${
              i !== 0 ? "border-l border-black/10" : ""
            }`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
