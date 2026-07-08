import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { headingClassName } from "@/features/new-arrivals/constants/fonts";
import { HERO_IMAGE } from "@/features/new-arrivals/data/content";

export default function NewArrivalsHero() {
  return (
    <section className="relative aspect-[360/461] w-full overflow-hidden sm:aspect-auto sm:h-[460px] lg:h-[560px]">
      <Image
        src={HERO_IMAGE}
        alt="New Arrivals at Palmonas"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(128deg, rgba(253,248,250,0.15) 0%, rgba(245,235,238,0.2) 48%, rgba(243,239,248,0.25) 100%)",
        }}
      />
      <div className="relative mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#9B848C] sm:text-sm">
          Just Dropped
        </p>
        <h1
          className={cn(
            headingClassName,
            "max-w-3xl text-4xl font-bold capitalize leading-tight text-[#151515] sm:text-6xl lg:text-7xl",
          )}
        >
          New Arrivals
        </h1>
        <p className="mt-4 max-w-xl text-sm text-[#6B5B5B] sm:mt-5 sm:text-lg">
          The freshest styles in Demifine®, gold, and silver — curated for the
          way you wear jewellery today.
        </p>
        <Link
          href="/collection/new-arrivals"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#151515] px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03] sm:mt-8"
        >
          Shop all new arrivals
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
