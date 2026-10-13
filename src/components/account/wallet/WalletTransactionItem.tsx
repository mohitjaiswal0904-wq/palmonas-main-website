import { WalletTransactionIcon } from '@/components/account/wallet/WalletTransactionIcon';
import { formatWalletTransactionAmount } from '@/lib/wallet/wallet-format';
import type { WalletTransaction } from '@/types/user';

interface WalletTransactionItemProps {
  transaction: WalletTransaction;
}

export function WalletTransactionItem({ transaction }: WalletTransactionItemProps) {
  return (
    <li className="flex items-center gap-3 py-4">
      <WalletTransactionIcon type={transaction.type} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#151515]">{transaction.title}</p>
        <p className="mt-0.5 text-xs font-normal text-[#757575]">{transaction.dateLabel}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={
            transaction.type === 'credit'
              ? 'text-sm font-bold text-[#2E7D32]'
              : 'text-sm font-bold text-[#151515]'
          }
        >
          {formatWalletTransactionAmount(transaction)}
        </p>
        {transaction.timeLabel ? (
          <p className="mt-0.5 text-xs font-normal text-[#757575]">{transaction.timeLabel}</p>
        ) : null}
      </div>
    </li>
  );
}
