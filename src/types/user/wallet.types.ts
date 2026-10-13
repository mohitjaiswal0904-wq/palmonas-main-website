/** Raw wallet DTO from GET /api/v2/user/wallet. */
export interface WalletApiData {
  birthdate: string | null;
  customer_email: string;
  gender: string | null;
  loyalty_points_balance: number;
  name: string;
  phone_number: string;
  referral_code: string;
  refund_store_credit_balance: number;
  shopify_created_at: string;
  shopify_customer_id: number;
}

/** UI-friendly wallet for account and cart payable flows. */
export interface Wallet {
  balance: number;
  loyaltyPoints: number;
  refundCredit: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  phoneNumber: string;
  referralCode: string;
  shopifyCustomerId: number;
}
