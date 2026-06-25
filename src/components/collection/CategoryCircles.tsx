import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface CategoryCircleItem {
  label: string;
  /** Backend collection handle the circle links to. */
  handle: string;
  /** Optional image; falls back to the shared default. */
  image?: string;
}

const DEFAULT_IMAGE = "/collection/product-earrings.jpg";

/**
 * Reusable row/grid of circular category links. Each circle navigates to its
 * collection page (`/collection/{handle}`). Used by the home / gold / silver /
 * demi-fine pages.
 */
export default function CategoryCircles({
  items,
  columns = 3,
  className,
  ringClassName = "ring-black/5",
  bgClassName = "bg-[#f6f2ee]",
}: {
  items: CategoryCircleItem[];
  /** Number of columns on mobile (tablet/desktop always flex-wrap). */
  columns?: 3 | 4;
  className?: string;
  ringClassName?: string;
  bgClassName?: string;
}) {
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
          href={`/collection/${item.handle}`}
          className="group flex flex-col items-center gap-3"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-full ring-1 transition-transform group-hover:scale-105 sm:size-36",
              columns === 4 ? "size-[72px]" : "size-24",
              bgClassName,
              ringClassName,
            )}
          >
            <Image
              src={item.image ?? DEFAULT_IMAGE}
              alt={item.label}
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
          <span className="text-center text-base text-[#151515] sm:text-lg">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
