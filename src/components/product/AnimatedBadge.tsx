"use client";

import { useEffect, useState } from "react";

/** Yellow 3D-style lightning bolt used by the Bestseller tag. */
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#f5b301"
      stroke="#d99a00"
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l1-8Z" />
    </svg>
  );
}

/** Fast-delivery van glyph used by the "Get it by today" tag. */
function DeliveryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="14"
      viewBox="0 0 24 20"
      fill="none"
      stroke="#e86e48"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 4h12v9H1z" />
      <path d="M13 7h4l4 3.5V13h-8z" />
      <circle cx="6" cy="15.5" r="2" fill="#fff" />
      <circle cx="17" cy="15.5" r="2" fill="#fff" />
    </svg>
  );
}

type Face = "bestseller" | "delivery";

const SWAP_INTERVAL = 2600;

/**
 * Product-card tag that flips between the "Bestseller" badge and a
 * "Get it by today" fast-delivery badge every couple of seconds with a
 * playful 3D flip. When no bestseller text is given it just shows delivery.
 */
export default function AnimatedBadge({
  bestseller,
  className,
}: {
  bestseller?: string;
  className?: string;
}) {
  const faces: Face[] = bestseller ? ["bestseller", "delivery"] : ["delivery"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (faces.length < 2) return;
    const id = setInterval(
      () => setIndex((p) => (p + 1) % faces.length),
      SWAP_INTERVAL,
    );
    return () => clearInterval(id);
  }, [faces.length]);

  const face = faces[index];

  return (
    // White-to-transparent gradient (solid left, fading out to the right).
    <div
      className={`flex items-center overflow-hidden rounded-l-xl bg-gradient-to-r from-white from-30% via-white/70 to-transparent py-1 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3.5 ${className ?? ""}`}
    >
      {/* key forces the subtle entry animation to replay on every swap */}
      <div key={index} className="animate-badge-swap flex items-center gap-1 sm:gap-1.5">
        {face === "bestseller" ? (
          <>
            <BoltIcon />
            <span className="whitespace-nowrap text-[11px] text-black sm:text-sm">
              {bestseller}
            </span>
          </>
        ) : (
          <>
            <DeliveryIcon />
            <span className="whitespace-nowrap text-[11px] font-bold italic text-[#e86e48] sm:text-sm">
              NOW
            </span>
            <span className="whitespace-nowrap text-[10px] italic text-black sm:text-[13px]">
              Get it by today
            </span>
          </>
        )}
      </div>
    </div>
  );
}
