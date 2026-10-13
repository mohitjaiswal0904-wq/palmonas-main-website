import { AccountProseBlocks } from '@/components/account/others/AccountProseBlocks';
import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import type { PolicyPageContent } from '@/types/policy/policy.types';

interface PolicyPageContentProps {
  content: PolicyPageContent;
}

/**
 * Renders verbatim policy page body (FAQ accordion or prose sections).
 */
export function PolicyPageContent({ content }: PolicyPageContentProps) {
  if (content.kind === 'faq') {
    return (
      <AccountRichFaqList
        heading={content.pageTitle}
        items={content.items}
        defaultOpenFirst
        className="mt-2"
      />
    );
  }

  if (content.kind === 'faq-prose') {
    return (
      <article className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#151515] sm:text-3xl">
          {content.pageTitle}
        </h1>
        <AccountRichFaqList items={content.faqItems} defaultOpenFirst />
        <AccountProseBlocks lines={content.bodyLines} />
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#151515] sm:text-3xl">
        {content.pageTitle}
      </h1>
      {content.intro ? <AccountProseBlocks lines={content.intro} /> : null}
      {content.sections?.map((section) => (
        <section key={section.heading ?? section.paragraphs[0]?.slice(0, 40)} className="space-y-3">
          {section.heading ? (
            <h2 className="text-brand-navy text-base font-semibold tracking-wide">
              {section.heading}
            </h2>
          ) : null}
          <AccountProseBlocks lines={section.paragraphs} />
        </section>
      ))}
      {content.bodyLines ? <AccountProseBlocks lines={content.bodyLines} /> : null}
    </article>
  );
}
