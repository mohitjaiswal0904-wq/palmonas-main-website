import { ChevronDownIcon } from '@/components/icons';

export interface AccountFaqItem {
  question: string;
  answer: string;
}

interface AccountFaqListProps {
  title?: string;
  items: readonly AccountFaqItem[];
  headingId?: string;
}

/** Accordion FAQ list matching wallet/account detail styling. */
export function AccountFaqList({
  title,
  items,
  headingId = 'account-faq-heading',
}: AccountFaqListProps) {
  return (
    <section
      className="mt-8 pb-4"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : 'FAQ list'}
    >
      {title ? (
        <h2 id={headingId} className="text-base font-bold text-[#151515]">
          {title}
        </h2>
      ) : null}

      <div className={`${title ? 'mt-4' : ''} divide-y divide-[#EEEEEE] border-y border-[#EEEEEE]`}>
        {items.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-normal text-[#151515] [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <span className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                <ChevronDownIcon className="h-4 w-4 text-[#757575]" />
              </span>
            </summary>
            <p className="pb-4 text-sm leading-6 font-normal text-[#757575]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
