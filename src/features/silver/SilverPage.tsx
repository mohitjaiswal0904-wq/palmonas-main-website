import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import CollectionCarousel from "@/components/product/CollectionCarousel";
import CategoryCircles, {
  type CategoryCircleItem,
} from "@/components/collection/CategoryCircles";

import { PRODUCT_IMAGE } from "@/data/products";

const silverCategories: CategoryCircleItem[] = [
  { label: "Rings", handle: "rings" },
  { label: "Earrings", handle: "earrings" },
  { label: "Necklaces", handle: "necklaces" },
  { label: "Bracelets", handle: "bracelets" },
  { label: "Mangalsutras", handle: "mangalsutra" },
  { label: "Pendants", handle: "pendants" },
  { label: "Chains", handle: "chains" },
  { label: "Anklets", handle: "anklets" },
];

const occasions: { label: string; handle: string }[] = [
  { label: "Engagement", handle: "solitaire-rings" },
  { label: "Daily Wear", handle: "everyday-essentials" },
  { label: "Office Wear", handle: "office-wear" },
  { label: "Wedding Wear", handle: "wedding-collection" },
  { label: "Party Wear", handle: "date-night" },
];

const priceBuckets = [
  { label: "Under 2k", handle: "under-1999", gradient: "from-[#f4f6f8] to-[#cfd6dd]" },
  { label: "Under 5k", handle: "under-2999", gradient: "from-[#eef1f4] to-[#bcc4cc]" },
  { label: "Above 5k", handle: "above-3000", gradient: "from-[#e6eaee] to-[#a7b0ba]" },
];

export default function SilverPage() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#1c2127]">
      {/* Hero */}
      <section className="relative aspect-[360/461] overflow-hidden bg-gradient-to-br from-[#f4f6f8] via-[#cfd6dd] to-[#8a949e] sm:aspect-auto sm:h-[460px] lg:h-[600px]">
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-white/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-white/40 blur-3xl" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#5b6670]">
            The Silver Collection
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#1c2127] sm:text-6xl lg:text-7xl">
            Cool. Calm. Timeless.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#3a434c] sm:text-lg">
            925 sterling silver jewellery with a clean, modern shine.
          </p>
          <Link
            href="/collection/sterling-silver"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1c2127] px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Shop silver
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Category circles */}
      <section className="mx-auto w-full max-w-[1600px] px-6 py-12">
        <CategoryCircles
          items={silverCategories}
          columns={4}
          ringClassName="ring-[#8a949e]/30"
          bgClassName="bg-[#f1f4f6]"
        />
      </section>

      {/* Silver Bestsellers */}
      <CollectionCarousel handle="silver-collection" title="Silver Bestsellers" />

      {/* Banner */}
      <section className="mx-auto w-full max-w-[1920px] px-4 sm:px-8">
        <div className="relative flex h-[280px] items-center overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c2127] via-[#4a545e] to-[#8a949e] sm:h-[420px]">
          <div className="relative z-10 max-w-xl px-10 sm:px-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#dfe5ea]/80">Sterling Edit</p>
            <h3 className="mt-3 text-3xl font-semibold text-[#f4f6f8] sm:text-5xl">Silver that shines with you</h3>
            <Link href="/collection/fine-silver-jewellery" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f4f6f8] px-7 py-3 text-sm font-medium text-[#1c2127] transition-transform hover:scale-105">
              Explore now <ArrowIcon />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 bottom-0 h-full w-1/2">
            <Image src={PRODUCT_IMAGE} alt="Silver sterling edit" fill sizes="50vw" className="object-contain object-bottom opacity-90" />
          </div>
        </div>
      </section>

      {/* Make Every Occasion Shine */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-16">
        <SectionHeading title="Make Every Occasion Shine" />
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {occasions.map((occasion) => (
            <Link
              key={occasion.label}
              href={`/collection/${occasion.handle}`}
              className="group flex flex-col gap-4"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#f4f6f8] to-[#cfd6dd]">
                <Image src={PRODUCT_IMAGE} alt={occasion.label} fill sizes="280px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between rounded-full border border-[#8a949e]/40 px-4 py-2.5">
                <span className="text-base font-medium text-[#1c2127]">{occasion.label}</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#1c2127] text-white"><ArrowIcon /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <CollectionCarousel handle="palmonas-silver-jewellery" title="New Arrivals" />

      {/* Feature banner */}
      <section className="mx-auto w-full max-w-[1920px] px-4 sm:px-8">
        <div className="relative flex h-[320px] items-center overflow-hidden rounded-3xl bg-gradient-to-r from-[#aebac6] to-[#dfe6ec] sm:h-[460px]">
          <div className="relative z-10 max-w-md px-10 sm:px-16">
            <h3 className="text-4xl font-semibold tracking-[0.15em] text-white sm:text-6xl">PURE<br />SILVER</h3>
            <p className="mt-4 text-sm text-white/90 sm:text-base">Hypoallergenic, anti-tarnish and effortlessly elegant — silver for every day.</p>
            <Link href="/collection/925-sterling-silver-1" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-[#1c2127] transition-transform hover:scale-105">
              Shop now <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Products under banner */}
      <CollectionCarousel handle="fine-silver-jewellery" title="Fine Silver Jewellery" />

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
              <span className="text-center text-lg font-semibold text-[#1c2127]">{bucket.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Designs */}
      <CollectionCarousel handle="925-sterling-silver-1" title="Trending Designs" />

    </div>
  );
}
