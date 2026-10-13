import type {
  CreateUserAddressApiInput,
  UpdateUserAddressApiInput,
  UpdateUserDetailsApiInput,
  UserAddressApi,
  UserApiEnvelope,
  UserDetailsApi,
  UserOrderApi,
  UserOrderDetailApi,
  UserOrderInvoiceApi,
  UserOrderInvoiceAddressApi,
  UserOrdersListApi,
  UserWalletApi,
  WalletCreditLogApi,
  WalletTransactionsApi,
} from '@/types/user/user.api';
import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
  UpdateUserProfileInput,
  UserAddress,
  UserOrderDetail,
  UserOrderInvoice,
  UserOrderSummary,
  UserProfile,
  UserWallet,
  WalletTransaction,
} from '@/types/user/user.types';

const PAISE_PER_RUPEE = 100;

// const CREDIT_KEYWORDS = /received|added|bonus|reward|refund|credit|cashback/i;
// const DEBIT_KEYWORDS = /spent|order|payment|purchase|deduct/i;

function getWalletTransactionTitle(comment: string, amountPaise: number): string {
  if (amountPaise > 0) {
    return 'Money Received:';
  }

  if (amountPaise < 0) {
    return 'Money Spent';
  }

  return amountPaise < 0 ? 'Money Spent' : 'Money Received';
}

function parseWalletTransactionDateTime(createdAt: string): {
  dateLabel: string;
  timeLabel: string;
} {
  const parsed = Date.parse(createdAt);

  if (Number.isNaN(parsed)) {
    return {
      dateLabel: createdAt || '—',
      timeLabel: '',
    };
  }

  const date = new Date(parsed);

  return {
    dateLabel: date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    timeLabel: date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

/**
 * Unwraps Palmonas `{ status, message, data }` API envelopes.
 *
 * @param envelope - Raw API response body.
 * @returns Inner `data` payload.
 */
export function unwrapUserEnvelope<T>(envelope: UserApiEnvelope<T>): T {
  return envelope.data;
}

export function transformUserProfile(raw: UserDetailsApi): UserProfile {
  return {
    id: String(raw.id),
    email: raw.email,
    firstName: raw.first_name ?? '',
    lastName: raw.last_name ?? '',
    phone: raw.phone ?? '',
    verifiedEmail: Boolean(raw.verified_email),
    acceptsMarketing: Boolean(raw.accepts_marketing),
    ordersCount: raw.orders_count ?? 0,
    totalSpent: raw.total_spent ?? '0',
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function transformUserAddress(raw: UserAddressApi): UserAddress {
  return {
    id: String(raw.id),
    firstName: raw.first_name,
    lastName: raw.last_name,
    company: raw.company ?? null,
    addressLine1: raw.address1,
    addressLine2: raw.address2 ?? null,
    city: raw.city,
    province: raw.province,
    country: raw.country,
    zip: raw.zip,
    phone: raw.phone ?? '',
    fullName: raw.name ?? `${raw.first_name} ${raw.last_name}`.trim(),
    isDefault: Boolean(raw.default),
  };
}

export function transformUserOrder(raw: UserOrderApi): UserOrderSummary {
  return {
    id: raw.id,
    orderNumber: raw.orderId,
    deliveredTo: raw.deliveredTo,
    totalItems: raw.totalItems,
    paymentMethod: raw.paymentMethod,
    orderDate: raw.orderDate,
    status: raw.status,
    thumbnail: raw.thumbnail,
  };
}

export function transformUserOrdersList(raw: UserOrdersListApi): UserOrderSummary[] {
  return raw.data.map(transformUserOrder);
}

function formatDeliveryAddress(raw: UserOrderDetailApi['deliveryAddress']): string {
  const parts = [raw.addressLine, raw.lane, raw.city, raw.state, raw.pincode].filter(Boolean);

  return parts.join(', ');
}

export function transformUserOrderDetail(raw: UserOrderDetailApi): UserOrderDetail {
  return {
    orderNumber: raw.orderId,
    orderDate: raw.orderDate,
    totalItems: raw.totalItems,
    paymentMethod: raw.paymentMethod,
    status: raw.status,
    deliveredTo: raw.deliveredTo ?? '',
    deliveryAddress: formatDeliveryAddress(raw.deliveryAddress),
    lineItems: raw.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      quantity: item.qty,
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
      image: item.image,
    })),
    pricing: {
      subtotal: raw.pricing.subtotal,
      discountCode: raw.pricing.discount.code,
      discountAmount: raw.pricing.discount.amount,
      walletAmount: raw.pricing.walletAmount,
      shippingCost: raw.pricing.shippingCost,
      sgst: raw.pricing.taxes.sgst,
      cgst: raw.pricing.taxes.cgst,
      grandTotal: raw.pricing.grandTotal,
    },
    invoiceUrl: raw.invoiceUrl,
  };
}

function formatInvoiceAddress(raw: UserOrderInvoiceAddressApi | undefined): string {
  if (!raw) {
    return '';
  }

  const name = raw.name ?? [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim();
  const parts = [
    name,
    raw.addressLine,
    raw.lane,
    raw.city,
    raw.state,
    raw.pincode,
    raw.country,
  ].filter(Boolean);

  return parts.join(', ');
}

function transformInvoicePricing(raw: UserOrderInvoiceApi['pricing']): UserOrderInvoice['pricing'] {
  const discount =
    typeof raw.discount === 'number'
      ? { code: '', amount: raw.discount }
      : {
          code: raw.discount?.code ?? '',
          amount: raw.discount?.amount ?? 0,
        };

  return {
    subtotal: raw.subtotal,
    discountCode: discount.code,
    discountAmount: discount.amount,
    walletAmount: raw.walletAmount ?? 0,
    shippingCost: raw.shippingCost ?? 0,
    sgst: raw.taxes?.sgst ?? 0,
    cgst: raw.taxes?.cgst ?? 0,
    grandTotal: raw.grandTotal,
  };
}

/** Maps invoice API payload into printable order invoice DTO. */
export function transformUserOrderInvoice(raw: UserOrderInvoiceApi): UserOrderInvoice {
  return {
    orderNumber: raw.orderId,
    orderName: raw.orderName ?? raw.orderId,
    orderDate: raw.orderDate,
    invoiceUrl: raw.invoiceUrl ?? '',
    currency: raw.currency ?? 'INR',
    email: raw.email ?? raw.customer?.email ?? '',
    customer: {
      name: raw.customer?.name ?? '',
      email: raw.customer?.email ?? raw.email ?? '',
      phone: raw.customer?.phone ?? '',
    },
    billingAddress: formatInvoiceAddress(raw.billingAddress),
    deliveryAddress: formatInvoiceAddress(raw.deliveryAddress),
    lineItems: raw.items.map((item) => ({
      title: item.title,
      quantity: item.qty,
      sku: item.sku ?? '',
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
    })),
    pricing: transformInvoicePricing(raw.pricing),
    paymentMethod: raw.paymentMethod,
    status: raw.status,
  };
}

export function transformUserWallet(raw: UserWalletApi): UserWallet {
  return {
    email: raw.customer_email,
    phone: raw.phone_number,
    name: raw.name,
    gender: raw.gender,
    birthdate: raw.birthdate,
    loyaltyPointsBalance: raw.loyalty_points_balance,
    refundStoreCreditBalance: raw.refund_store_credit_balance,
    referralCode: raw.referral_code,
    shopifyCustomerId: String(raw.shopify_customer_id),
    shopifyCreatedAt: raw.shopify_created_at,
  };
}

export function transformWalletTransaction(raw: WalletCreditLogApi): WalletTransaction {
  const amountPaise = raw.credits;
  const amountRupees = amountPaise / PAISE_PER_RUPEE;
  const type: WalletTransaction['type'] = amountPaise >= 0 ? 'credit' : 'debit';
  const timestamp = raw.created_at ?? raw.created_at_human ?? '';
  const { dateLabel, timeLabel } = parseWalletTransactionDateTime(timestamp);

  return {
    id: String(raw.id),
    amountPaise,
    amountRupees,
    description: raw.comment,
    title: getWalletTransactionTitle(raw.comment, amountPaise),
    type,
    dateLabel,
    timeLabel,
  };
}

export function transformWalletTransactions(raw: WalletTransactionsApi): WalletTransaction[] {
  return (raw.customer.credit_log ?? []).map(transformWalletTransaction);
}

export function toUpdateUserDetailsApi(input: UpdateUserProfileInput): UpdateUserDetailsApiInput {
  return {
    ...(input.firstName !== undefined && { first_name: input.firstName }),
    ...(input.lastName !== undefined && { last_name: input.lastName }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.acceptsMarketing !== undefined && { accepts_marketing: input.acceptsMarketing }),
  };
}

export function toCreateUserAddressApi(input: CreateUserAddressInput): CreateUserAddressApiInput {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    address1: input.addressLine1,
    ...(input.company && { company: input.company }),
    ...(input.addressLine2 && { address2: input.addressLine2 }),
    city: input.city,
    province: input.province,
    country: input.country,
    zip: input.zip,
    ...(input.phone && { phone: input.phone }),
    ...(input.isDefault !== undefined && { is_default: input.isDefault }),
  };
}

export function toUpdateUserAddressApi(input: UpdateUserAddressInput): UpdateUserAddressApiInput {
  return {
    ...(input.firstName !== undefined && { first_name: input.firstName }),
    ...(input.lastName !== undefined && { last_name: input.lastName }),
    ...(input.company !== undefined && { company: input.company }),
    ...(input.addressLine1 !== undefined && { address1: input.addressLine1 }),
    ...(input.addressLine2 !== undefined && { address2: input.addressLine2 }),
    ...(input.city !== undefined && { city: input.city }),
    ...(input.province !== undefined && { province: input.province }),
    ...(input.country !== undefined && { country: input.country }),
    ...(input.zip !== undefined && { zip: input.zip }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.isDefault !== undefined && { is_default: input.isDefault }),
  };
}
