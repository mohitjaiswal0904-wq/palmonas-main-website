interface PlanOfPurchaseIconProps {
  className?: string;
}

export function PlanOfPurchaseIcon({ className = 'h-5 w-5' }: PlanOfPurchaseIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 5V10L13 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
