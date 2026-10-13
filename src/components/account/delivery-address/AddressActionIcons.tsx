interface AddressEditIconProps {
  className?: string;
}

export function AddressEditIcon({ className = 'h-4 w-4' }: AddressEditIconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
