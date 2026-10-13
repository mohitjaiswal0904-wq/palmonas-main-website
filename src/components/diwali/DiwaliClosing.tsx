import { CreditCard } from 'lucide-react';
import Link from 'next/link';

import { DIWALI_SECTION_CLASS } from '@/components/diwali/diwali-constants';
import { DIWALI_TERMS_PATH, diwaliMessages } from '@/config/diwali/diwali.config';
import { cn } from '@/lib/utils/cn';

/**
 * Prepaid checkout banner and sale terms under the product grid.
 */
export function DiwaliClosing() {
  return (
    <div>
      <section
        aria-label={diwaliMessages.a11y.prepaid}
        className="relative overflow-hidden border-y-2 border-[#E8B84A] bg-[#5D0424]"
      >
        <div className={cn(DIWALI_SECTION_CLASS, 'flex flex-col items-center py-6 text-center')}>
          <CreditCard className="size-5 text-[#F6C445]" aria-hidden="true" />
          <p className="font-nunito-sans mt-2 text-lg font-bold tracking-tight text-[#FCE7B2]">
            {diwaliMessages.prepaid.title}
          </p>
          <p className="mt-1 max-w-md text-sm text-[#FCE7B2]/80">{diwaliMessages.prepaid.body}</p>
        </div>
      </section>

      <section aria-label={diwaliMessages.a11y.terms} className={DIWALI_SECTION_CLASS}>
        <p className="text-sm leading-6 text-[#666666]">{diwaliMessages.terms.body}</p>
        <Link
          href={DIWALI_TERMS_PATH}
          className="mt-3 inline-flex text-sm font-medium text-[#7A1F2B] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1F2B]"
        >
          {diwaliMessages.terms.link}
        </Link>
      </section>
    </div>
  );
}
