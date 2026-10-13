import { formatWalletCurrency } from '@/lib/wallet/wallet-format';

interface WalletBalanceCardProps {
  balance: number;
}

export function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  return (
    <div className="mt-6 rounded-2xl bg-[#FFF5F5] px-6 py-8 text-center">
      <p className="text-sm font-normal text-[#757575]">Wallet Balance</p>
      <p className="mt-2 text-4xl font-bold text-[#151515]">{formatWalletCurrency(balance)}</p>
      <p className="mt-3 text-xs font-normal text-[#757575]">
        Available for all purchases and transactions
      </p>
    </div>
  );
}
