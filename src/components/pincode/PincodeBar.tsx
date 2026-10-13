"use client";

import { PinIcon } from "@/components/ui/icons";
import { usePincode } from "@/hooks/usePincode";
import { cn } from "@/lib/cn";

type PincodeBarProps = {
  variant: "mobile" | "desktop";
  className?: string;
};

/** Header pincode CTA — mobile row below search (Figma) or desktop right cluster. */
export default function PincodeBar({ variant, className }: PincodeBarProps) {
  const { pincode, city, openSheet } = usePincode();

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={openSheet}
        aria-label={`Update delivery pincode. Currently delivering to ${pincode}`}
        className={cn(
          "flex w-full items-center gap-1 pl-4 pr-2.5 pt-0.5 text-left transition-opacity hover:opacity-80",
          className,
        )}
      >
        <PinIcon className="size-3 shrink-0 text-black" />
        <span className="shrink-0 text-[11px] leading-none text-black">
          Update Pincode
        </span>
        <span className="rounded-[6px] bg-gradient-to-r from-[#ffccbc]/50 to-white/50 px-1.5 py-1 text-[10px] italic leading-none text-black">
          Delivering to{" "}
          <span className="font-bold not-italic">{pincode}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSheet}
      aria-label={`Update delivery pincode. Currently delivering to ${pincode}${city ? `, ${city}` : ""}`}
      className={cn(
        "hidden items-center gap-1.5 rounded-lg transition-colors hover:bg-[#f7f7f7] xl:flex",
        className,
      )}
    >
      <PinIcon className="text-black" />
      <span className="text-sm text-black">Update Pincode</span>
      <span className="rounded-lg bg-gradient-to-r from-[#ffccbc]/50 to-white/50 px-2 py-1.5 text-xs italic text-black">
        Delivering to{" "}
        <span className="font-bold not-italic">
          {pincode}
          {city ? ` · ${city}` : ""}
        </span>
      </span>
    </button>
  );
}
