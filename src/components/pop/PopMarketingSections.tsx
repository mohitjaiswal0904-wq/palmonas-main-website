import Link from 'next/link';

import { PopFaqChevron, PopFaqIcon, PopIconBadge } from '@/components/pop/PopIcons';
import { PopSectionShell } from '@/components/pop/PopSectionShell';
import { POP_FAQ_HREF } from '@/config/faqs/faqs.config';
import { popBenefits, popFaqHighlights, popHowItWorksSteps } from '@/config/pop.config';
import { popTokens } from '@/config/theme/pop.tokens';

export function PopHowItWorksSection() {
  return (
    <PopSectionShell
      /* Full width at lg so 4 Figma cards fit laptop; wide token only caps extreme widths. */
      innerClassName="max-w-[min(100%,81.25rem)] px-4 lg:px-6"
    >
      <div className="mb-6 text-center">
        <h2 className="text-center text-[1.625rem] leading-9 font-bold tracking-[0.025em] text-[var(--pop-text-primary)] lg:text-[clamp(1.5rem,1.875vw,1.875rem)] lg:tracking-[0.013em]">
          How It Works
        </h2>
        <p className="mt-1 text-center text-sm leading-6 font-normal tracking-[-0.02em] text-[var(--pop-text-secondary)] lg:mt-1 lg:text-[clamp(1rem,1.25vw,1.25rem)] lg:tracking-[-0.016em]">
          Simple steps to start your savings journey
        </p>
      </div>

      {/* Mobile / tablet: per-step gradient joints (Figma 60:1053 / 60:1066 / 60:1080). Last step has no bar. */}
      <ol className="flex w-full flex-col lg:hidden" aria-label="How it works steps">
        {popHowItWorksSteps.map((step, index) => {
          const isLast = index === popHowItWorksSteps.length - 1;
          const title = step.mobileTitle ?? step.title;

          return (
            <li key={step.title} className="flex w-full items-start gap-3">
              <div className="flex shrink-0 flex-col items-center">
                <PopIconBadge
                  icon={step.icon}
                  className="relative z-10 size-[38px] shrink-0 rounded-full bg-[var(--pop-icon-base)] [&_img]:size-[19px]"
                />
                {isLast ? null : (
                  <div
                    className="w-0.5 shrink-0 [background-image:var(--pop-timeline-pipeline)]"
                    style={{ height: popTokens.howItWorksPipelineHeightPx }}
                    data-testid="pop-how-it-works-pipeline"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div
                className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[13px] bg-[var(--pop-surface)] p-3"
                style={{ minHeight: popTokens.howItWorksCardMinHeightPx }}
              >
                <h3 className="text-sm leading-[1.63] font-bold tracking-[-0.026em] text-[var(--pop-text-primary)]">
                  {title}
                </h3>
                <p className="text-xs leading-[1.36] font-normal tracking-[-0.01em] text-[var(--pop-text-secondary)]">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Laptop / desktop: 4-column row (Figma 60:1867) from lg (1024px). */}
      <div
        className="hidden w-full items-start justify-center gap-[clamp(0.75rem,2.5vw,2.5rem)] lg:flex"
        data-testid="pop-how-it-works-desktop"
      >
        {popHowItWorksSteps.map((step) => (
          <div key={step.title} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <PopIconBadge
              icon={step.icon}
              className="size-[38px] shrink-0 rounded-full bg-[var(--pop-icon-base)] [&_img]:size-[19px]"
            />
            <div className="flex min-h-[7.5rem] w-full flex-col gap-2 rounded-[1.057rem] bg-[var(--pop-surface)] p-[clamp(0.75rem,1vw,0.97rem)]">
              <h3 className="text-[clamp(0.9375rem,1.5vw,1.25rem)] font-bold tracking-[-0.023em] text-[var(--pop-text-primary)]">
                {step.title}
              </h3>
              <p className="text-[clamp(0.8125rem,1.1vw,1rem)] leading-[1.32] font-normal tracking-[-0.01em] text-[var(--pop-text-secondary)]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PopSectionShell>
  );
}

export function PopBenefitsSection() {
  return (
    <PopSectionShell>
      <div className="mb-[clamp(1.25rem,1.25vw,1.5rem)] text-center">
        <h2 className="text-center text-[clamp(1.375rem,1.5625vw,1.875rem)] font-medium tracking-[0.013em] text-[var(--pop-text-primary)]">
          Why Choose Saving Plan?
        </h2>
        <p className="mt-[clamp(0.2rem,0.208vw,0.25rem)] text-center text-[clamp(1rem,1.042vw,1.25rem)] font-normal tracking-[-0.016em] text-[var(--pop-text-secondary)]">
          Simple steps to start your savings journey
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[clamp(0.85rem,0.9375vw,1.125rem)] lg:grid-cols-2">
        {popBenefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex h-[clamp(6.5rem,6.354vw,7.625rem)] items-center gap-[clamp(0.9rem,1.042vw,1.25rem)] rounded-[clamp(0.9rem,0.935vw,1.12rem)] bg-[var(--pop-surface)] p-[clamp(0.85rem,0.833vw,1rem)]"
          >
            <PopIconBadge icon={benefit.icon} size="md" />
            <div className="min-w-0">
              <h3 className="text-[clamp(1.05rem,1.09vw,1.31rem)] font-bold tracking-[-0.031em] text-[var(--pop-text-primary)]">
                {benefit.title}
              </h3>
              <p className="mt-[0.35em] text-[clamp(0.95rem,0.935vw,1.12rem)] font-normal tracking-[-0.012em] text-[var(--pop-text-secondary)]">
                {benefit.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </PopSectionShell>
  );
}

interface PopFaqSectionProps {
  faqHref?: string;
}

export function PopFaqSection({ faqHref = POP_FAQ_HREF }: PopFaqSectionProps) {
  return (
    <PopSectionShell innerClassName="flex flex-col items-center gap-[clamp(1rem,1.25vw,1.5rem)] pb-[clamp(1.5rem,2.083vw,2.5rem)]">
      <h2 className="text-center text-[clamp(1.375rem,1.5625vw,1.875rem)] font-bold text-[#151515]">
        Frequently asked Questions
      </h2>

      <div className="flex w-full flex-col gap-[clamp(0.55rem,0.625vw,0.75rem)]">
        <Link
          href={faqHref}
          className="flex items-center justify-between gap-[clamp(1rem,3.6vw,14.5rem)] rounded-[clamp(0.5rem,0.521vw,0.625rem)] border border-[var(--pop-border)] bg-white p-[clamp(0.85rem,0.885vw,1.0625rem)] transition-colors hover:bg-[#fafafa]"
          aria-label="View all FAQs"
        >
          <div className="flex min-w-0 items-center gap-[clamp(0.85rem,0.833vw,1rem)]">
            <PopFaqIcon />
            <div className="min-w-0">
              <p className="text-[clamp(0.875rem,0.833vw,1rem)] font-medium text-[#151515]">
                View All FAQs
              </p>
              <p className="mt-[0.2em] text-[clamp(0.75rem,0.729vw,0.875rem)] font-normal text-[var(--pop-text-secondary)]">
                26 questions covering Generic, Enrollment, Redemption & Policy
              </p>
            </div>
          </div>
          <PopFaqChevron />
        </Link>

        <div className="rounded-[clamp(0.5rem,0.521vw,0.625rem)] bg-[var(--pop-surface)] p-[clamp(0.85rem,0.833vw,1rem)]">
          <h3 className="text-[clamp(0.875rem,0.833vw,1rem)] font-medium text-[#151515]">
            Popular Questions
          </h3>
          <ul className="mt-[clamp(0.55rem,0.625vw,0.75rem)] flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
            {popFaqHighlights.map((item) => (
              <li key={item.text} className="flex items-start gap-2">
                <span
                  className="text-[clamp(0.75rem,0.729vw,0.875rem)] text-[var(--pop-text-muted)]"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="text-[clamp(0.875rem,0.833vw,1rem)] text-[var(--pop-text-body)]">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PopSectionShell>
  );
}
