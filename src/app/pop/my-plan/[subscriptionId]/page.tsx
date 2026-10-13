import { Footer, Header } from '@/components/layout';
import { PopPlanDetailContent } from '@/components/pop';
import { buildMetadata } from '@/lib/seo/build-metadata';

interface PopPlanDetailPageProps {
  params: Promise<{ subscriptionId: string }>;
}

export async function generateMetadata({ params }: PopPlanDetailPageProps) {
  const { subscriptionId } = await params;

  return buildMetadata({
    title: 'Plan Details',
    path: `/pop/my-plan/${subscriptionId}`,
    description: 'View your Palmonas POP plan instalments and payment history.',
    noIndex: true,
  });
}

/** POP plan detail — data loads client-side via `usePopSubscriptionDetail`. */
export default async function PopPlanDetailPage({ params }: PopPlanDetailPageProps) {
  const { subscriptionId } = await params;

  return (
    <>
      <Header />
      <main>
        <PopPlanDetailContent subscriptionId={subscriptionId} />
      </main>
      <Footer />
    </>
  );
}
