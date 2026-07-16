import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { newArrivalsGradientClass } from "@/features/new-arrivals/constants/theme";
import { cn } from "@/lib/cn";

type ViewAllButtonProps = {
  href?: string;
  /** `pill` — outlined rounded button; `subtle` — flat bordered link; `new-arrival` — coral gradient. */
  variant?: "pill" | "subtle" | "new-arrival";
  className?: string;
};

/** "View All" link used across collection carousels and landing pages. */
export default function ViewAllButton({
  href = "/collection",
  variant = "pill",
  className,
}: ViewAllButtonProps) {
  const isSubtle = variant === "subtle";
  const isNewArrival = variant === "new-arrival";

  return (
    <div className={cn("flex justify-center", className)}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center transition-colors",
          isNewArrival
            ? "gap-2 rounded-full px-7 py-2.5 text-sm font-medium text-white hover:scale-[1.03]"
            : isSubtle
            ? "justify-center rounded border border-[#D3C8CA] px-3 py-1.5 text-xs font-normal tracking-wide text-[#151515] hover:bg-[#FAF6F8] sm:text-sm"
              : "gap-2 rounded-full border border-[#151515] px-7 py-2.5 text-sm font-medium text-[#151515] hover:bg-[#151515] hover:text-white",
          isNewArrival && newArrivalsGradientClass,
        )}
      >
        View All
        {!isSubtle && !isNewArrival ? <ArrowIcon /> : null}
        {isNewArrival ? <ArrowIcon /> : null}
      </Link>
    </div>
  );
}
