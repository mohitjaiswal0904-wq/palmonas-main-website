import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

import {
  ContactSupportHoursIcon,
  ContactSupportPhoneIcon,
} from '@/components/contact/ContactIcons';
import {
  CONTACT_SUPPORT_PHONE_DISPLAY,
  CONTACT_SUPPORT_PHONE_HREF,
  CONTACT_SUPPORT_URL,
  CONTACT_HOURS_SHORT,
} from '@/config/contact.config';

export function ContactSupportBar() {
  return (
    <section
      className="tab:flex tab:items-center tab:gap-10 tab:px-10 rounded-[20px] border border-[#151515]/20 px-6 py-7"
      aria-label="Customer support quick contact"
    >
      <div className="tab:flex-row tab:items-center tab:gap-10 flex flex-1 flex-col gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-[18px]">
          <ContactSupportPhoneIcon />
          <div className="min-w-0">
            <p className="font-nunito-sans text-[12px] tracking-[1.92px] text-[#808080] uppercase">
              Call us
            </p>
            <Link
              href={CONTACT_SUPPORT_PHONE_HREF}
              className="font-nunito-sans text-lg font-bold text-[#151515]"
              aria-label={`Call Palmonas support at ${CONTACT_SUPPORT_PHONE_DISPLAY}`}
            >
              {CONTACT_SUPPORT_PHONE_DISPLAY}
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-[18px]">
          <ContactSupportHoursIcon />
          <div className="min-w-0">
            <p className="font-nunito-sans text-[12px] tracking-[1.92px] text-[#808080] uppercase">
              We&apos;re available
            </p>
            <p className="font-nunito-sans text-lg font-semibold text-[#151515]">
              {CONTACT_HOURS_SHORT}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={CONTACT_SUPPORT_URL}
        target="_blank"
        rel="noreferrer"
        className="font-nunito-sans tab:mt-0 tab:w-auto mt-6 inline-flex h-[51px] w-full shrink-0 items-center justify-center gap-2.5 rounded-[11px] border border-[#151515] bg-[#151515] px-8 text-sm font-semibold text-white capitalize"
        aria-label="Submit a support ticket"
      >
        <MessageSquare className="size-[18px]" aria-hidden="true" />
        Submit a Ticket
      </Link>
    </section>
  );
}
