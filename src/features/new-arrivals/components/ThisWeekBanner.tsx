import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { PRODUCT_IMAGE } from "@/data/products";
import { NEW_ARRIVALS_GRADIENT } from "@/features/new-arrivals/constants/theme";
import { cn } from "@/lib/cn";
import { headingClassName } from "@/features/new-arrivals/constants/fonts";

export default function ThisWeekBanner() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1380px] px-6">
        <div
          className="relative flex h-[220px] items-center overflow-hidden rounded-2xl sm:h-[280px]"
          style={{ backgroundImage: NEW_ARRIVALS_GRADIENT }}
        >
          <div className="relative z-10 max-w-md px-8 sm:px-12">
            <p
              className={cn(
                headingClassName,
                "text-xs uppercase tracking-[0.3em] text-white/70 sm:text-sm",
              )}
            >
              This Week
            </p>
            <h3
              className={cn(
                headingClassName,
                "mt-2 text-2xl font-semibold text-white sm:text-4xl",
              )}
            >
              Fresh finds, just dropped
            </h3>
            <Link
              href="/collection/new-arrivals"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#EE284C] transition-transform hover:scale-[1.03]"
            >
              View collection
              <ArrowIcon />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-4 bottom-0 h-full w-1/2 sm:right-0 sm:w-[42%]">
            <Image
              src={PRODUCT_IMAGE}
              alt="Fresh finds this week"
              fill
              sizes="50vw"
              className="object-contain object-bottom opacity-90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
