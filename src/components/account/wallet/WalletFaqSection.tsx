'use client';

import { ChevronDownIcon } from '@/components/icons';
import { WALLET_FAQS } from '@/config/wallet/wallet.config';

export function WalletFaqSection() {
  return (
    <section className="mt-10 pb-4" aria-labelledby="wallet-faq-heading">
      <h2 id="wallet-faq-heading" className="text-base font-bold text-[#151515]">
        Frequently Asked Questions
      </h2>

      <div className="mt-4 divide-y divide-[#EEEEEE] border-y border-[#EEEEEE]">
        {WALLET_FAQS.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-normal text-[#151515] [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <span className="transition-transform duration-200 group-open:rotate-180">
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
