import {
  getOrderStatusHeadlineParts,
  getOrderStatusRecipientTextClass,
  getOrderStatusTextClass,
  getOrderStatusTone,
} from '@/lib/order/order-format';

interface OrderStatusHeadlineProps {
  status: string;
  deliveredTo?: string;
  className?: string;
}

/** Renders order status headline with green prefix and black recipient name when delivered. */
export function OrderStatusHeadline({
  status,
  deliveredTo = '',
  className = 'text-sm font-bold',
}: OrderStatusHeadlineProps) {
  const statusTone = getOrderStatusTone(status);
  const { prefix, recipientName } = getOrderStatusHeadlineParts(status, deliveredTo);

  return (
    <p className={className}>
      <span className={getOrderStatusTextClass(statusTone)}>{prefix}</span>
      {recipientName ? (
        <>
          {' '}
          <span className={getOrderStatusRecipientTextClass()}>{recipientName}</span>
        </>
      ) : null}
    </p>
  );
}
