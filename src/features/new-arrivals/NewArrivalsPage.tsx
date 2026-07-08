import Link from "next/link";
import CategoryCircles from "@/components/collection/CategoryCircles";
import CollectionCarousel from "@/components/product/CollectionCarousel";
import FilterableCollectionCarousel from "@/components/product/FilterableCollectionCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllButton from "@/components/ui/ViewAllButton";
import AudienceCard from "@/features/new-arrivals/components/AudienceCard";
import CuratedEditCard from "@/features/new-arrivals/components/CuratedEditCard";
import GradientBadge from "@/features/new-arrivals/components/GradientBadge";
import NewArrivalsHero from "@/features/new-arrivals/components/NewArrivalsHero";
import ThemeCard from "@/features/new-arrivals/components/ThemeCard";
import ThisWeekBanner from "@/features/new-arrivals/components/ThisWeekBanner";
import {
  headingClassName,
  nuosuSil,
} from "@/features/new-arrivals/constants/fonts";
import {
  categories,
  curatedEdits,
  metalDrops,
  shopWhatsNewChips,
  themeCards,
} from "@/features/new-arrivals/data/content";
import { cn } from "@/lib/cn";

export default function NewArrivalsPage() {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col bg-white font-sans text-[#151515]",
        nuosuSil.variable,
      )}
    >
      <NewArrivalsHero />

      <section className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <CategoryCircles
            items={categories}
            layout="carousel"
            ringClassName="ring-[#EDE4EA]"
            bgClassName="bg-[#FAF6F8]"
          />
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Latest Drops"
            subtitle="Fresh pieces added this season"
            size="compact"
            titleClassName={headingClassName}
            className="mb-4 sm:mb-6"
          />
        </div>
        <CollectionCarousel
          handle="new-arrivals"
          hideHeading
          hideViewAll
          className="px-0 py-0 sm:px-0"
        />
        <ViewAllButton
          href="/collection/new-arrivals"
          variant="subtle"
          className="mt-4 sm:mt-6"
        />
      </section>

      <section className="border-t border-[#EDE4EA] bg-[linear-gradient(180deg,#FDFBFC_0%,#FAF6F8_100%)]">
        <FilterableCollectionCarousel
          title="Shop What's New"
          chips={shopWhatsNewChips}
          chipVariant="new-arrival"
          className="px-6 py-6 sm:px-6 sm:py-8"
        />
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Trending Now"
            subtitle="What everyone's adding to cart"
            size="compact"
            titleClassName={headingClassName}
            className="mb-4 sm:mb-6"
          />
        </div>
        <CollectionCarousel
          handle="best-sellers"
          hideHeading
          hideViewAll
          className="px-0 py-0 sm:px-0"
        />
        <ViewAllButton
          href="/collection/best-sellers"
          variant="subtle"
          className="mt-4 sm:mt-6"
        />
      </section>

      <ThisWeekBanner />

      <section className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <div className="relative mb-4 flex flex-col items-center sm:mb-6">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <h2
                className={cn(
                  headingClassName,
                  "text-xl font-bold capitalize text-[#151515] sm:text-2xl",
                )}
              >
                Drops Under
              </h2>
              <GradientBadge>₹1199</GradientBadge>
            </div>
            <p className="mt-1 text-sm text-[#9B848C] sm:text-base">
              Fresh pieces added this season
            </p>
            <span className="absolute top-1 -left-[13px] rounded-full bg-[linear-gradient(80deg,#FFD6D6_2%,#FFFFFF_98%)] px-2 py-0.5 text-[10px] font-bold text-[#803C54] sm:text-xs">
              1200+ Designs
            </span>
          </div>
        </div>
        <CollectionCarousel
          handle="exclusive-999-collection"
          hideHeading
          hideViewAll
          className="px-0 py-0 sm:px-0"
        />
        <ViewAllButton
          href="/collection/exclusive-999-collection"
          variant="subtle"
          className="mt-4 sm:mt-6"
        />
      </section>

      <section className="border-t border-[#EDE4EA] bg-[linear-gradient(180deg,#FDFBFC_0%,#FAF6F8_100%)] py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="For Everyone"
            subtitle="Find the perfect piece for everyone."
            size="compact"
            titleClassName={headingClassName}
            className="mb-6"
          />
          <div className="flex items-start justify-center gap-4 sm:gap-8">
            <AudienceCard label="Woman" href="/collection/new-arrivals" />
            <AudienceCard label="Men" href="/collection/mens-collection" />
          </div>
        </div>
      </section>

      <section className="bg-white py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <div className="mb-6">
            <SectionHeading subtitle="Fresh pieces added this season" size="compact">
              <div className="flex flex-wrap items-center justify-center gap-1">
                <h2
                  className={cn(
                    headingClassName,
                    "text-xl font-bold capitalize text-[#151515] sm:text-2xl",
                  )}
                >
                  Shop By
                </h2>
                <GradientBadge>Theme</GradientBadge>
              </div>
            </SectionHeading>
          </div>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-lg sm:gap-4">
            <div className="flex justify-center gap-3 sm:gap-4">
              <ThemeCard {...themeCards[0]} />
              <ThemeCard {...themeCards[1]} />
            </div>
            <div className="flex justify-center gap-3 sm:gap-4">
              <ThemeCard {...themeCards[2]} />
              <ThemeCard {...themeCards[3]} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Curated Edits"
            subtitle="Handpicked collections from our latest launches"
            size="compact"
            titleClassName={headingClassName}
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {curatedEdits.map((edit) => (
              <CuratedEditCard key={edit.label} {...edit} />
            ))}
          </div>
          <ViewAllButton
            href="/collection/new-arrivals"
            variant="subtle"
            className="mt-6"
          />
        </div>
      </section>

      <section className="border-t border-[#EDE4EA] bg-[linear-gradient(180deg,#FDFBFC_0%,#FAF6F8_100%)] py-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto w-full max-w-[1380px] px-6">
          <SectionHeading
            title="Shop By Metal"
            subtitle="Handpicked collections from our latest launches"
            size="compact"
            titleClassName={headingClassName}
            className="mb-6"
          />
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-2xl sm:gap-4 lg:max-w-3xl">
            {metalDrops.map((metal) => (
              <Link
                key={metal.title}
                href={metal.href}
                className="group block overflow-hidden rounded-2xl shadow-[0_0_0_1px_#EDE4EA]"
              >
                <div
                  className="flex h-[190px] flex-col justify-end p-8 transition-transform group-hover:scale-[1.01] sm:h-[220px]"
                  style={{ backgroundImage: metal.gradient }}
                >
                  <h3
                    className={cn(
                      headingClassName,
                      "text-2xl font-semibold text-[#151515]",
                    )}
                  >
                    {metal.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#151515]/70">
                    {metal.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
