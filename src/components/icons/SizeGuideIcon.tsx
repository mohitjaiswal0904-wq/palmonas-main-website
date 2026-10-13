interface SizeGuideIconProps {
  className?: string;
}

export function SizeGuideIcon({ className = 'h-4 w-4 shrink-0' }: SizeGuideIconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.0566 16.3213V13.0419"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4092 16.3213V13.0419"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.7618 6.52856H4.35254"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.7617 8.7051V4.35278"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.35254 8.7051V4.35278"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.70508 16.3213V13.0419"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.762 13.0571H4.35273C3.7518 13.0571 3.26465 13.5443 3.26465 14.1452V19.5856C3.26465 20.1865 3.7518 20.6737 4.35273 20.6737H21.762C22.3629 20.6737 22.8501 20.1865 22.8501 19.5856V14.1452C22.8501 13.5443 22.3629 13.0571 21.762 13.0571Z"
        stroke="currentColor"
        strokeWidth="2.17616"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
