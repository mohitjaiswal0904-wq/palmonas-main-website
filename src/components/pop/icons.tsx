/** Icons for the Plan of Purchase (POP) landing page. Inherit currentColor. */

type IconProps = { className?: string };

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function EnrollIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

export function CalendarPayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M12 14h2a1.5 1.5 0 0 1 0 3h-2v-3Zm0 0v5" />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M2 7h20v5H2zM12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
    </svg>
  );
}

export function ShopBagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="12" />
      <path
        d="m7 12.5 3 3 7-7"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GemIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M6 3h12l4 6-10 12L2 9Z" />
      <path d="M2 9h20M12 3 8 9l4 12 4-12-4-6" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </svg>
  );
}

export function RedeemIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3M12 17h.01" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s} aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
