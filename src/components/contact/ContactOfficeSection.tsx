import { MapPin } from 'lucide-react';

import { CONTACT_COMPANY_NAME, CONTACT_CORPORATE_OFFICE } from '@/config/contact.config';

export function ContactOfficeSection() {
  return (
    <section
      className="tab:flex tab:items-center tab:gap-10 tab:px-10 rounded-[20px] border border-[#151515]/20 px-6 py-7"
      aria-labelledby="contact-office-heading"
    >
      <div
        className="flex size-16 shrink-0 items-center justify-center rounded-[32px] bg-[#ece2df]"
        aria-hidden="true"
      >
        <MapPin className="size-[30px] text-[#151515]" />
      </div>
      <div className="tab:mt-0 mt-6 min-w-0">
        <h2
          id="contact-office-heading"
          className="font-nunito-sans text-[21px] leading-8 font-bold text-[#1c1c1c]"
        >
          {CONTACT_COMPANY_NAME}
        </h2>
        <address className="font-nunito-sans mt-1 max-w-[620px] text-[15px] leading-7 text-[#6c6c6c] not-italic">
          {CONTACT_CORPORATE_OFFICE}
        </address>
      </div>
    </section>
  );
}
