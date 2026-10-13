import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { StoresPageContent } from '@/components/stores';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { getStores } from '@/services/server/store.service.server';

export const metadata = buildMetadata({
  title: 'Palmonas Stores',
  path: '/palmonas-stores',
  description:
    'Find Palmonas retail stores near you and explore Demifine® jewellery collections in person.',
});

async function PalmonasStoresPageBody() {
  const initialStores = await getStores({
    images: true,
    limit: DEFAULT_PAGE_SIZE,
    page: 1,
  }).catch(() => null);

  return <StoresPageContent initialStores={initialStores} />;
}

export default function PalmonasStoresPage() {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading stores" />}>
      <PalmonasStoresPageBody />
    </StreamingPageShell>
  );
}
