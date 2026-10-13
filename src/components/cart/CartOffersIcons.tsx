/** Percent glyph for Offers & Coupons header (Figma 3734:51312). */
export function CartOffersPercentIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.6667 3.33333L3.33333 12.6667"
        stroke="#00A02B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.33333 6C5.25381 6 6 5.25381 6 4.33333C6 3.41286 5.25381 2.66667 4.33333 2.66667C3.41286 2.66667 2.66667 3.41286 2.66667 4.33333C2.66667 5.25381 3.41286 6 4.33333 6Z"
        stroke="#00A02B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6667 13.3333C12.5871 13.3333 13.3333 12.5871 13.3333 11.6667C13.3333 10.7462 12.5871 10 11.6667 10C10.7462 10 10 10.7462 10 11.6667C10 12.5871 10.7462 13.3333 11.6667 13.3333Z"
        stroke="#00A02B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Chevron for See all coupons (Figma 3734:51365). */
export function CartOffersChevronIcon({ className = 'size-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={12}
      height={12}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.25 10.5L8.75 7L5.25 3.5"
        stroke="#006045"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
