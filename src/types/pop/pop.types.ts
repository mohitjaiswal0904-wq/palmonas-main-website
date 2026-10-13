/** Domain types for Plan of Purchase (POP). */

export interface PopSubscriptionsQuery {
  limit?: number;
  offset?: number;
}

export interface PopSubscription {
  id: number;
  subscriptionId: string;
  monthlyAmount: number;
  status: string;
  paidCount: number;
  remainingCount: number;
  totalCount: number;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  reference: string;
}

export interface PopSubscriptionsPage {
  items: PopSubscription[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreatePopSubscriptionInput {
  amount: number;
}

export interface CreatePopSubscriptionResult {
  subscriptionId: string;
  paymentUrl: string;
  status: string;
  omsReference: string;
  totalMonths: number;
  billingMode: string;
}

export interface PopSubscriptionTrackQuery {
  count?: number;
  skip?: number;
}

export interface PopInvoice {
  id: string;
  amount: number;
  amountDue: number;
  amountPaid: number;
  status: string;
  paymentUrl: string | null;
  createdAt: string;
  currency: string;
  description: string;
}

export interface PopSubscriptionDetail {
  subscriptionId: string;
  omsReference: string;
  phoneNumber: string;
  billingMode: string;
  paymentMode: string;
  status: string;
  totalMonths: number;
  invoices: PopInvoice[];
}

export interface PopSavingsBreakdown {
  monthlyAmount: number;
  totalInstallments: number;
  bonusAmount: number;
  redeemableAmount: number;
}
