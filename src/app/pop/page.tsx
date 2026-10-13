import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { PopPageContent } from '@/components/pop';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { listPopSubscriptionsServer } from '@/services/server/pop.service.server';
import type { PopPlanListResult } from '@/types/pop/subscription-list';

export const metadata = buildMetadata({
  title: 'Pay 5, Get 6',
  path: '/pop',
  description:
    'Join the Palmonas POP savings plan — pay for 5 months and get the 6th month free toward your dream jewellery.',
});

async function PopPageBody() {
  let initialSubscriptions: PopPlanListResult | undefined;

  try {
    initialSubscriptions = await listPopSubscriptionsServer({ limit: 50, offset: 0 });
  } catch {
    // Optional SSR enrichment — auth failures and backend outages must not block the POP page.
  }

  return (
    <main>
      <PopPageContent initialSubscriptions={initialSubscriptions} />
    </main>
  );
}

export default function PopPage() {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading POP plan" />}>
      <PopPageBody />
    </StreamingPageShell>
  );
}
