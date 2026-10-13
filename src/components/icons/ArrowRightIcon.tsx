interface ArrowRightIconProps {
  className?: string;
}

export function ArrowRightIcon({ className = 'h-3.5 w-3.5 shrink-0' }: ArrowRightIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
