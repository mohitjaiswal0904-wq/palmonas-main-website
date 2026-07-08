import type { ReactNode } from "react";
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
        "bg-[linear-gradient(265deg,#FFD6D6_2%,#E5C1FF_98%)]",
        className,
      )}
    >
      <span className="text-xs font-bold text-[#151515] sm:text-sm">
        {children}
      </span>
    </span>
  );
}
