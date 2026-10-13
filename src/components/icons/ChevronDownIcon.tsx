interface ChevronDownIconProps {
  className?: string;
}

export function ChevronDownIcon({
  className = 'h-1.5 w-2.5 shrink-0 text-stone-900',
}: ChevronDownIconProps) {
  return (
    <svg viewBox="0 0 10 6" className={className} aria-hidden="true">
      <path d="M0 0h10L5 6Z" fill="currentColor" />
    </svg>
  );
}
