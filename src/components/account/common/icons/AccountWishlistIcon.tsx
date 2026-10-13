interface AccountWishlistIconProps {
  className?: string;
}

export function AccountWishlistIcon({ className = 'h-5 w-5' }: AccountWishlistIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 16.5L8.74 15.35C4.6 11.66 2 9.28 2 6.5C2 4.29 3.79 2.5 6 2.5C7.24 2.5 8.42 3.08 9.17 4.02L10 5L10.83 4.02C11.58 3.08 12.76 2.5 14 2.5C16.21 2.5 18 4.29 18 6.5C18 9.28 15.4 11.66 11.26 15.35L10 16.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
