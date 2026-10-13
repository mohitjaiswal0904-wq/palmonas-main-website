import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import CollectionCarousel from "@/components/product/CollectionCarousel";
import FilterableCollectionCarousel from "@/components/product/FilterableCollectionCarousel";
import CategoryCircles, {
  type CategoryCircleItem,
} from "@/components/collection/CategoryCircles";
import HomeSeoContent from "@/features/home/HomeSeoContent";

import { PRODUCT_IMAGE } from "@/data/products";

const categories: CategoryCircleItem[] = [
  { label: "New Arrivals", handle: "new-arrivals", href: "/new-arrivals" },
  { label: "Rings", handle: "rings" },
  { label: "Bracelets", handle: "bracelets" },
  { label: "Men's", handle: "mens-collection" },
  { label: "Earrings", handle: "earrings" },
  { label: "Mangalsutras", handle: "mangalsutra" },
  { label: "Necklaces", handle: "necklaces" },
];

const handpickedChips = [
  { label: "Bestsellers", handle: "best-sellers" },
  { label: "New In", handle: "new-arrivals" },
  { label: "Under ₹999", handle: "exclusive-999-collection" },
  { label: "Gold", handle: "18k-gold-plated" },
  { label: "Silver", handle: "sterling-silver" },
];

const offers = [
  { title: "BUY 1 GET 1 FREE", handle: "buy-1-get-1-free", from: "#c51a27", to: "#a50083" },
  { title: "FLAT ₹999", handle: "exclusive-999-collection", from: "#c28c01", to: "#843574" },
];

const metalCards = [
  {
    title: "Gold Jewellery",
    href: "/gold",
    gradient: "from-[#f6e7c1] via-[#e9c46a] to-[#b8860b]",
    badges: ["BIS Hallmark", "SGL/IGI Certified", "Lifetime Buyback"],
  },
  {
    title: "Silver Jewellery",
    href: "/silver",
    gradient: "from-[#f4f6f8] via-[#cfd6dd] to-[#8a949e]",
    badges: ["Lifetime Buyback", "925 Sterling Silver", "Skin Safe Jewellery"],
  },
  {
    title: "Demi-fine Jewellery",
    href: "/demifine",
    gradient: "from-[#fbe4e7] via-[#f3b6c0] to-[#d98a9a]",
    badges: ["Anti-Tarnish", "Skin Safe Jewellery", "18K Gold Tone Plated"],
  },
];

const demifineEdits = [
  { label: "Demi-fine Edit", handle: "demi-fine-jewellery" },
  { label: "Pearl Picks", handle: "pearl-collection" },
  { label: "Evil Eye Edit", handle: "evil-eye-collection" },
  { label: "Celestial Muse", handle: "celestial-collection" },
  { label: "Heart Notes", handle: "heart-collection" },
];

const goldStyles = [
  { label: "Daily", handle: "everyday-gold-jewellery", gradient: "from-[#f3e7cf] to-[#e9d3a3]" },
  { label: "Office", handle: "office-wear", gradient: "from-[#e9dcc4] to-[#d8c194]" },
  { label: "Wedding", handle: "wedding-collection", gradient: "from-[#f7dfe2] to-[#e9b9c0]" },
  { label: "Festive", handle: "festive-collection", gradient: "from-[#f1dcc0] to-[#e0b97f]" },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#151515]">
      {/* Hero */}
      <section className="relative aspect-[360/461] overflow-hidden bg-gradient-to-br from-[#f7e9e9] via-[#f5ede2] to-[#ead2d2] sm:aspect-auto sm:h-[460px] lg:h-[600px]">
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-[#e9c46a]/30 blur-3xl" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#b48c8c]">
            New Collection
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#3a2a2a] sm:text-6xl lg:text-7xl">
            Everyday luxury, crafted to last.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#6b5b5b] sm:text-lg">
            Gold, silver and demi-fine jewellery — made to be worn every day.
          </p>
          <Link
            href="/collection"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#151515] px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Shop the collection
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1380px] px-6 py-14">
        <CategoryCircles items={categories} layout="carousel" />
      </section>

      {/* Offers and Discounts */}
      <section className="mx-auto w-full max-w-[1380px] px-6 py-10">
        <SectionHeading
          title="Offers and Discounts"
          subtitle="Minimum 60% Off on all products"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className="relative flex h-[200px] flex-col items-center overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fbf4ec] sm:h-[300px]"
            >
              <p
                className="z-10 mt-5 bg-clip-text text-center text-base font-bold uppercase text-transparent sm:mt-6 sm:text-3xl"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${offer.from}, ${offer.to})`,
                }}
              >
                {offer.title}
              </p>
              <div className="absolute inset-x-0 bottom-0 top-14 flex items-end justify-between px-4 sm:top-16 sm:px-8">
                <Link
                  href={`/collection/${offer.handle}`}
                  className="z-10 mb-6 inline-flex items-center gap-1.5 rounded-full bg-[#151515] px-3.5 py-1.5 text-xs text-white transition-transform hover:scale-105 sm:mb-8 sm:gap-2 sm:px-5 sm:py-2 sm:text-sm"
                >
                  Explore
                  <ArrowIcon />
                </Link>
                <div className="relative h-full w-1/2">
                  <Image src={PRODUCT_IMAGE} alt={offer.title} fill sizes="320px" className="object-contain object-bottom" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Handpicked product showcase (chip-filtered) */}
      <FilterableCollectionCarousel title="Handpicked For You" chips={handpickedChips} />

      {/* Crafted in Every Metal */}
      <section className="relative mt-10 overflow-hidden bg-gradient-to-b from-[#fbe9ec] to-[#fdf4f5] pb-20 pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-b-[50%] bg-white" />
        <div className="relative mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Crafted in Every Metal"
            subtitle="Explore gold, silver, and demi-fine jewellery"
          />
          <div className="mt-12 -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {metalCards.map((card) => (
              <div
                key={card.title}
                className="w-[400px] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 sm:w-auto"
              >
                <Link
                  href={card.href}
                  className={`group relative flex h-80 items-end justify-center overflow-hidden rounded-t-3xl bg-gradient-to-br ${card.gradient} p-6`}
                >
                  <span className="absolute left-1/2 top-6 -translate-x-1/2 text-xl font-semibold text-[#2a2018]">
                    {card.title}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#151515] px-5 py-2 text-sm text-white transition-transform group-hover:scale-105">
                    Explore
                    <ArrowIcon />
                  </span>
                </Link>
                <div className="flex flex-nowrap items-center justify-center gap-x-2 px-4 py-4">
                  {card.badges.map((badge) => (
                    <span
                      key={badge}
                      className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] leading-none text-[#444] sm:text-[11px]"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#f0e6d2] text-[#b8860b]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                          <path d="m5 12 5 5 9-11" />
                        </svg>
                      </span>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shraddha's Favourite */}
      <CollectionCarousel handle="shraddhas-favourite" title="Shraddha's Favourite" />

      {/* Demi-fine Bestsellers (wide cards) */}
      <section className="mx-auto w-full max-w-[1920px] px-4 py-10 sm:px-8">
        <div className="mb-8">
          <SectionHeading title="Demi-fine Bestsellers" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {demifineEdits.map((edit) => (
            <Link
              key={edit.handle}
              href={`/collection/${edit.handle}`}
              className="group relative h-56 w-[480px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f7efe2] to-[#ecddc2]"
            >
              <div className="absolute inset-0 flex items-center justify-between p-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-[#9a7b4f]">
                    Bestseller
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2a2018]">
                    {edit.label}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#151515]">
                    Shop now
                    <ArrowIcon className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="relative h-full w-40">
                  <Image src={PRODUCT_IMAGE} alt={edit.label} fill sizes="160px" className="object-contain" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Most Popular */}
      <CollectionCarousel handle="most-popular" title="Most Popular" />

      {/* Gold Styles */}
      <section className="bg-[#fbf6ec] py-16">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Gold Styles"
            subtitle="From daily wear to special occasions"
          />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {goldStyles.map((style) => (
              <Link
                key={style.label}
                href={`/collection/${style.handle}`}
                className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-3xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${style.gradient} transition-transform duration-500 group-hover:scale-105`}
                />
                <div className="relative m-4 flex items-center justify-between rounded-full bg-white/90 px-5 py-3 backdrop-blur">
                  <span className="text-lg font-semibold text-[#2a2018]">
                    {style.label}
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#151515] text-white">
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeSeoContent />
    </div>
  );
}
