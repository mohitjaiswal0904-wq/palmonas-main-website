/** Order history and detail display helpers. */

export type OrderStatusTone = 'delivered' | 'cancelled' | 'in_transit' | 'default';

/** Formats API order date (`YYYY-MM-DD`) as `DD/MM/YYYY`. */
export function formatOrderDisplayDate(orderDate: string): string {
  const [year, month, day] = orderDate.split('-');

  if (!year || !month || !day) {
    return orderDate;
  }

  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/** Returns the first name from a full name string. */
export function getOrderRecipientFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** Headline copy split for two-tone delivered status rendering. */
export interface OrderStatusHeadlineParts {
  prefix: string;
  recipientName: string | null;
}

/**
 * Builds split status headline parts for delivered orders with a recipient name.
 *
 * @param status - Normalised order status from API.
 * @param deliveredTo - Recipient name when available.
 */
export function getOrderStatusHeadlineParts(
  status: string,
  deliveredTo = '',
): OrderStatusHeadlineParts {
  const normalised = status.toLowerCase().replace(/\s+/g, '_');
  const firstName = deliveredTo ? getOrderRecipientFirstName(deliveredTo) : '';

  if (normalised === 'delivered') {
    return firstName
      ? { prefix: 'Delivered to', recipientName: firstName }
      : { prefix: 'Delivered', recipientName: null };
  }

  if (normalised === 'cancelled') {
    return { prefix: 'Cancelled', recipientName: null };
  }

  if (normalised === 'in_transit' || normalised === 'in-transit') {
    return { prefix: 'In Transit', recipientName: null };
  }

  return {
    prefix: status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    recipientName: null,
  };
}

/**
 * Builds the status headline shown on order cards and detail pages.
 *
 * @param status - Normalised order status from API.
 * @param deliveredTo - Recipient name when available.
 */
export function getOrderStatusHeadline(status: string, deliveredTo = ''): string {
  const { prefix, recipientName } = getOrderStatusHeadlineParts(status, deliveredTo);

  return recipientName ? `${prefix} ${recipientName}` : prefix;
}

/** Returns true when the order status is delivered. */
export function isOrderDelivered(status: string): boolean {
  return getOrderStatusTone(status) === 'delivered';
}

/** Maps order status to UI colour tone. */
export function getOrderStatusTone(status: string): OrderStatusTone {
  const normalised = status.toLowerCase().replace(/\s+/g, '_');

  if (normalised === 'delivered') {
    return 'delivered';
  }

  if (normalised === 'cancelled') {
    return 'cancelled';
  }

  if (normalised === 'in_transit' || normalised === 'in-transit') {
    return 'in_transit';
  }

  return 'default';
}

/** Tailwind text colour class for an order status tone. */
export function getOrderStatusTextClass(tone: OrderStatusTone): string {
  switch (tone) {
    case 'delivered':
      return 'text-[#2E7D32]';
    case 'cancelled':
      return 'text-[#C62828]';
    case 'in_transit':
      return 'text-[#E65100]';
    default:
      return 'text-[#151515]';
  }
}

/** Tailwind text colour class for delivered recipient names. */
export function getOrderStatusRecipientTextClass(): string {
  return 'text-[#151515]';
}

/** Formats rupee amounts for order pricing rows. */
export function formatOrderCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats negative pricing rows such as discounts and wallet deductions. */
export function formatOrderDeduction(amount: number): string {
  if (amount <= 0) {
    return formatOrderCurrency(amount);
  }

  return `-${formatOrderCurrency(amount)}`;
}
