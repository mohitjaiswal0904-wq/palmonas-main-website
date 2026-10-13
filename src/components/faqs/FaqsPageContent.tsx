import { PopFaqAccordionItem } from '@/components/faqs/PopFaqAccordionItem';
import { PopFaqPageHeader } from '@/components/faqs/PopFaqPageHeader';
import { faqsMessages, popFaqSections, popFaqTerms } from '@/config/faqs/faqs.config';

/** Server-rendered POP Plan FAQ page from Figma node 960-46731. */
export function FaqsPageContent() {
  return (
    <div className="pop-page bg-white pb-8 sm:pb-10">
      <div className="laptop:px-[clamp(1rem,9.792vw,11.75rem)] mx-auto flex w-full max-w-[var(--pop-content-max)] flex-col gap-8 px-4 pt-4 pb-8 sm:gap-12 sm:px-6 sm:pt-6 sm:pb-10">
        <PopFaqPageHeader />

        <div className="flex flex-col gap-4 sm:gap-6">
          <h1 className="text-2xl leading-8 font-bold tracking-[0.07px] text-[#151515] sm:text-4xl sm:leading-[32px]">
            {faqsMessages.pageTitle}
          </h1>
          <p className="text-base leading-5 font-normal tracking-[-0.15px] text-[var(--pop-text-secondary)] sm:text-xl">
            {faqsMessages.pageSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:gap-6">
          {popFaqSections.map((section) => (
            <section key={section.id} className="flex flex-col gap-3">
              <h2 className="text-2xl font-medium text-[#151515] sm:text-[30px]">
                {section.title}
              </h2>
              <div className="flex flex-col gap-3">
                {section.items.map((item, index) => (
                  <PopFaqAccordionItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    defaultOpen={section.id === 'generic' && index === 0}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section id="terms" className="flex flex-col gap-4 sm:gap-6">
          <h2 className="text-2xl font-medium text-[#151515] sm:text-[30px]">
            {faqsMessages.termsTitle}
          </h2>
          <div className="text-base leading-normal font-medium tracking-[-0.15px] text-[#8b8b8b] sm:text-lg">
            {popFaqTerms.map((term) => (
              <p key={term} className="mb-4 last:mb-0">
                {term}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
