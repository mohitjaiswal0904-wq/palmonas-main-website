import {
  formatWalletCurrency,
  formatWalletTransactionAmount,
  getWalletBalanceAmount,
  getWalletTransactionTitle,
} from '@/lib/wallet/wallet-format';
import type { WalletTransaction } from '@/types/user';

describe('wallet-format', () => {
  it('formats wallet currency without decimals', () => {
    expect(formatWalletCurrency(505)).toContain('505');
  });

  it('sums loyalty and store credit balances', () => {
    expect(getWalletBalanceAmount(500, 5)).toBe(505);
  });

  it('derives transaction titles from comments', () => {
    expect(getWalletTransactionTitle('Spent in order', -15000)).toBe('Order Payment');
    expect(getWalletTransactionTitle('Cashback received', 50000)).toBe('Money Received');
  });

  it('formats signed transaction amounts', () => {
    const credit: WalletTransaction = {
      id: '1',
      amountPaise: 50000,
      amountRupees: 500,
      description: 'Cashback',
      title: 'Money Received',
      type: 'credit',
      dateLabel: 'Nov 6, 2024',
      timeLabel: '2:30 PM',
    };

    expect(formatWalletTransactionAmount(credit)).toContain('+');
    expect(formatWalletTransactionAmount({ ...credit, type: 'debit', amountRupees: -150 })).toContain(
      '-',
    );
  });
});
