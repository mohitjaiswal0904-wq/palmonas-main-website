"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/cn";
import { parsePrice } from "@/lib/format";
import { productHref } from "@/lib/product";
import AnimatedBadge from "@/components/product/AnimatedBadge";
import type { Product } from "@/types/product";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="#f5b301"
      aria-hidden
    >
      <path d="m12 2 2.9 6.26L21.5 9.2l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.16L2.5 9.2l6.6-.94L12 2Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? "#e0517a" : "none"}
      stroke={filled ? "#e0517a" : "#151515"}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

const metalColors: Record<string, string> = {
  "Rose Gold": "#e7b3a3",
  "Yellow Gold": "#e9c46a",
  "White Gold": "#dfe2e6",
  Silver: "#c0c4c8",
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wishlisted = has(product.id);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: parsePrice(product.price),
      mrp: parsePrice(product.mrp),
      colour: product.metals[0],
    });
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  };

  const href = productHref(product);

  return (
    <div className="group flex flex-col gap-3 bg-white pb-4 sm:gap-6 sm:pb-6">
      {/* Image */}
      <Link
        href={href}
        aria-label={product.title}
        className="relative block aspect-[368/490] w-full overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Bestseller / fast-delivery badge (animated swap) */}
        {product.badge ? (
          <AnimatedBadge bestseller={product.badge} className="absolute left-1.5 top-2" />
        ) : null}

        {/* Wishlist */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute right-3 top-3 transition-transform hover:scale-110"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Metal dots */}
        <div className="absolute bottom-3 left-3 flex items-center">
          {product.metals.map((metal, i) => (
            <span
              key={metal}
              className="size-4 rounded-full border border-white"
              style={{
                background: metalColors[metal] ?? "#ccc",
                marginLeft: i === 0 ? 0 : -6,
                zIndex: product.metals.length - i,
              }}
              title={metal}
            />
          ))}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-white px-2 py-1 shadow-sm">
          <span className="text-xs tracking-wide text-[#151515] sm:text-sm">
            {product.rating}
          </span>
          <StarIcon />
          <span className="text-xs tracking-wide text-[#151515] sm:text-sm">
            |{product.reviews}
          </span>
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-col gap-2.5 px-3 sm:gap-5 sm:px-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-col gap-1.5 sm:gap-3">
            <div className="flex min-w-0 flex-nowrap items-baseline gap-x-1.5">
              <p className="whitespace-nowrap text-base font-bold text-[#151515] sm:text-xl">
                {product.price}
              </p>
              <p className="whitespace-nowrap text-xs font-normal text-[#828282] line-through sm:text-lg">
                {product.mrp}
              </p>
            </div>
            <p className="text-[11px] leading-tight sm:text-[15px]">
              <span className="font-semibold text-[#008236]">
                {product.discount}{" "}
              </span>
              <span className="font-normal text-[#898989]">
                + {product.extraOffers} more
              </span>
            </p>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            aria-label={added ? "Added to cart" : "Add to cart"}
            onClick={handleAddToCart}
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-[1.4px] transition-colors sm:size-10 ${
              added
                ? "border-[#008236] bg-[#008236] text-white"
                : "border-[#151515] text-[#151515] hover:bg-[#151515] hover:text-white"
            }`}
          >
            {added ? <CheckIcon /> : <PlusIcon />}
          </button>
        </div>

        <Link
          href={href}
          title={product.title}
          className="block w-full truncate text-left text-sm capitalize leading-snug text-[#1f1f1f] transition-colors hover:text-black hover:underline sm:text-base"
        >
          {product.title}
        </Link>
      </div>
    </div>
  );
}
