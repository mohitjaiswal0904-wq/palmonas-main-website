import type { ReactNode } from "react";
import { newArrivalsGradientClass } from "@/features/new-arrivals/constants/theme";
import { cn } from "@/lib/cn";

export default function GradientBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-[8.76deg] items-center justify-center rounded px-1.5 py-0.5",
        newArrivalsGradientClass,
        className,
      )}
    >
      <span className="text-xs font-bold text-white sm:text-sm">{children}</span>
    </span>
  );
}
