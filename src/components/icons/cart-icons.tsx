interface CartIconProps {
  className?: string;
}

/** Left arrow with tail — Figma cart header (963:73870 / 964:83906). */
export function CartBackIcon({ className = 'h-4 w-4' }: CartIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M13 8H4M4 8L8 4M4 8L8 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Open shopping-bag icon for empty cart state. */
export function CartBagIcon({ className = 'h-4 w-4 shrink-0' }: CartIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8V6.5a4 4 0 0 1 8 0V8" />
      <path d="M4.5 8h11l-1 10.5H5.5L4.5 8Z" />
    </svg>
  );
}

/** Cart line-item delete/bin icon — Figma 963:56722. */
export function TrashIcon({ className = 'h-[22px] w-[22px]' }: CartIconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <path
        d="M2.75 5.5H19.28"
        stroke="currentColor"
        strokeWidth="1.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.44 5.5V18.36C17.44 19.28 16.52 20.2 15.61 20.2H6.43C5.51 20.2 4.59 19.28 4.59 18.36V5.5"
        stroke="currentColor"
        strokeWidth="1.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.34 5.51V3.67C7.34 2.75 8.26 1.84 9.18 1.84H12.85C13.77 1.84 14.69 2.75 14.69 3.67V5.51"
        stroke="currentColor"
        strokeWidth="1.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.18 10.1V15.61"
        stroke="currentColor"
        strokeWidth="1.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.85 10.1V15.61"
        stroke="currentColor"
        strokeWidth="1.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Dismiss/close X — Figma gift-card applied banner. */
export function CartCloseIcon({ className = 'h-4 w-4' }: CartIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4L12 12"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
