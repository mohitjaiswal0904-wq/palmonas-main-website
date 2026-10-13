import type { ReactNode } from 'react';

import { CareersSectionBadge } from '@/components/careers/CareersSectionBadge';
import { cn } from '@/lib/utils/cn';

interface CareersSectionHeaderProps {
  badge: string;
  heading: string;
  description: string;
  headingId?: string;
  descriptionClassName?: string;
}

/** Centered badge + heading + supporting copy for Careers sections. */
export function CareersSectionHeader({
  badge,
  heading,
  description,
  headingId,
  descriptionClassName,
}: CareersSectionHeaderProps) {
  return (
    <div className="mx-auto max-w-[640px] text-center">
      <CareersSectionBadge label={badge} />
      <h2
        id={headingId}
        className="font-nunito-sans tab:text-[32px] tab:leading-tight text-2xl leading-tight font-bold text-[#101828]"
      >
        {heading}
      </h2>
      <p
        className={cn(
          'font-nunito-sans tab:text-base mt-2 text-sm leading-relaxed font-normal text-[#4a5565]',
          descriptionClassName,
        )}
      >
        {description}
      </p>
    </div>
  );
}

interface CareersSectionShellProps {
  'children': ReactNode;
  'className'?: string;
  'aria-labelledby'?: string;
}

/** Max-width content shell used by Careers page sections. */
export function CareersSectionShell({
  children,
  className,
  'aria-labelledby': ariaLabelledBy,
}: CareersSectionShellProps) {
  return (
    <section
      className={cn(
        'tab:px-6 tab:py-8 bg-[linear-gradient(0deg,#fff_0%,#fffcfb_100%)] px-4 py-6',
        className,
      )}
      aria-labelledby={ariaLabelledBy}
    >
      <div className="mx-auto max-w-[1120px]">{children}</div>
    </section>
  );
}
