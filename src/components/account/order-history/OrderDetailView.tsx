'use client';

import Image from 'next/image';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
// import { OrderInvoiceButton } from '@/components/account/order-history/OrderInvoiceButton';
import { OrderStatusHeadline } from '@/components/account/order-history/OrderStatusHeadline';
import { AppLink } from '@/components/ui/AppLink';
import { Loader } from '@/components/ui/Loader';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { accountMessages } from '@/config/account/account.config';
import { useUserOrderDetail, useUserProfile } from '@/hooks/user';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import {
  formatOrderCurrency,
  formatOrderDeduction,
  formatOrderDisplayDate,
} from '@/lib/order/order-format';
import { cn } from '@/lib/utils/cn';
import type { UserOrderLineItem } from '@/types/user';

interface OrderDetailViewProps {
  orderId: string;
  backHref?: string;
}

/** Product thumbnail card; links to PDP by Shopify product id when present. */
function OrderLineItemCard({ item }: { item: UserOrderLineItem }) {
  const productId = item.productId.trim();
  const productHref = productId ? `/products/${encodeURIComponent(productId)}` : null;
  const card = (
    <article className="w-[132px] shrink-0 rounded-2xl bg-[#F5F5F5] p-3">
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl bg-white">
        {item.image ? (
          <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
        ) : null}
      </div>
      <p className="mt-3 line-clamp-2 text-xs font-normal text-[#1F1F1F]">{item.title}</p>
      <p className="mt-2 text-xs font-normal text-[#1F1F1F]">MRP {formatOrderCurrency(item.mrp)}</p>
    </article>
  );

  if (!productHref) {
    return card;
  }

  return (
    <AppLink
      href={productHref}
      className="block w-[132px] shrink-0"
      aria-label={accountMessages.orderHistory.a11y.viewProduct.replace('{name}', item.title)}
    >
      {card}
    </AppLink>
  );
}

export function OrderDetailView({
  orderId,
  backHref = ACCOUNT_ROUTES.orderHistory,
}: OrderDetailViewProps) {
  const { order, isLoading, error } = useUserOrderDetail(orderId);
  const { profile } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (error || !order) {
    return (
      <ResourceNotFound
        title="Order not found"
        description="This order could not be loaded."
        ctaHref={backHref}
        ctaLabel="Back to order history"
      />
    );
  }

  const recipientName = order.deliveredTo || profile?.firstName || '';
  const discountLabel = order.pricing.discountCode
    ? `Discount(${order.pricing.discountCode})`
    : 'Discount';

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title={order.orderNumber} backHref={backHref} />

      <section className="mt-6 rounded-2xl bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <OrderStatusHeadline status={order.status} deliveredTo={recipientName} />
          <p className="shrink-0 text-xs font-normal text-[#757575]">
            {formatOrderDisplayDate(order.orderDate)}
          </p>
        </div>

        <dl className="mt-4 space-y-2 text-sm font-normal text-[#151515]">
          <div className="flex gap-2">
            <dt className="shrink-0">Order ID :</dt>
            <dd>{order.orderNumber}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">Total Items :</dt>
            <dd>{order.totalItems}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">Payment method :</dt>
            <dd className="min-w-0 break-words">{order.paymentMethod}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">Delivery address :</dt>
            <dd className="min-w-0 break-words">{order.deliveryAddress}</dd>
          </div>
        </dl>
      </section>

      {order.lineItems.length ? (
        <section className="mt-6" aria-label="Ordered products">
          <div className={cn('flex gap-3 overflow-x-auto pb-1', HORIZONTAL_SCROLL_PASS_VERTICAL)}>
            {order.lineItems.map((item) => (
              <OrderLineItemCard key={`${item.productId}-${item.title}`} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 space-y-3 border-t border-[#EFEFEF] pt-4" aria-label="Price summary">
        <div className="flex items-center justify-between gap-3 text-sm text-[#151515]">
          <span>Sub total</span>
          <span>{formatOrderCurrency(order.pricing.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-[#151515]">
          <span>{discountLabel}</span>
          <span>{formatOrderDeduction(order.pricing.discountAmount)}</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-[#151515]">
          <span>Shipping cost</span>
          <span>{formatOrderCurrency(order.pricing.shippingCost)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-[#151515]">
          <span>SGST 1.5%</span>
          <span>{formatOrderCurrency(order.pricing.sgst)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-[#151515]">
          <span>CGST 1.5%</span>
          <span>{formatOrderCurrency(order.pricing.cgst)}</span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EFEFEF] pt-4">
          <span className="text-base font-bold text-[#151515]">Grand total</span>
          <span className="text-base font-bold text-[#151515]">
            {formatOrderCurrency(order.pricing.grandTotal)}
          </span>
        </div>

        {/* <OrderInvoiceButton orderId={orderId} status={order.status} /> */}
      </section>
    </div>
  );
}
