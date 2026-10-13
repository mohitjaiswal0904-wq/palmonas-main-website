import Image from 'next/image';

import type { PopBenefit, PopHowItWorksStep } from '@/config/pop.config';
import { cn } from '@/lib/utils/cn';

const HOW_IT_WORKS_ICON_SRC: Record<PopHowItWorksStep['icon'], string> = {
  'user-plus': '/images/pop/icons/enroll.svg',
  'calendar': '/images/pop/icons/calendar.svg',
  'gift': '/images/pop/icons/gift.svg',
  'shopping-bag': '/images/pop/icons/shopping-bag.svg',
};

const BENEFIT_ICON_SRC: Record<PopBenefit['icon'], string> = {
  gem: '/images/pop/icons/gem.svg',
  percent: '/images/pop/icons/percent.svg',
  shield: '/images/pop/icons/shield.svg',
  sliders: '/images/pop/icons/sliders.svg',
  zap: '/images/pop/icons/zap.svg',
  headphones: '/images/pop/icons/headphones.svg',
};

const ICON_BADGE_BG = 'bg-[#ECE2DF]';

const ICON_BADGE_SIZE: Record<'sm' | 'md', string> = {
  sm: 'size-[clamp(2rem,1.979vw,2.375rem)] rounded-full [&_img]:size-1/2',
  md: 'size-[clamp(2.75rem,2.96vw,3.55rem)] rounded-[clamp(0.85rem,0.863vw,1.035rem)] [&_img]:size-1/2',
};

interface PopIconBadgeProps {
  icon: PopHowItWorksStep['icon'] | PopBenefit['icon'];
  size?: 'sm' | 'md';
  className?: string;
}

/** Renders a POP icon badge with exported SVG artwork on a neutral base. */
export function PopIconBadge({ icon, size = 'sm', className }: PopIconBadgeProps) {
  const isHowItWorks = icon in HOW_IT_WORKS_ICON_SRC;
  const src = isHowItWorks
    ? HOW_IT_WORKS_ICON_SRC[icon as PopHowItWorksStep['icon']]
    : BENEFIT_ICON_SRC[icon as PopBenefit['icon']];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        ICON_BADGE_BG,
        ICON_BADGE_SIZE[size],
        className,
      )}
      aria-hidden="true"
    >
      <Image src={src} alt="" width={19} height={19} className="object-contain" />
    </div>
  );
}

export function PopCheckIcon() {
  return (
    <span
      className={cn(
        'flex size-[clamp(1.1rem,1.131vw,1.3575rem)] shrink-0 items-center justify-center rounded-full',
        ICON_BADGE_BG,
        '[&_img]:size-[60%]',
      )}
      aria-hidden="true"
    >
      <Image src="/images/pop/icons/check.svg" alt="" width={13} height={13} />
    </span>
  );
}

export function PopFaqIcon() {
  return (
    <div
      className={cn(
        'flex size-[clamp(2.75rem,2.96vw,3.55rem)] shrink-0 items-center justify-center rounded-[clamp(0.85rem,0.863vw,1.035rem)]',
        ICON_BADGE_BG,
        '[&_img]:size-1/2',
      )}
      aria-hidden="true"
    >
      <Image src="/images/pop/icons/faq.svg" alt="" width={28} height={28} />
    </div>
  );
}

export function PopFaqChevron() {
  return (
    <Image
      src="/images/pop/icons/chevron.svg"
      alt=""
      width={20}
      height={20}
      className="shrink-0"
      aria-hidden="true"
    />
  );
}
