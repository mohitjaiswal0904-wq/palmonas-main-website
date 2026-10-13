import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { OrderDetailView } from '@/components/account/order-history/OrderDetailView';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Order Details',
  path: '/account/order-history',
  noIndex: true,
});

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderHistoryDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;

  return <OrderDetailView orderId={orderId} backHref={ACCOUNT_ROUTES.orderHistory} />;
}
