import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface PopSectionShellProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  backgroundClassName?: string;
}

/** Centers POP page content to the Figma fluid content width. */
export function PopSectionShell({
  children,
  className,
  innerClassName,
  backgroundClassName,
}: PopSectionShellProps) {
  return (
    <section className={cn('w-full', backgroundClassName, className)}>
      <div
        className={cn('mx-auto w-full max-w-[var(--pop-content-max)] px-4 lg:px-0', innerClassName)}
      >
        {children}
      </div>
    </section>
  );
}

interface PopSectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PopSectionHeading({ title, subtitle, className }: PopSectionHeadingProps) {
  return (
    <div className={cn('text-center', className)}>
      <h2 className="text-center text-[clamp(1.375rem,1.5625vw,1.875rem)] font-medium tracking-[0.013em] text-[var(--pop-text-primary)]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-[clamp(0.2rem,0.208vw,0.25rem)] text-center text-[clamp(1rem,1.042vw,1.25rem)] font-normal tracking-[-0.016em] text-[var(--pop-text-secondary)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

interface PopPrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function PopPrimaryButton({
  children,
  onClick,
  type = 'button',
  className,
  ariaLabel,
  disabled = false,
}: PopPrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex w-full cursor-pointer items-center justify-center rounded-[clamp(0.5rem,0.521vw,0.625rem)] border-none bg-[#151515] py-[clamp(0.65rem,0.625vw,0.75rem)] [font-family:inherit] text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  );
}
