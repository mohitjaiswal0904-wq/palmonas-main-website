interface AdjustableRingsIconProps {
  className?: string;
}

/** Overlapping rings used for the adjustable-rings demifine USP. */
export function AdjustableRingsIcon({ className = 'h-10 w-10' }: AdjustableRingsIconProps) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="13" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="15" cy="13" r="6.25" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
