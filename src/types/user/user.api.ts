/** Raw API envelope from Palmonas staging backend. */
export interface UserApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface UserDetailsApi {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  verified_email?: boolean;
  accepts_marketing?: boolean;
  created_at?: string;
  updated_at?: string;
  orders_count?: number;
  total_spent?: string;
  tags?: string;
  note?: string | null;
  currency?: string;
  addresses?: UserAddressApi[];
}

export interface UserAddressApi {
  id: number;
  customer_id?: number;
  first_name: string;
  last_name: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
  name?: string;
  province_code?: string;
  country_code?: string;
  country_name?: string;
  default: boolean;
}

export interface UserOrderApi {
  id: string;
  orderId: string;
  deliveredTo: string;
  totalItems: number;
  paymentMethod: string;
  orderDate: string;
  status: string;
  thumbnail: string;
}

export interface UserOrderDeliveryAddressApi {
  addressLine: string;
  lane?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface UserOrderLineItemApi {
  productId: string;
  title: string;
  qty: number;
  mrp: number;
  sellingPrice: number;
  image: string;
}

export interface UserOrderPricingApi {
  subtotal: number;
  discount: {
    code: string;
    amount: number;
  };
  walletAmount: number;
  shippingCost: number;
  taxes: {
    sgst: number;
    cgst: number;
  };
  grandTotal: number;
}

export interface UserOrderDetailApi {
  orderId: string;
  orderDate: string;
  totalItems: number;
  paymentMethod: string;
  deliveryAddress: UserOrderDeliveryAddressApi;
  items: UserOrderLineItemApi[];
  pricing: UserOrderPricingApi;
  invoiceUrl: string;
  status: string;
  deliveredTo?: string;
}

export interface UserOrderInvoiceAddressApi {
  addressLine?: string;
  lane?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UserOrderInvoiceCustomerApi {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserOrderInvoiceItemApi {
  title: string;
  qty: number;
  sku?: string;
  mrp: number;
  sellingPrice: number;
}

export interface UserOrderInvoicePricingApi {
  subtotal: number;
  discount?: number | { code?: string; amount?: number };
  walletAmount?: number;
  shippingCost?: number;
  taxes?: {
    sgst?: number;
    cgst?: number;
  };
  grandTotal: number;
}

export interface UserOrderInvoiceApi {
  orderId: string;
  orderName?: string;
  orderDate: string;
  invoiceUrl?: string;
  currency?: string;
  email?: string;
  customer?: UserOrderInvoiceCustomerApi;
  billingAddress?: UserOrderInvoiceAddressApi;
  deliveryAddress?: UserOrderInvoiceAddressApi;
  items: UserOrderInvoiceItemApi[];
  pricing: UserOrderInvoicePricingApi;
  paymentMethod: string;
  status: string;
}

export interface UserOrdersListApi {
  data: UserOrderApi[];
}

export interface UserWalletApi {
  customer_email: string;
  phone_number: string;
  name: string;
  gender: string;
  birthdate: string;
  loyalty_points_balance: number;
  refund_store_credit_balance: number;
  referral_code: string;
  shopify_customer_id: number;
  shopify_created_at: string;
}

export interface WalletCreditLogApi {
  id: number;
  credits: number;
  comment: string;
  created_at?: string;
  created_at_human?: string;
}

export interface WalletTransactionsApi {
  status: boolean;
  customer: {
    credits: number;
    credit_log: WalletCreditLogApi[];
    referral_code: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface UpdateUserDetailsApiInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  accepts_marketing?: boolean;
}

export interface CreateUserAddressApiInput {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  is_default?: boolean;
}

export interface UpdateUserAddressApiInput {
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  is_default?: boolean;
}

export interface UserOrdersQueryApi {
  limit?: number;
  since_id?: string;
  status?: string;
}
