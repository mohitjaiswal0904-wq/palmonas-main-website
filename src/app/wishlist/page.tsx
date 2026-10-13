import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { WishlistContent } from '@/components/wishlist/WishlistContent';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Wishlist',
  path: '/wishlist',
  noIndex: true,
});

/** No route `loading.tsx` — swipe-back must not replace the last wishlist with a chrome skeleton. */
export default function WishlistPage() {
  return (
    <StreamingPageShell
      showFooter={false}
      mainFallback={<MainContentSkeleton ariaLabel="Loading wishlist" />}
    >
      <main className="w-full">
        <WishlistContent />
      </main>
    </StreamingPageShell>
  );
}
