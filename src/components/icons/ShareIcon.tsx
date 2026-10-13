interface ShareIconProps {
  className?: string;
}

export function ShareIcon({ className = 'h-5 w-5 text-stone-700' }: ShareIconProps) {
  return (
    <svg
      className={className}
      width="39"
      height="39"
      viewBox="0 0 39 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="39" height="39" rx="19.5" fill="white" />
      <path
        d="M26 16C27.6569 16 29 14.6569 29 13C29 11.3431 27.6569 10 26 10C24.3431 10 23 11.3431 23 13C23 14.6569 24.3431 16 26 16Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 23C15.6569 23 17 21.6569 17 20C17 18.3431 15.6569 17 14 17C12.3431 17 11 18.3431 11 20C11 21.6569 12.3431 23 14 23Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 30C27.6569 30 29 28.6569 29 27C29 25.3431 27.6569 24 26 24C24.3431 24 23 25.3431 23 27C23 28.6569 24.3431 30 26 30Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.59 21.5098L23.42 25.4898"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.41 14.5098L16.59 18.4898"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
