import Link from 'next/link';

import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { POP_FAQ } from '@/config/pop/pop.config';

export function PopFaqSection() {
  return (
    <section className="mt-8 pb-4" aria-labelledby="pop-faq-heading">
      <h2 id="pop-faq-heading" className="text-base font-bold text-[#151515]">
        FAQ
      </h2>

      <Link
        href={ACCOUNT_ROUTES.faqs}
        className="mt-4 flex items-center justify-between rounded-2xl border border-[#EFEFEF] bg-white px-4 py-4 text-sm font-medium text-[#151515] transition-colors hover:bg-[#FAFAFA]"
        aria-label={POP_FAQ.viewAllLabel}
      >
        <span>{POP_FAQ.viewAllLabel}</span>
        <span className="text-xs font-normal text-[#757575]">{POP_FAQ.viewAllDescription}</span>
      </Link>

      <div className="mt-4 rounded-2xl bg-[#F5F5F5] p-4">
        <p className="text-sm font-bold text-[#151515]">Popular Questions</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-normal text-[#757575]">
          {POP_FAQ.popularQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
