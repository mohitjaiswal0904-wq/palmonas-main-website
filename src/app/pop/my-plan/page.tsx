import { Footer, Header } from '@/components/layout';
import { PopMyPlanContent } from '@/components/pop';
import { isAppError } from '@/lib/errors';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { listPopSubscriptionsServer } from '@/services/server/pop.service.server';
import type { PopPlanListResult } from '@/types/pop/subscription-list';

export const metadata = buildMetadata({
  title: 'All Saving Plans',
  path: '/pop/my-plan',
  description: 'View your Palmonas POP plan instalments and savings progress.',
  noIndex: true,
});

export default async function PopMyPlanPage() {
  let initialData: PopPlanListResult | undefined;

  try {
    initialData = await listPopSubscriptionsServer({ limit: 50, offset: 0 });
  } catch (err) {
    if (!isAppError(err) || (err.code !== 'UNAUTHORISED' && err.code !== 'FORBIDDEN')) {
      throw err;
    }
  }

  return (
    <>
      <Header />
      <main>
        <PopMyPlanContent initialData={initialData} />
      </main>
      <Footer />
    </>
  );
}
