"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCarousel from "@/components/product/ProductCarousel";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProduct } from "@/hooks/useProduct";
import { parsePrice } from "@/lib/format";
import { themeForCollection } from "@/lib/product";
import { makeProducts } from "@/data/products";
import { fmtINR } from "@/lib/adapters";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type Query = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const RING_SIZES = ["7", "8", "9", "10"];

const GALLERY_FILLERS = [
  "/demifine/cat-rings.png",
  "/demifine/cat-earrings.png",
  "/demifine/cat-necklaces.png",
  "/demifine/cat-bracelets.png",
];

const USPS = [
  { icon: "/demifine/icon-delivery.svg", label: "Free Delivery" },
  { icon: "/demifine/icon-skinsafe.svg", label: "Skin Safe Jewellery" },
  { icon: "/demifine/icon-gold.svg", label: "18K Gold Tone Plated" },
];

const ACCORDIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Description",
    body: (
      <p>
        A sculptural everyday piece finished in 18K gold tone plating. The twist
        cross cage silhouette catches the light from every angle while staying
        anti-tarnish and skin safe — made to be worn from AM to PM.
      </p>
    ),
  },
  {
    title: "Specifications",
    body: (
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
        {[
          ["Metal", "Brass, 18K Gold Tone Plated"],
          ["Finish", "Anti-Tarnish"],
          ["Stone", "Cubic Zirconia"],
          ["Weight", "4.2 g"],
          ["Closure", "Adjustable"],
          ["Care", "Avoid water & perfume"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-[#8a8a8a]">{k}</dt>
            <dd className="text-[#151515]">{v}</dd>
          </div>
        ))}
      </dl>
    ),
  },
  {
    title: "Supplier Information",
    body: (
      <p>
        Marketed by Palmonas Lifestyle Pvt. Ltd., Pune, Maharashtra — 411014.
        Country of origin: India. For queries, write to support@palmonas.com.
      </p>
    ),
  },
  {
    title: "Return Policy",
    body: (
      <p>
        Easy 7-day returns and exchanges on unused products in original
        packaging. Lifetime plating warranty applies as per terms.
      </p>
    ),
  },
];

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5b301" stroke="#d99a00" strokeWidth="1" strokeLinejoin="round" aria-hidden>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l1-8Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f5b301" aria-hidden>
      <path d="m12 2 2.9 6.26L21.5 9.2l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.16L2.5 9.2l6.6-.94L12 2Z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "#e0517a" : "none"} stroke={filled ? "#e0517a" : "#151515"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5 8.5 3 21 15.5 15.5 21 3 8.5Z" />
      <path d="M7 7.5 9 9.5M10 4.5l2 2M13.5 8l2 2M9.5 12l2 2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0533a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 7H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008236" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function DealCard({ price }: { price: string }) {
  return (
    <div className="w-[320px] shrink-0 rounded-xl border border-[#e5e5e5] bg-white p-4">
      <p className="text-base font-semibold text-[#151515]">
        Get it for <span className="text-[#008236]">{price}</span>
      </p>
      <div className="my-3 h-px w-full bg-[#ededed]" />
      <p className="text-sm leading-snug text-[#8a8a8a]">
        Perfect Time to Stock Up! Note: You need to add minimum 2 products to
        avail this discount.
      </p>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-dashed border-[#008236] px-3 py-1.5 text-sm font-semibold text-[#008236]"
      >
        B1G1
        <CopyIcon />
      </button>
    </div>
  );
}

export default function ProductDetail({
  id,
  query,
}: {
  id: string;
  query: Query;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  // Attempt real API fetch — id may be a Shopify numeric ID or a legacy slug.
  const isNumericId = /^\d+$/.test(id);
  const { product: apiProduct, reviews: apiReviews } = useProduct(
    isNumericId ? id : "",
  );

  // Derive display values: real API > URL query params > fallback defaults.
  const title =
    apiProduct?.title ?? one(query.title) ?? "Twist Cross Cage Ring";
  const priceRaw = apiProduct
    ? parseFloat(apiProduct.priceRange.minVariantPrice.amount)
    : 0;
  const mrpRaw = apiProduct
    ? parseFloat(apiProduct.priceRange.maxVariantPrice.amount)
    : 0;
  const price = apiProduct ? fmtINR(priceRaw) : (one(query.price) ?? "₹3,266");
  const mrp = apiProduct ? fmtINR(mrpRaw) : (one(query.mrp) ?? "₹3,351");
  const image =
    apiProduct?.images?.[0]?.url ??
    one(query.image) ??
    "/collection/product-earrings.jpg";
  const collection = one(query.collection) as Product["collection"] | undefined;

  const apiGallery = apiProduct?.images?.map((img) => img.url) ?? [];
  const priceNum = apiProduct ? priceRaw : parsePrice(price);
  const mrpNum = apiProduct ? mrpRaw : parsePrice(mrp);
  const offPercent =
    mrpNum > 0 && priceNum > 0
      ? Math.round((1 - priceNum / mrpNum) * 100)
      : 0;

  const ratingAvg = apiReviews ? parseFloat(apiReviews.avg_rating) : 4.5;
  const ratingCount = apiReviews ? parseInt(apiReviews.review_count, 10) : 128;

  // Build rich accordion data from real API when available.
  const apiAccordions = useMemo(() => {
    if (!apiProduct) return null;
    return [
      {
        title: "Description",
        body: <p className="whitespace-pre-line">{apiProduct.description}</p>,
      },
      {
        title: "Specifications",
        body: (
          <p className="whitespace-pre-line text-[#525252]">
            {apiProduct.specifications}
          </p>
        ),
      },
      {
        title: "Supplier Information",
        body: (
          <p className="whitespace-pre-line text-[#525252]">
            {apiProduct.supplier_info}
          </p>
        ),
      },
      {
        title: "Return Policy",
        body: (
          <p className="whitespace-pre-line text-[#525252]">
            {apiProduct.return_info}
          </p>
        ),
      },
    ];
  }, [apiProduct]);

  const product = useMemo<Product>(
    () => ({
      id,
      title,
      image,
      price,
      mrp,
      discount: one(query.discount) ?? `${offPercent}% OFF`,
      extraOffers: 2,
      rating: ratingAvg,
      reviews: ratingCount,
      metals: ["Yellow Gold", "Rose Gold", "White Gold"],
      collection,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, title, image, price, mrp, collection, ratingAvg, ratingCount],
  );

  const wishlisted = has(id);
  const [size, setSize] = useState("7");
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "Description",
  );
  const [activeImg, setActiveImg] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    setActiveImg(Math.round(el.scrollLeft / el.clientWidth));
  };

  const gallery =
    apiGallery.length > 0
      ? apiGallery
      : [image, ...GALLERY_FILLERS];
  const theme = themeForCollection(collection);

  const handleAddToCart = () => {
    addItem({
      id,
      title,
      image,
      price: priceNum,
      mrp: mrpNum,
      colour: product.metals[0],
      size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem({
      id,
      title,
      image,
      price: priceNum,
      mrp: mrpNum,
      colour: product.metals[0],
      size,
    });
    router.push("/cart");
  };

  return (
    <main className="w-full bg-white text-[#151515]">
      <div className="mx-auto w-full max-w-[1640px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_533px] lg:gap-10">
          {/* Gallery */}
          <div>
            {/* Mobile: one image at a time with dot indicators */}
            <div className="lg:hidden">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {gallery.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden rounded-2xl bg-[#f6f2ee]"
                  >
                    <Image
                      src={src}
                      alt={`${title} view ${i + 1}`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="relative mt-3 flex items-center justify-center gap-3">
                <div className="flex flex-1 items-center justify-center gap-1.5">
                  {gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeImg
                          ? "w-5 bg-[#151515]"
                          : "w-1.5 bg-[#d4d4d4]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Share product"
                  className="absolute right-4 transition-transform hover:scale-110"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Desktop: two-column grid */}
            <div className="hidden grid-cols-2 gap-5 lg:grid">
              {gallery.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f6f2ee]"
                >
                  <Image
                    src={src}
                    alt={`${title} view ${i + 1}`}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Price + wishlist/rating */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-bold leading-none">
                    {price}
                  </span>
                  <span className="text-lg text-[#9aa0a6] line-through">
                    {mrp}
                  </span>
                  {offPercent > 0 ? (
                    <span className="rounded-full bg-[#151515] px-2.5 py-1 text-xs font-semibold text-white">
                      {offPercent}% OFF
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-[#8a8a8a]">
                  Inclusive of all taxes
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  onClick={() => toggle(product)}
                  className="transition-transform hover:scale-110"
                >
                  <HeartIcon filled={wishlisted} />
                </button>
                <span className="flex items-center gap-1 text-sm font-medium">
                  4.5/5 <StarIcon />
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-medium text-[#2a2a2a]">{title}</h1>

            {/* Selling fast */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fdebc8] px-3 py-1 text-sm font-medium text-[#c2770a]">
              <BoltIcon />
              Selling Fast
            </div>

            {/* Cashback banner */}
            <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-[#eafaf0] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-[#15803d]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white">
                  ₹
                </span>
                Earn ₹163 cashback in your wallet on this purchase.
              </span>
              <InfoIcon />
            </div>

            {/* Deals */}
            <div className="mt-6 rounded-2xl bg-[#eafaf0] p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#16a34a] text-xs font-bold text-white">
                  %
                </span>
                <span className="text-xl font-bold">Deals</span>
              </div>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <DealCard price={price} />
                <DealCard price={price} />
              </div>
            </div>

            {/* Ring size */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Select Ring Size(US)
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#151515]"
                >
                  <RulerIcon />
                  Size Guide
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                {RING_SIZES.map((s) => {
                  const active = s === size;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex size-10 items-center justify-center rounded-full border text-sm transition-colors ${
                        active
                          ? "border-[#e0b4a8] bg-[#f7e8e3] font-semibold text-[#151515]"
                          : "border-[#d4d4d4] text-[#151515] hover:border-[#151515]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-base">
                  Deliver To <span className="font-bold">221002</span>
                </span>
                <button type="button" className="text-sm font-semibold">
                  Change
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-[#eee]">
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#fde2d8] to-white px-3 py-2">
                  <CartIcon />
                  <span className="text-sm font-semibold text-[#e0533a]">
                    NOW
                  </span>
                  <span className="text-sm italic text-[#6b6b6b]">
                    Get it By Today
                  </span>
                </div>
                <div className="px-3 py-2.5 text-sm text-[#404040]">
                  Free Delivery by <span className="font-semibold">Today</span>.
                  Order within{" "}
                  <span className="font-semibold">0 hours 59 minutes.</span>
                </div>
              </div>
            </div>

            {/* Actions (desktop — mobile uses the fixed bottom bar) */}
            <div className="mt-6 hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  added
                    ? "border-[#008236] bg-[#008236] text-white"
                    : "border-[#151515] text-[#151515] hover:bg-[#151515] hover:text-white"
                }`}
              >
                {added ? (
                  <>
                    <CheckIcon /> Added
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="h-12 flex-1 rounded-lg bg-[#151515] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Buy Now
              </button>
            </div>

            {/* USPs */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-[#eee] border-y border-[#eee] py-4">
              {USPS.map((u) => (
                <div
                  key={u.label}
                  className="flex flex-col items-center gap-2 px-2 text-center"
                >
                  <Image src={u.icon} alt="" width={30} height={30} />
                  <span className="text-xs text-[#404040]">{u.label}</span>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="mt-4">
              {(apiAccordions ?? ACCORDIONS).map((a) => {
                const open = openAccordion === a.title;
                return (
                  <div key={a.title} className="border-b border-[#ededed]">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(open ? null : a.title)}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-lg">{a.title}</span>
                      <ChevronIcon open={open} />
                    </button>
                    {open ? (
                      <div className="pb-5 text-sm leading-relaxed text-[#525252]">
                        {a.body}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      <section className="w-full px-4 py-12 sm:px-8">
        <div className="mb-8">
          <SectionHeading title="Similar Products" />
        </div>
        <ProductCarousel products={makeProducts(`${id}-similar`, 10, theme)} />
      </section>

      {/* Complete your look */}
      <section className="w-full px-4 py-12 sm:px-8">
        <div className="mb-8">
          <SectionHeading title="Complete Your Look With" />
        </div>
        <ProductCarousel products={makeProducts(`${id}-look`, 10, theme)} />
      </section>

      {/* Reviews */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6">
        <SectionHeading title="Ratings & Reviews" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#faf7f4] p-8">
            <p className="text-5xl font-bold">{ratingAvg.toFixed(1)}</p>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <p className="mt-2 text-sm text-[#8a8a8a]">Based on {ratingCount} reviews</p>
          </div>
          <div className="flex flex-col gap-6">
            {[
              {
                name: "Aarohi S.",
                text: "Absolutely love it — looks premium and hasn't tarnished at all. Perfect for daily wear.",
              },
              {
                name: "Neha K.",
                text: "Great quality for the price. The size guide was spot on and delivery was super quick.",
              },
            ].map((r) => (
              <div
                key={r.name}
                className="border-b border-[#ededed] pb-6 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{r.name}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/collection"
            className="rounded-full border border-[#151515] px-7 py-2.5 text-sm font-medium transition-colors hover:bg-[#151515] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      {/* Fixed action bar (mobile only) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-black/10 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <button
          type="button"
          onClick={handleBuyNow}
          className="h-12 flex-1 rounded-lg border-2 border-[#151515] text-sm font-semibold text-[#151515]"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors ${
            added ? "bg-[#008236]" : "bg-[#151515]"
          }`}
        >
          {added ? (
            <>
              <CheckIcon /> Added
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </main>
  );
}
