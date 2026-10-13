/** Raw POP API shapes from `/api/v2/pop/*`. */

export interface PopApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PopSubscriptionApi {
  id: number;
  amount_paise: number;
  created_at: string;
  updated_at: string;
  custom_data: Record<string, unknown> | null;
  external_application_id: number;
  paid_count: number;
  phone_number: string;
  razorpay_plan_id: string;
  razorpay_subscription_id: string;
  reference: string;
  remaining_count: number;
  status: string;
  total_count: number;
}

export interface PopSubscriptionsListApi {
  count: number;
  items: PopSubscriptionApi[];
  limit: number;
  offset: number;
  total: number;
}

export interface PopSubscriptionsQueryApi {
  limit?: number;
  offset?: number;
}

export interface CreatePopSubscriptionApiInput {
  amount: number;
}

export interface CreatePopSubscriptionApi {
  billing_mode: string;
  custom_data: Record<string, unknown> | null;
  oms_reference: string;
  payment_mode: string;
  payment_url: string;
  plan_id: string;
  reference: string;
  status: string;
  subscription_id: string;
  total_months: number;
}

export interface PopSubscriptionTrackQueryApi {
  count?: number;
  skip?: number;
}

export interface PopInvoiceLineItemApi {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

export interface PopInvoiceApi {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  created_at: number;
  currency: string;
  status: string;
  short_url?: string;
  subscription_id?: string;
  line_items?: PopInvoiceLineItemApi[];
}

export interface PopInvoiceCollectionApi {
  count: number;
  items: PopInvoiceApi[];
}

export interface PopSubscriptionTrackApi {
  billing_mode: string;
  payment_mode: string;
  oms_reference: string;
  phone_number: string;
  subscription_id?: string;
  status?: string;
  total_months?: number;
  invoices?: PopInvoiceCollectionApi;
  razorpay_invoices?: PopInvoiceCollectionApi;
}
