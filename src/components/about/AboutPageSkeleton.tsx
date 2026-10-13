/** Lightweight about-page skeleton for soft navigations — no header/footer chrome. */
export function AboutPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading about page" className="bg-white">
      <div className="mx-auto aspect-[1920/762] w-full max-w-[1920px] animate-pulse bg-stone-100" />
      <div className="mx-auto max-w-[1617px] space-y-4 px-4 py-8">
        <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-stone-100" />
        <div className="mx-auto h-24 w-full max-w-[1583px] animate-pulse rounded bg-stone-100" />
        <div className="laptop:grid laptop:grid-cols-2 laptop:gap-8 laptop:pt-14 space-y-8 pt-10">
          <div className="aspect-[780/516] w-full animate-pulse bg-stone-100" />
          <div className="space-y-4 px-4 py-6">
            <div className="mx-auto h-10 w-1/2 animate-pulse rounded bg-stone-100" />
            <div className="h-32 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
