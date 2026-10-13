"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { PanelHeader } from "../ui";

export default function WishlistSection({ onExit }: { onExit: () => void }) {
  const { items, count } = useWishlist();

  return (
    <div>
      <PanelHeader title="Your Wishlist" onBack={onExit} />
      {count === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-base font-medium text-[#151515]">
            Your wishlist is empty
          </p>
          <p className="-mt-2 text-sm text-[#8a8a8a]">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/collection"
            className="rounded-lg bg-[#151515] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
