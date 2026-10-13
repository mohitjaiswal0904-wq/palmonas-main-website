import Link from 'next/link';

import { orderHistoryDetailPath } from '@/components/account/common/account-routes';
import { OrderStatusHeadline } from '@/components/account/order-history/OrderStatusHeadline';
import { formatOrderDisplayDate } from '@/lib/order/order-format';
import type { UserOrderSummary } from '@/types/user';

interface OrderHistoryCardProps {
  order: UserOrderSummary;
}

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  return (
    <article className="rounded-2xl border border-[#EFEFEF] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <OrderStatusHeadline status={order.status} deliveredTo={order.deliveredTo} />
        <p className="shrink-0 text-xs font-normal text-[#757575]">
          {formatOrderDisplayDate(order.orderDate)}
        </p>
      </div>

      <dl className="tab:mt-4 mt-2 space-y-0.5 text-sm font-normal text-[#151515]">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Order ID :</dt>
          <dd className="tracking-wide">{order.orderNumber}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="tab:text-base text-xs font-medium">Total Items :</dt>
          <dd className="tab:text-base text-xs">{order.totalItems}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">Payment method :</dt>
          <dd className="min-w-0 break-words">{order.paymentMethod}</dd>
        </div>
      </dl>

      <Link
        href={orderHistoryDetailPath(order.id)}
        className="tab:mt-4 mt-2 inline-block text-sm font-bold text-[#151515] underline underline-offset-2"
        aria-label={`View details for order ${order.orderNumber}`}
      >
        View Details
      </Link>
    </article>
  );
}
