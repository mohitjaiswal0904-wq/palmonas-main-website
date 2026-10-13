'use client';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { OrderHistoryCard } from '@/components/account/order-history/OrderHistoryCard';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useUserOrders } from '@/hooks/user';

export function OrdersList() {
  const { orders, isLoading, error } = useUserOrders({ limit: 50 });

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  if (error) {
    return (
      <ResourceNotFound
        title="Unable to load orders"
        description="Please sign in and try again."
        ctaHref="/account"
        ctaLabel="Back to account"
      />
    );
  }

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title="Order History" />

      {!orders?.length ? (
        <p className="mt-6 text-sm font-normal text-[#757575]">
          Your orders will appear here after checkout.
        </p>
      ) : (
        <ul className="mt-6 space-y-4" aria-label="Order history">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderHistoryCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
