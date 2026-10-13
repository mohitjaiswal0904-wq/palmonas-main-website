/**
 * A marigold used beside the diya under section titles.
 */
export function DiwaliMarigold({ className = 'h-5 w-5 shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="4" fill="#F6C445" />
      <circle cx="14" cy="6" r="3.2" fill="#E07A1F" />
      <circle cx="20.5" cy="9" r="3.2" fill="#F4A261" />
      <circle cx="22" cy="16" r="3.2" fill="#E07A1F" />
      <circle cx="17" cy="21.5" r="3.2" fill="#F4A261" />
      <circle cx="11" cy="21.5" r="3.2" fill="#E07A1F" />
      <circle cx="6" cy="16" r="3.2" fill="#F4A261" />
      <circle cx="7.5" cy="9" r="3.2" fill="#E07A1F" />
    </svg>
  );
}
