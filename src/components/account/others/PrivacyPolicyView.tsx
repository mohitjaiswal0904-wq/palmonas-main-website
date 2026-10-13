import { AccountDocumentShell } from '@/components/account/others/AccountDocumentShell';
import { AccountProseBlocks } from '@/components/account/others/AccountProseBlocks';
import { accountPrivacyContent } from '@/config/account/account.config';

/** Verbatim `/pages/privacy-policy` dump in account document chrome. */
export function PrivacyPolicyView() {
  return (
    <AccountDocumentShell title={accountPrivacyContent.pageTitle}>
      <AccountProseBlocks lines={accountPrivacyContent.intro} />
      {accountPrivacyContent.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-brand-navy text-base font-semibold tracking-wide">
            {section.heading}
          </h2>
          <AccountProseBlocks lines={section.paragraphs} />
        </section>
      ))}
    </AccountDocumentShell>
  );
}
