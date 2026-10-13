import {
  Clock,
  Gift,
  Handshake,
  Megaphone,
  MessageSquare,
  Phone,
  Shield,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

import type { ContactTeamIcon } from '@/config/contact.config';

const contactTeamIcons: Record<ContactTeamIcon, LucideIcon> = {
  'user-plus': UserPlus,
  'handshake': Handshake,
  'gift': Gift,
  'shield': Shield,
  'megaphone': Megaphone,
  'message-square': MessageSquare,
};

interface ContactTeamIconBadgeProps {
  icon: ContactTeamIcon;
  size?: 'sm' | 'lg';
}

export function ContactTeamIconBadge({ icon, size = 'sm' }: ContactTeamIconBadgeProps) {
  const Icon = contactTeamIcons[icon];
  const isLarge = size === 'lg';

  return (
    <div
      className={
        isLarge
          ? 'flex size-16 shrink-0 items-center justify-center rounded-[32px] bg-[#ece2df]'
          : 'flex size-[54px] shrink-0 items-center justify-center rounded-xl bg-[#ece2df]'
      }
      aria-hidden="true"
    >
      <Icon className={isLarge ? 'size-[30px] text-[#151515]' : 'size-[26px] text-[#151515]'} />
    </div>
  );
}

export function ContactSupportPhoneIcon() {
  return (
    <div
      className="flex size-[52px] shrink-0 items-center justify-center rounded-[26px] border border-white/25 bg-[#f5f5f5]"
      aria-hidden="true"
    >
      <Phone className="size-6 text-[#151515]" />
    </div>
  );
}

export function ContactSupportHoursIcon() {
  return (
    <div
      className="flex size-[52px] shrink-0 items-center justify-center rounded-[26px] border border-white/25 bg-[#f5f5f5]"
      aria-hidden="true"
    >
      <Clock className="size-6 text-[#151515]" />
    </div>
  );
}
