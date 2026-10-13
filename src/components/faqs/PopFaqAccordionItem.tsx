import { ChevronDown } from 'lucide-react';

interface PopFaqAccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

/** Single POP FAQ accordion row — bordered card with expand/collapse. */
export function PopFaqAccordionItem({
  question,
  answer,
  defaultOpen = false,
}: PopFaqAccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className="group w-full rounded-[10px] border border-[var(--pop-border)] bg-white p-3"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-base leading-normal font-normal text-[#151515] sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-[#151515] transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 text-sm leading-normal font-normal text-[var(--pop-text-body)] sm:text-base">
        {answer}
      </p>
    </details>
  );
}
