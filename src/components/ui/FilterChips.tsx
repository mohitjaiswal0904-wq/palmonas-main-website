"use client";

import { useState } from "react";
import { newArrivalsGradientClass } from "@/features/new-arrivals/constants/theme";

type Props = {
  options: string[];
  /** Controlled selected value. When provided with `onChange`, internal state is bypassed. */
  value?: string;
  onChange?: (value: string) => void;
  align?: "center" | "start";
  /**
   * Keep the chips on a single line and scroll horizontally (hidden scrollbar)
   * when they overflow, instead of wrapping. Always left-aligned.
   */
  scroll?: boolean;
  /** Rose-blush styling for the new-arrivals landing page. */
  variant?: "default" | "new-arrival";
};

/**
 * Single-select pill filter row. Works uncontrolled (first option selected by
 * default) or controlled via `value` + `onChange`.
 */
export default function FilterChips({
  options,
  value,
  onChange,
  align = "center",
  scroll = false,
  variant = "default",
}: Props) {
  const [internal, setInternal] = useState(options[0]);
  const active = value ?? internal;

  const select = (option: string) => {
    if (onChange) onChange(option);
    else setInternal(option);
  };

  return (
    <div
      className={
        scroll
          ? "flex w-full items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : `flex flex-wrap items-center gap-3 ${
              align === "start" ? "justify-start" : "justify-center"
            }`
      }
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => select(option)}
          className={`rounded-full border px-5 py-2 text-sm transition-colors sm:text-base ${
            scroll ? "shrink-0 whitespace-nowrap" : ""
          } ${
            active === option
              ? variant === "new-arrival"
                ? `border-transparent text-white shadow-none ${newArrivalsGradientClass}`
                : "border-[#151515] bg-[#151515] text-white"
              : variant === "new-arrival"
                ? "border-[#EE284C]/25 bg-white/90 text-[#EE284C] hover:border-[#EE284C]/40 hover:bg-white"
                : "border-black/15 bg-white text-[#3a3a3a] hover:border-[#151515] hover:text-[#151515]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
