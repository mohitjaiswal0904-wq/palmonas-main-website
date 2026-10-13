export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  verifiedEmail: boolean;
  acceptsMarketing: boolean;
  ordersCount: number;
  totalSpent: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  fullName: string;
  isDefault: boolean;
}

export interface UserOrderSummary {
  id: string;
  orderNumber: string;
  deliveredTo: string;
  totalItems: number;
  paymentMethod: string;
  orderDate: string;
  status: string;
  thumbnail: string;
}

export interface UserOrderLineItem {
  productId: string;
  title: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  image: string;
}

export interface UserOrderPricing {
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  walletAmount: number;
  shippingCost: number;
  sgst: number;
  cgst: number;
  grandTotal: number;
}

export interface UserOrderDetail {
  orderNumber: string;
  orderDate: string;
  totalItems: number;
  paymentMethod: string;
  status: string;
  deliveredTo: string;
  deliveryAddress: string;
  lineItems: UserOrderLineItem[];
  pricing: UserOrderPricing;
  invoiceUrl: string;
}

export interface UserOrderInvoiceCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface UserOrderInvoiceLineItem {
  title: string;
  quantity: number;
  sku: string;
  mrp: number;
  sellingPrice: number;
}

export interface UserOrderInvoicePricing {
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  walletAmount: number;
  shippingCost: number;
  sgst: number;
  cgst: number;
  grandTotal: number;
}

export interface UserOrderInvoice {
  orderNumber: string;
  orderName: string;
  orderDate: string;
  invoiceUrl: string;
  currency: string;
  email: string;
  customer: UserOrderInvoiceCustomer;
  billingAddress: string;
  deliveryAddress: string;
  lineItems: UserOrderInvoiceLineItem[];
  pricing: UserOrderInvoicePricing;
  paymentMethod: string;
  status: string;
}

export interface UserWallet {
  email: string;
  phone: string;
  name: string;
  gender: string;
  birthdate: string;
  loyaltyPointsBalance: number;
  refundStoreCreditBalance: number;
  referralCode: string;
  shopifyCustomerId: string;
  shopifyCreatedAt: string;
}

export interface WalletTransaction {
  id: string;
  amountPaise: number;
  amountRupees: number;
  description: string;
  title: string;
  type: 'credit' | 'debit';
  dateLabel: string;
  timeLabel: string;
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  acceptsMarketing?: boolean;
}

export interface CreateUserAddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateUserAddressInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UserOrdersQuery {
  limit?: number;
  sinceId?: string;
  status?: string;
}
