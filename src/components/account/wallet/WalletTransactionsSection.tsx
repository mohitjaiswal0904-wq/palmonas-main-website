'use client';

import { useState } from 'react';

import { WalletTransactionItem } from '@/components/account/wallet/WalletTransactionItem';
import { WALLET_RECENT_TRANSACTION_LIMIT } from '@/config/wallet/wallet.config';
import type { WalletTransaction } from '@/types/user';

interface WalletTransactionsSectionProps {
  transactions: WalletTransaction[];
}

export function WalletTransactionsSection({ transactions }: WalletTransactionsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (!transactions.length) {
    return null;
  }

  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, WALLET_RECENT_TRANSACTION_LIMIT);
  const hasMore = transactions.length > WALLET_RECENT_TRANSACTION_LIMIT;

  return (
    <section className="mt-8" aria-labelledby="wallet-transactions-heading">
      <h2 id="wallet-transactions-heading" className="text-base font-bold text-[#151515]">
        Recent Transactions
      </h2>

      <ul className="mt-2 divide-y divide-[#EEEEEE]" aria-label="Wallet transactions">
        {visibleTransactions.map((transaction) => (
          <WalletTransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ul>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="rounded-full border border-[#D6D6D6] px-6 py-2 text-sm font-normal text-[#151515] transition-colors hover:bg-[#FAFAFA]"
            aria-label={showAll ? 'Show fewer transactions' : 'View all transactions'}
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
