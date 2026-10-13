'use client';

import type { SVGProps } from 'react';

type AccountIconProps = SVGProps<SVGSVGElement>;

/**
 * Header account icon — 24 viewBox + 1.25 stroke to match SearchIcon / HeartMenu / cart weight.
 */
export function AccountIcon({ className = 'h-5 w-5 shrink-0', ...props }: AccountIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M11.6557 21.3679C17.0198 21.3679 21.3683 17.0194 21.3683 11.6553C21.3683 6.2911 17.0198 1.9426 11.6557 1.9426C6.2915 1.9426 1.943 6.2911 1.943 11.6553C1.943 17.0194 6.2915 21.3679 11.6557 21.3679Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6557 12.6264C13.265 12.6264 14.5695 11.3218 14.5695 9.7126C14.5695 8.1034 13.265 6.7988 11.6557 6.7988C10.0465 6.7988 8.7419 8.1034 8.7419 9.7126C8.7419 11.3218 10.0465 12.6264 11.6557 12.6264Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.7992 20.0681V18.4538C6.7992 17.9386 7.0039 17.4446 7.3682 17.0803C7.7325 16.716 8.2266 16.5114 8.7418 16.5114H14.5694C15.0846 16.5114 15.5786 16.716 15.943 17.0803C16.3072 17.4446 16.5119 17.9386 16.5119 18.4538V20.0681"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
