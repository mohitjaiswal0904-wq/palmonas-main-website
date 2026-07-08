import Image from "next/image";
import { cn } from "@/lib/cn";

const BELL_SRC = "/tags/new-arrival-bell.png";

type NewArrivalTagProps = {
  /** `overlay` sits on the gallery; `inline` sits in the info panel. */
  variant?: "overlay" | "inline";
  /** Dark styling for product-card tags; pastel everywhere else. */
  tone?: "pastel" | "dark";
  className?: string;
};

/**
 * Animated new-arrivals pill tag.
 */
export default function NewArrivalTag({
  variant = "overlay",
  tone = "pastel",
  className,
}: NewArrivalTagProps) {
  const isInline = variant === "inline";
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "animate-new-arrival-enter inline-flex items-center backdrop-blur-[2px]",
        !isDark && "animate-new-arrival-shimmer animate-new-arrival-glow",
        isDark
          ? "bg-gradient-to-r from-white from-35% via-white/80 to-transparent"
          : "bg-gradient-to-r from-[#FAF6F8] from-35% via-[#F0E4EA]/80 to-transparent",
        isInline
          ? "gap-[7px] rounded-br-[12px] rounded-tr-[12px] py-[7px] pl-[10px] pr-[17px]"
          : "gap-[5px] rounded-br-[10px] rounded-tr-[10px] py-[5px] pl-[7px] pr-3",
        className,
      )}
      role="img"
      aria-label="New Arrivals"
    >
      <span
        className={cn(
          "animate-new-arrival-bell inline-flex shrink-0",
          isInline ? "size-[18px]" : "size-4",
        )}
      >
        <Image
          src={BELL_SRC}
          alt=""
          width={36}
          height={36}
          className={cn(
            "size-full object-contain",
            isDark
              ? "drop-shadow-[0_1px_2px_rgba(211,9,68,0.12)]"
              : "drop-shadow-[0_1px_2px_rgba(211,9,68,0.18)]",
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "shrink-0 whitespace-nowrap font-bold leading-none tracking-[0.04em] text-[#D30944]",
          isInline ? "text-[12px]" : "text-[11px]",
        )}
      >
        New Arrivals
      </span>
    </div>
  );
}
