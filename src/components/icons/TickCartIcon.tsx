interface TickCartIconProps {
  className?: string;
}

export function TickCartIcon({ className = 'h-10 w-14 text-[#c9a96e]' }: TickCartIconProps) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.2 3.35999L5.03999 9.51999L2.23999 6.71999"
        strokeWidth="1.12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
