import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ContactTeamIconBadge } from '@/components/contact/ContactIcons';
import type { ContactTeamSection } from '@/config/contact.config';

interface ContactTeamCardProps {
  section: ContactTeamSection;
}

export function ContactTeamCard({ section }: ContactTeamCardProps) {
  return (
    <article className="flex h-full min-h-[315px] flex-col rounded-[14px] border border-[#e7e5e0]/50 bg-[#fafafa] px-8 py-9">
      <ContactTeamIconBadge icon={section.icon} />
      <h3 className="mt-6 text-[19px] leading-8 font-[700] text-[#1c1c1c]">{section.title}</h3>
      <p className="font-nunito-sans mt-4 flex-1 text-sm leading-6 text-[#6c6c6c]">
        {section.description}
      </p>
      <Link
        href={`mailto:${section.email}`}
        className="mt-6 inline-flex items-center gap-2 border-b border-[#151515] pb-1 text-sm font-[600] text-[#1c1c1c]"
        aria-label={`Email ${section.title} at ${section.email}`}
      >
        {section.email}
        <ArrowRight className="size-[15px]" aria-hidden="true" />
      </Link>
    </article>
  );
}
