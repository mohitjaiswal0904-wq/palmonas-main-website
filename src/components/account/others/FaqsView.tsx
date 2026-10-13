import { AccountDocumentShell } from '@/components/account/others/AccountDocumentShell';
import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import { accountFaqsContent } from '@/config/account/account.config';

/** Verbatim `/pages/faqs` dump in account document chrome. */
export function FaqsView() {
  return (
    <AccountDocumentShell title={accountFaqsContent.pageTitle}>
      <AccountRichFaqList items={accountFaqsContent.items} />
    </AccountDocumentShell>
  );
}
