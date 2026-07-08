import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import CollectionCarousel from "@/components/product/CollectionCarousel";
import CategoryCircles, {
  type CategoryCircleItem,
} from "@/components/collection/CategoryCircles";

import { PRODUCT_IMAGE } from "@/data/products";

const goldCategories: CategoryCircleItem[] = [
  { label: "Rings", handle: "9kt-gold-rings" },
  { label: "Earrings", handle: "9kt-gold-earrings" },
  { label: "Necklaces", handle: "9kt-gold-necklaces" },
  { label: "Bracelets", handle: "9kt-gold-bracelets" },
  { label: "Mangalsutras", handle: "9kt-gold-mangalsutra" },
  { label: "Pendants", handle: "9kt-gold-pendants" },
  { label: "Chains", handle: "chains" },
  { label: "Bangles", handle: "bangles" },
];

const occasions: { label: string; handle: string }[] = [
  { label: "Engagement", handle: "9kt-engagement-rings" },
  { label: "Daily Wear", handle: "everyday-gold-jewellery" },
  { label: "Office Wear", handle: "office-wear" },
  { label: "Wedding Wear", handle: "wedding-collection" },
  { label: "Party Wear", handle: "party-wear-gold-jewellery" },
];

const priceBuckets = [
  { label: "Under 10k", handle: "gold-less-than-10k", gradient: "from-[#f6ead0] to-[#e7cd96]" },
  { label: "Under 20k", handle: "gold-less-than-20k", gradient: "from-[#efe0c4] to-[#dcbf86]" },
  { label: "Above 20k", handle: "gold-greater-than-20k", gradient: "from-[#f1dcb6] to-[#d9b673]" },
];

export default function GoldPage() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#151515]">
      {/* Hero */}
      <section className="relative aspect-[360/461] overflow-hidden bg-gradient-to-br from-[#fbf2d6] via-[#e9c46a] to-[#b8860b] sm:aspect-auto sm:h-[460px] lg:h-[600px]">
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-[#fff7e0]/50 blur-3xl" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#7a5a12]">
            The Gold Collection
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#3a2a05] sm:text-6xl lg:text-7xl">
            Pure warmth, made to last.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#5c4410] sm:text-lg">
            9KT &amp; 14KT fine gold jewellery with a glow that never fades.
          </p>
          <Link
            href="/collection/9kt-fine-gold"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3a2a05] px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Shop gold
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Category circles */}
      <section className="mx-auto w-full max-w-[1600px] px-6 py-12">
        <CategoryCircles
          items={goldCategories}
          columns={4}
          ringClassName="ring-[#e9c46a]/30"
          bgClassName="bg-[#faf4e6]"
        />
      </section>

      {/* Gold Bestsellers */}
      <CollectionCarousel handle="9kt-gold-bestsellers" title="Gold Bestsellers" />

      {/* Banner */}
      <section className="mx-auto w-full max-w-[1920px] px-4 sm:px-8">
        <div className="relative flex h-[280px] items-center overflow-hidden rounded-3xl bg-gradient-to-r from-[#2a1f0a] via-[#5c441a] to-[#b8860b] sm:h-[420px]">
          <div className="relative z-10 max-w-xl px-10 sm:px-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f6e7c1]/80">Festive Edit</p>
            <h3 className="mt-3 text-3xl font-semibold text-[#fbf2d6] sm:text-5xl">Gold that tells your story</h3>
            <Link href="/collection/limited-time-festive-deals" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fbf2d6] px-7 py-3 text-sm font-medium text-[#3a2a05] transition-transform hover:scale-105">
              Explore now <ArrowIcon />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 bottom-0 h-full w-1/2">
            <Image src={PRODUCT_IMAGE} alt="Gold festive edit" fill sizes="50vw" className="object-contain object-bottom opacity-90" />
          </div>
        </div>
      </section>

      {/* Make Every Occasion Golden */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-16">
        <SectionHeading title="Make Every Occasion Golden" />
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {occasions.map((occasion) => (
            <Link
              key={occasion.label}
              href={`/collection/${occasion.handle}`}
              className="group flex flex-col gap-4"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6ead0] to-[#e7cd96]">
                <Image src={PRODUCT_IMAGE} alt={occasion.label} fill sizes="280px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between rounded-full border border-[#e9c46a]/40 px-4 py-2.5">
                <span className="text-base font-medium text-[#3a2a05]">{occasion.label}</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#3a2a05] text-white"><ArrowIcon /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <CollectionCarousel handle="mto" title="New Arrivals" />

      {/* Tiny Treasures banner */}
      <section className="mx-auto w-full max-w-[1920px] px-4 sm:px-8">
        <div className="relative flex h-[320px] items-center overflow-hidden rounded-3xl bg-gradient-to-r from-[#9db8c9] to-[#cdddE6] sm:h-[460px]">
          <div className="relative z-10 max-w-md px-10 sm:px-16">
            <h3 className="text-4xl font-semibold tracking-[0.15em] text-white sm:text-6xl">TINY<br />TREASURES</h3>
            <p className="mt-4 text-sm text-white/90 sm:text-base">Delicate gold jewellery for the little ones — gentle, safe and precious.</p>
            <Link href="/collection/tiny-treasures" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-[#3a2a05] transition-transform hover:scale-105">
              Shop now <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Products under banner */}
      <CollectionCarousel handle="tiny-treasures" title="Tiny Treasures" />

      {/* Shop by Price */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-16">
        <SectionHeading title="Shop by Price" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {priceBuckets.map((bucket) => (
            <Link key={bucket.label} href={`/collection/${bucket.handle}`} className="group flex flex-col gap-4">
              <div className={`relative flex aspect-[460/229] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${bucket.gradient}`}>
                <div className="relative h-3/4 w-1/2">
                  <Image src={PRODUCT_IMAGE} alt={bucket.label} fill sizes="230px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
              <span className="text-center text-lg font-semibold text-[#3a2a05]">{bucket.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Designs */}
      <CollectionCarousel handle="gold-best-sellers" title="Trending Designs" />

    </div>
  );
}
