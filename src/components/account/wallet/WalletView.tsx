'use client';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { WalletBalanceCard } from '@/components/account/wallet/WalletBalanceCard';
import { WalletBenefitsSection } from '@/components/account/wallet/WalletBenefitsSection';
import { WalletFaqSection } from '@/components/account/wallet/WalletFaqSection';
import { WalletTransactionsSection } from '@/components/account/wallet/WalletTransactionsSection';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useUserWallet } from '@/hooks/user';
import { getWalletBalanceAmount } from '@/lib/wallet/wallet-format';

export function WalletView() {
  const { wallet, transactions, isLoading, error } = useUserWallet();

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  if (error || !wallet) {
    return (
      <ResourceNotFound
        title="Unable to load wallet"
        description="Please sign in and try again."
        ctaHref="/account"
        ctaLabel="Back to account"
      />
    );
  }

  const balance = getWalletBalanceAmount(
    wallet.loyaltyPointsBalance,
    wallet.refundStoreCreditBalance,
  );

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title="Wallet" />

      <WalletBalanceCard balance={balance} />

      {transactions?.length ? <WalletTransactionsSection transactions={transactions} /> : null}

      <WalletBenefitsSection />
      <WalletFaqSection />
    </div>
  );
}
