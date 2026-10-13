import { AccountDocumentShell } from '@/components/account/others/AccountDocumentShell';
import { AccountProseBlocks } from '@/components/account/others/AccountProseBlocks';
import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import { accountRedeemContent } from '@/config/account/account.config';

/**
 * How To Redeem = support redeem FAQs + rewards policy offer/terms (verbatim).
 */
export function HowToRedeemView() {
  return (
    <AccountDocumentShell title={accountRedeemContent.pageTitle}>
      {accountRedeemContent.intro.length ? (
        <AccountProseBlocks lines={accountRedeemContent.intro} />
      ) : null}
      <AccountRichFaqList items={accountRedeemContent.faqItems} />
      <h2 className="text-brand-navy text-base font-semibold tracking-wide">
        {accountRedeemContent.policyHeading}
      </h2>
      <AccountProseBlocks lines={accountRedeemContent.bodyLines} />
    </AccountDocumentShell>
  );
}
