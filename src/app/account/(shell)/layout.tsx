import { AccountGuestGuard } from '@/components/account/common/AccountGuestGuard';
import { AccountSplitLayout } from '@/components/account/common/AccountSplitLayout';
import { CartRouteChromeGate } from '@/components/layout/CartRouteChromeGate';
import { Header } from '@/components/layout/Header';

export default function AccountShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartRouteChromeGate>
        <Header />
      </CartRouteChromeGate>
      <main className="tab:px-4 laptop:px-5 laptop:py-12 mx-auto w-full px-3 py-10">
        <AccountGuestGuard>
          <AccountSplitLayout>{children}</AccountSplitLayout>
        </AccountGuestGuard>
      </main>
    </>
  );
}
