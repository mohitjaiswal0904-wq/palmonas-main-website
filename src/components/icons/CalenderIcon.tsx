interface CalenderIconProps {
  className?: string;
}

/** Calendar glyph used on POP active-plan entry points. */
export function CalenderIcon({ className = 'size-10 shrink-0' }: CalenderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 47 47"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#151515"
        d="M0 23.5C0 10.521 10.521 0 23.5 0S47 10.521 47 23.5 36.479 47 23.5 47 0 36.479 0 23.5Z"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.958}
        d="M19.578 13.708v3.917M27.414 13.708v3.917M30.35 15.667H16.642a1.958 1.958 0 0 0-1.958 1.959v13.708c0 1.082.876 1.958 1.958 1.958H30.35a1.958 1.958 0 0 0 1.959-1.958V17.626a1.958 1.958 0 0 0-1.959-1.959ZM14.684 21.542h17.625"
      />
    </svg>
  );
}
