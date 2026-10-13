import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

interface GiftingPillCtaProps {
  href: string;
  label: string;
  className?: string;
  showArrow?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Black pill CTA used across gifting marketing sections.
 */
export function GiftingPillCta({
  href,
  label,
  className,
  showArrow = false,
  size = 'sm',
}: GiftingPillCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full bg-[#151515] text-white transition-opacity hover:opacity-90',
        size === 'sm' && 'px-3 py-1.5 text-[11px] font-medium',
        size === 'md' && 'px-5 py-2.5 text-sm font-medium',
        className,
      )}
      aria-label={label}
    >
      <span>{label}</span>
      {showArrow ? <span aria-hidden="true">→</span> : null}
    </Link>
  );
}
