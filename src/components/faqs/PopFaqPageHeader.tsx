import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { faqsMessages } from '@/config/faqs/faqs.config';

/** Back navigation row for the POP FAQ page. */
export function PopFaqPageHeader() {
  return (
    <div className="flex w-full items-center gap-3 py-3">
      <Link
        href="/pop"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--pop-border)] bg-white text-[#121212] transition-colors hover:bg-[#fafafa] sm:size-10"
        aria-label={faqsMessages.backAriaLabel}
      >
        <ArrowLeft className="size-4 sm:size-5" aria-hidden="true" />
      </Link>
      <p className="text-lg leading-[1.4] font-normal text-[#121212] sm:text-xl">
        {faqsMessages.backLabel}
      </p>
    </div>
  );
}
