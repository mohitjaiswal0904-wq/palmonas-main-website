import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { ArrowIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import CollectionCarousel from "@/components/product/CollectionCarousel";
import FilterableCollectionCarousel from "@/components/product/FilterableCollectionCarousel";
import CategoryCircles, {
  type CategoryCircleItem,
} from "@/components/collection/CategoryCircles";

const PRODUCT_IMAGE = "/collection/product-earrings.jpg";

const categories: CategoryCircleItem[] = [
  { label: "Rings", handle: "demi-fine-rings" },
  { label: "Bracelets", handle: "demi-fine-bracelets" },
  { label: "Men's", handle: "demi-fine-mens-collection" },
  { label: "Earrings", handle: "demi-fine-earrings" },
  { label: "Mangalsutras", handle: "modern-mangalsutras" },
  { label: "Necklaces", handle: "demi-fine-necklaces" },
];

const topStyleChips = [
  { label: "All", handle: "demi-fine-jewellery" },
  { label: "Rings", handle: "demi-fine-rings" },
  { label: "Earrings", handle: "demi-fine-earrings" },
  { label: "Necklaces", handle: "demi-fine-necklaces" },
  { label: "Bracelets", handle: "demi-fine-bracelets" },
  { label: "Pendants", handle: "pendant-necklaces" },
  { label: "Anklets", handle: "anklets" },
];

// Layout: row 1 two tiles, row 2 Wedding alone (centered), row 3 two tiles.
const everyYou: { label: string; handle: string; center?: boolean }[] = [
  { label: "Party Wear", handle: "party-wear-gold-jewellery" },
  { label: "Daily Wear", handle: "everyday-essentials" },
  { label: "Wedding Wear", handle: "wedding-collection", center: true },
  { label: "Day Out", handle: "day-out" },
  { label: "Date Night", handle: "date-night" },
];

const giftingEdit: { label: string; handle: string }[] = [
  { label: "Gifts For Mother", handle: "gift-for-mom" },
  { label: "Gifts For Sister", handle: "gift-for-sister" },
  { label: "Gifts For Brother", handle: "gifts-for-brother" },
  { label: "Gifts For Friends", handle: "friends-collection" },
];

export default function DemifinePage() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-[#151515]">
      {/* Hero */}
      <section className="relative aspect-[360/461] overflow-hidden bg-gradient-to-br from-[#fbe4e7] via-[#f3c2cc] to-[#d98a9a] sm:aspect-auto sm:h-[460px] lg:h-[600px]">
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-[#d96a86]/30 blur-3xl" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#a44c63]">
            Demi-Fine Jewellery
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#4a1d27] sm:text-6xl lg:text-7xl">
            Everyday luxury, redefined.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#6e3a47] sm:text-lg">
            Anti-tarnish, skin-safe and made to be loved every single day.
          </p>
          <Link
            href="/collection/demi-fine-jewellery"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4a1d27] px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Shop demi-fine
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Category circles */}
      <section className="mx-auto mt-[50px] w-full max-w-[1380px] px-4 sm:px-8">
        <CategoryCircles
          items={categories}
          ringClassName="ring-[#d96a86]/25"
          bgClassName="bg-[#fbeef0]"
        />
      </section>

      {/* Palmonas Top Styles (chip-filtered) */}
      <div className="mt-[50px]">
        <FilterableCollectionCarousel
          title="Palmonas Top Styles"
          chips={topStyleChips}
        />
      </div>

      {/* Banner */}
      <section className="mx-auto mt-[50px] w-full max-w-[1920px] px-4 sm:px-8">
        <div className="relative flex h-[260px] items-center overflow-hidden rounded-3xl bg-gradient-to-r from-[#4a1d27] via-[#8a3a4d] to-[#d98a9a] sm:h-[400px]">
          <div className="relative z-10 max-w-xl px-10 sm:px-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f3c2cc]/90">New Season</p>
            <h3 className="mt-3 text-3xl font-semibold text-[#fbe4e7] sm:text-5xl">Pieces that move with you</h3>
            <Link href="/collection/new-arrivals" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fbe4e7] px-7 py-3 text-sm font-medium text-[#4a1d27] transition-transform hover:scale-105">
              Explore now <ArrowIcon />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 bottom-0 h-full w-1/2">
            <Image src={PRODUCT_IMAGE} alt="Demi-fine new season" fill sizes="50vw" className="object-contain object-bottom opacity-90" />
          </div>
        </div>
      </section>

      {/* Shraddha's Favourite */}
      <div className="mt-[50px]">
        <CollectionCarousel handle="shraddhas-favourite" title="Shraddha's Favourite" />
      </div>

      {/* For Every You */}
      <section className="mx-auto mt-[50px] w-full max-w-[1600px] px-4 sm:px-8">
        <SectionHeading title="For Every You" />
        <div className="mt-5 grid grid-cols-2 gap-4">
          {everyYou.map((tile) => (
            <Link
              key={tile.label}
              href={`/collection/${tile.handle}`}
              className={`group relative h-60 overflow-hidden rounded-2xl sm:h-72 ${
                tile.center ? "col-span-2" : ""
              }`}
            >
              <Image src={PRODUCT_IMAGE} alt={tile.label} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xl font-semibold text-white">{tile.label}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/90">
                  Shop now
                  <ArrowIcon className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Demi-fine Bestsellers */}
      <div className="mt-[50px]">
        <CollectionCarousel handle="heart-collection" title="Demi-fine Bestsellers" />
      </div>

      {/* The Gifting Edit */}
      <section className="mx-auto mt-[50px] w-full max-w-[1500px] px-4 sm:px-8">
        <SectionHeading title="The Gifting Edit" />
        <div className="mt-5 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {giftingEdit.map((gift) => (
            <div key={gift.label} className="flex flex-col gap-4">
              <Link
                href={`/collection/${gift.handle}`}
                className="group relative aspect-[290/380] overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbe4e7] to-[#f3c2cc]"
              >
                <Image src={PRODUCT_IMAGE} alt={gift.label} fill sizes="290px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </Link>
              <div>
                <p className="text-lg font-semibold text-[#4a1d27]">{gift.label}</p>
                <Link
                  href={`/collection/${gift.handle}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#d96a86] transition-colors hover:text-[#4a1d27]"
                >
                  Shop Now
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editor's Picks */}
      <div className="mt-[50px]">
        <CollectionCarousel handle="celestial-collection" title="Editor's Picks" />
      </div>

      {/* Demi-fine Edits (wide cards) */}
      <section className="mx-auto mt-[50px] w-full max-w-[1920px] px-4 sm:px-8">
        <div className="mb-5">
          <SectionHeading title="Demi-fine Edits" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "Rose Gold Stories", handle: "rose-gold" },
            { label: "Evil Eye Edit", handle: "evil-eye-collection" },
            { label: "Pearl Picks", handle: "pearl-collection" },
            { label: "Celestial Muse", handle: "celestial-collection" },
            { label: "Heart Notes", handle: "heart-collection" },
          ].map((edit, i) => (
            <Link
              key={edit.handle}
              href={`/collection/${edit.handle}`}
              className="group relative h-56 w-[80vw] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbe4e7] to-[#f3c2cc] sm:w-[480px]"
            >
              <div className="absolute inset-0 flex items-center justify-between p-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-[#a44c63]">
                    Edit {i + 1}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#4a1d27]">
                    {edit.label}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#4a1d27]">
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

      <Footer />
    </div>
  );
}
