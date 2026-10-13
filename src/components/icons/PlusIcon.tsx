interface PlusIconProps {
  className?: string;
}

export function PlusIcon({ className = 'h-[13.438px] w-[13.438px]' }: PlusIconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M14 5.5v17M5.5 14h17" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}
