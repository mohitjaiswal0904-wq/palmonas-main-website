export function ProductCardSkeleton() {
  return (
    <article className="relative flex flex-col gap-3 overflow-hidden border-r border-b border-[#0000001A] bg-white pb-3">
      <div className="aspect-square w-full animate-pulse bg-stone-100" />
      <div className="space-y-3 px-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
            <div className="h-3 w-12 animate-pulse rounded bg-stone-100" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100" />
        </div>
      </div>
    </article>
  );
}
