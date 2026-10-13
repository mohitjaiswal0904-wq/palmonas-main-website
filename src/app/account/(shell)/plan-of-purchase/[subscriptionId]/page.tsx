import { PopSubscriptionDetailView } from '@/components/account/plan-of-purchase/PopSubscriptionDetailView';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Plan Details',
  path: '/account/plan-of-purchase',
  noIndex: true,
});

interface PopSubscriptionDetailPageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function PopSubscriptionDetailPage({
  params,
}: PopSubscriptionDetailPageProps) {
  const { subscriptionId } = await params;

  return <PopSubscriptionDetailView subscriptionId={subscriptionId} />;
}
