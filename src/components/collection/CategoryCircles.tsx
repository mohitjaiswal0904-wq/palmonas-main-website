import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface CategoryCircleItem {
  label: string;
  /** Backend collection handle the circle links to. */
  handle: string;
  /** Optional image; falls back to the shared default. */
  image?: string;
  /** Override link target (defaults to `/collection/{handle}`). */
  href?: string;
}

const DEFAULT_IMAGE = "/collection/product-earrings.jpg";
const NEW_ARRIVALS_IMAGE = "/collection/new-arrivals-circle.png";

function categoryHref(item: CategoryCircleItem) {
  return item.href ?? `/collection/${item.handle}`;
}

function isNewArrivalsItem(item: CategoryCircleItem) {
  return item.handle === "new-arrivals";
}

function NewArrivalAnimatedText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "animate-category-new-arrival-pulse inline-block text-center",
        className,
      )}
    >
      <span
        className={cn(
          "block font-bold text-[#EE284C]",
        )}
      >
        {children}
      </span>
    </span>
  );
}

function CategoryItemLabel({
  item,
  className,
}: {
  item: CategoryCircleItem;
  className?: string;
}) {
  if (isNewArrivalsItem(item)) {
    return (
      <NewArrivalAnimatedText className={className}>
        {item.label}
      </NewArrivalAnimatedText>
    );
  }

  return (
    <span className={cn("text-center text-[#151515]", className)}>
      {item.label}
    </span>
  );
}

function CircleThumb({
  item,
  sizeClass,
  bgClassName,
  ringClassName,
}: {
  item: CategoryCircleItem;
  sizeClass: string;
  bgClassName: string;
  ringClassName: string;
}) {
  const isNewArrival = isNewArrivalsItem(item);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-1 transition-transform group-hover:scale-105",
        sizeClass,
        bgClassName,
        ringClassName,
      )}
    >
      <Image
        src={isNewArrival ? NEW_ARRIVALS_IMAGE : (item.image ?? DEFAULT_IMAGE)}
        alt={item.label}
        fill
        sizes="144px"
        className={isNewArrival ? "object-contain p-1" : "object-cover"}
      />
    </div>
  );
}

/**
 * Reusable row/grid of circular category links. Each circle navigates to its
 * collection page (`/collection/{handle}`). Used by the home / gold / silver /
 * demi-fine pages.
 */
export default function CategoryCircles({
  items,
  columns = 3,
  layout = "grid",
  className,
  ringClassName = "ring-black/5",
  bgClassName = "bg-[#f6f2ee]",
}: {
  items: CategoryCircleItem[];
  /** Number of columns on mobile when `layout` is `grid`. */
  columns?: 3 | 4;
  /** `carousel` scrolls categories horizontally with snap. */
  layout?: "grid" | "carousel";
  className?: string;
  ringClassName?: string;
  bgClassName?: string;
}) {
  if (layout === "carousel") {
    return (
      <div className={cn("relative -mx-6 sm:mx-0", className)}>
        <div
          className={cn(
            "flex gap-2.5 overflow-x-auto scroll-smooth pl-8 pr-6 scroll-pl-8 sm:gap-3.5 sm:pl-10 sm:pr-0 sm:scroll-pl-10",
            "snap-x snap-mandatory py-1",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={categoryHref(item)}
              className="group flex w-[88px] shrink-0 snap-start flex-col items-center gap-3 sm:w-[108px]"
            >
              <CircleThumb
                item={item}
                sizeClass="size-20 sm:size-28"
                bgClassName={bgClassName}
                ringClassName={ringClassName}
              />
              <CategoryItemLabel
                item={item}
                className="text-sm sm:text-base"
              />
            </Link>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid justify-items-center gap-y-8 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-x-7",
        columns === 4 ? "grid-cols-4 gap-x-2" : "grid-cols-3 gap-x-4",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={categoryHref(item)}
          className="group flex flex-col items-center gap-3"
        >
          <CircleThumb
            item={item}
            sizeClass={columns === 4 ? "size-[72px] sm:size-36" : "size-24 sm:size-36"}
            bgClassName={bgClassName}
            ringClassName={ringClassName}
          />
          <CategoryItemLabel
            item={item}
            className="text-base sm:text-lg"
          />
        </Link>
      ))}
    </div>
  );
}
