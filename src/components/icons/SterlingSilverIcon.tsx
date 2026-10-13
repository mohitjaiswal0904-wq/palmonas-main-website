interface SterlingSilverIconProps {
  className?: string;
}

/** 925 mark used for sterling-silver demifine USPs. */
export function SterlingSilverIcon({ className = 'h-10 w-10' }: SterlingSilverIconProps) {
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
      <circle cx="12.5" cy="12.5" r="9.25" stroke="currentColor" strokeWidth="1.25" />
      <text x="12.5" y="16.2" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="600">
        925
      </text>
    </svg>
  );
}
