/**
 * Pulse placeholder shown while an account panel transition settles.
 */
export function AccountPanelSkeleton() {
  return (
    <div className="w-full space-y-4" aria-busy="true" aria-label="Loading account section">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
        <div className="h-5 w-40 animate-pulse rounded bg-stone-200" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-stone-100" />
      <div className="h-28 animate-pulse rounded-2xl bg-stone-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
    </div>
  );
}
