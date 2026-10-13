import type { WalletTransaction } from '@/types/user';

// const CREDIT_KEYWORDS = /received|added|bonus|reward|refund|credit|cashback/i;
// const DEBIT_KEYWORDS = /spent|order|payment|purchase|deduct/i;

/** Formats wallet amounts in Indian Rupees without decimals. */
export function formatWalletCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns total spendable wallet balance in rupees. */
export function getWalletBalanceAmount(
  loyaltyPointsBalance: number,
  refundStoreCreditBalance: number,
): number {
  return loyaltyPointsBalance + refundStoreCreditBalance;
}

/**
 * Derives a user-facing transaction title from API comment and amount sign.
 *
 * @param comment - Raw credit log comment.
 * @param amountPaise - Signed credit amount in paise.
 */
export function getWalletTransactionTitle(comment: string, amountPaise: number): string {
  if (amountPaise > 0) {
    return 'Money Received';
  }

  if (amountPaise < 0) {
    return 'Order Payment';
  }

  return amountPaise < 0 ? 'Order Payment' : 'Money Received';
}

/**
 * Parses wallet transaction timestamps into date and time labels.
 *
 * @param createdAt - ISO timestamp or human-readable fallback from API.
 */
export function parseWalletTransactionDateTime(createdAt: string): {
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

/** Formats signed transaction amount for list display. */
export function formatWalletTransactionAmount(transaction: WalletTransaction): string {
  const prefix = transaction.type === 'credit' ? '+' : '-';
  return `${prefix}${formatWalletCurrency(Math.abs(transaction.amountRupees))}`;
}
