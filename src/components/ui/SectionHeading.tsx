import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  /** Compact styling used on marketing landing pages. */
  size?: "default" | "compact";
};

/** Centered section title with optional subtitle and custom heading slot. */
export default function SectionHeading({
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
  size = "default",
}: SectionHeadingProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        isCompact ? "gap-1 sm:gap-1.5" : "gap-2",
        className,
      )}
    >
      {children ?? (
        <h2
          className={cn(
            isCompact
              ? "text-xl font-bold capitalize text-[#151515] sm:text-2xl"
              : "text-2xl font-bold capitalize text-[#151515] sm:text-3xl",
            titleClassName,
          )}
        >
          {title}
        </h2>
      )}
      {subtitle ? (
        <p
          className={cn(
            isCompact
              ? "text-sm text-[#9B848C] sm:text-base"
              : "text-base text-[#444] sm:text-lg",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
