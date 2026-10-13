interface WalletIconProps {
  className?: string;
}

export function WalletIcon({ className = 'h-5 w-5' }: WalletIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 6.5C3 5.67157 3.67157 5 4.5 5H15.5C16.3284 5 17 5.67157 17 6.5V14.5C17 15.3284 16.3284 16 15.5 16H4.5C3.67157 16 3 15.3284 3 14.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M14 11.5H14.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 8H17" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
