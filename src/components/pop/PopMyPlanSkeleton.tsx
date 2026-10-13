/** Loading skeleton for POP my-plans list. */
export function PopMyPlanSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-4 sm:gap-6"
      aria-busy="true"
      aria-label="Loading saving plans"
    >
      <div className="h-9 w-48 animate-pulse rounded-md bg-[var(--pop-border)] sm:h-10 sm:w-64" />
      <div className="h-44 animate-pulse rounded-2xl bg-[var(--pop-border)] sm:h-52 sm:rounded-[19px]" />
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--pop-border)] sm:h-44 sm:rounded-[19px]" />
    </div>
  );
}
