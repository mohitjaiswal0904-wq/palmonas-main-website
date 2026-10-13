import { AccountDocumentShell } from '@/components/account/others/AccountDocumentShell';
import { AccountProseBlocks } from '@/components/account/others/AccountProseBlocks';
import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import { accountMessages, accountRewardsPolicyContent } from '@/config/account/account.config';

/**
 * How To Earn = full verbatim Palmonas Rewards Policy (live page dump).
 */
export function HowToEarnView() {
  return (
    <AccountDocumentShell title={accountMessages.howToEarn.menuTitle}>
      <p className="text-brand-navy text-base font-semibold">
        {accountRewardsPolicyContent.pageTitle}
      </p>
      <AccountRichFaqList items={accountRewardsPolicyContent.faqItems} defaultOpenFirst />
      <AccountProseBlocks lines={accountRewardsPolicyContent.bodyLines} />
    </AccountDocumentShell>
  );
}
