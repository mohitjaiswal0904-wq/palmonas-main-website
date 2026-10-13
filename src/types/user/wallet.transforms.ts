import type { Wallet, WalletApiData } from '@/types/user/wallet.types';

/**
 * Maps wallet API response to UI-friendly wallet model.
 *
 * @param data - Raw wallet payload from backend.
 * @returns Normalised wallet (balance = loyalty + refund store credit).
 */
export function transformWalletResponse(data: WalletApiData): Wallet {
  const loyaltyPoints = data.loyalty_points_balance ?? 0;
  const refundCredit = data.refund_store_credit_balance ?? 0;

  return {
    balance: loyaltyPoints + refundCredit,
    loyaltyPoints,
    refundCredit,
    currency: 'INR',
    customerEmail: data.customer_email,
    customerName: data.name,
    phoneNumber: data.phone_number,
    referralCode: data.referral_code,
    shopifyCustomerId: data.shopify_customer_id,
  };
}
