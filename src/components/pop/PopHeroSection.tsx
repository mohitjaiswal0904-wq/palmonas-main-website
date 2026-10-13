'use client';

import Image from 'next/image';

import { PopCheckIcon } from '@/components/pop/PopIcons';
import { popHeroHighlights, popPlanPerks } from '@/config/pop.config';
import { formatPrice } from '@/lib/format-price';

interface PopPlanSummaryCardProps {
  onStartSaving: () => void;
}

export function PopHeroSection() {
  return (
    <section className="flex min-h-[clamp(32.5rem,39.58vh,47.5rem)] w-full flex-col bg-[linear-gradient(175deg,rgba(255,255,255,0.5)_13%,rgba(255,243,232,0.5)_91%),linear-gradient(90deg,#fff,#fff)] lg:flex-row lg:items-center lg:py-[clamp(0.75rem,0.729vw,0.875rem)] lg:pr-[clamp(1rem,5.208vw,6.25rem)] lg:pl-[clamp(1rem,7.917vw,9.5rem)]">
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[clamp(1rem,1.25vw,1.5rem)] px-4 py-[clamp(2rem,2.083vw,2.5rem)] text-center lg:items-start lg:px-0 lg:text-left">
        <div className="flex w-full flex-col items-center gap-[clamp(0.4rem,0.433vw,0.52rem)] lg:items-start">
          <h1 className="bg-gradient-to-r from-[var(--pop-gold)] to-[var(--pop-purple)] bg-clip-text text-[clamp(2.25rem,3.894vw,4.6875rem)] leading-none font-bold tracking-[0.04em] text-transparent">
            Pay 5, Get 6
          </h1>
          <p className="max-w-[36ch] text-[clamp(1rem,1.406vw,1.6875rem)] font-normal tracking-[-0.034em] text-[var(--pop-text-primary)] lg:max-w-none">
            A flexible monthly savings plan for your dream jewellery
          </p>
        </div>

        <div className="inline-flex w-fit max-w-full flex-nowrap items-start gap-[clamp(0.9rem,1.042vw,1.25rem)] rounded-[clamp(0.8rem,0.835vw,1rem)] bg-white p-[clamp(1.25rem,1.67vw,2rem)]">
          {popHeroHighlights.map((item, index) => (
            <div
              key={item.label}
              className="flex items-stretch gap-[clamp(0.9rem,1.042vw,1.25rem)]"
            >
              {index > 0 ? (
                <div
                  className="w-px shrink-0 self-stretch bg-[var(--pop-divider)]"
                  aria-hidden="true"
                />
              ) : null}
              <div className="flex min-w-[clamp(5.5rem,7.7vw,9.25rem)] flex-col items-center justify-center">
                <p className="text-center text-[clamp(1.75rem,1.976vw,2.375rem)] leading-none font-bold tracking-[0.003em] text-[var(--pop-purple)]">
                  {item.value}
                </p>
                <p className="mt-[0.2em] text-center text-[clamp(0.875rem,0.988vw,1.1875rem)] leading-[1.33] font-normal text-[#151515]">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[clamp(20rem,42vw,32rem)] w-full shrink-0 lg:h-[clamp(20rem,28.33vw,34rem)] lg:min-h-0 lg:w-[min(48.125vw,57.75rem)] lg:max-w-[48%]">
        <Image
          src="/images/pop/hero.png"
          alt="Palmonas jewellery worn for the Pay 5 Get 6 savings plan"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}

export function PopPlanSummaryCard({ onStartSaving }: PopPlanSummaryCardProps) {
  return (
    <section className="mx-auto w-full max-w-[var(--pop-content-max)] px-4 lg:px-0">
      <div className="rounded-[clamp(1rem,1.042vw,1.25rem)] border-2 border-[var(--pop-gold)] p-[clamp(1rem,1.042vw,1.25rem)]">
        <div className="flex flex-wrap items-start justify-between gap-[clamp(0.75rem,1.042vw,1rem)]">
          <div className="min-w-0">
            <p className="text-[clamp(1rem,1.146vw,1.375rem)] font-normal tracking-[-0.011em] text-[var(--pop-text-secondary)]">
              Starting from
            </p>
            <p className="text-[clamp(2rem,2.396vw,2.875rem)] leading-[1.45] font-bold tracking-[0.013em] text-[#151515]">
              {formatPrice(1000)}
            </p>
            <p className="text-[clamp(1rem,1.146vw,1.375rem)] font-normal tracking-[-0.011em] text-[var(--pop-text-secondary)]">
              per month
            </p>
          </div>
          <div className="flex min-w-0 shrink-0 flex-col items-center justify-center rounded-[clamp(1.2rem,1.392vw,1.67rem)] bg-[linear-gradient(90deg,rgba(230,192,0,0.1)_0%,rgba(95,41,129,0.1)_100%),linear-gradient(#fff,#fff)] p-[clamp(0.85rem,0.87vw,1.04rem)] shadow-[0_0.348vw_0.261vw_rgba(0,0,0,0.1),0_0.174vw_0.174vw_rgba(0,0,0,0.1)] sm:min-w-[clamp(9rem,9.635vw,11.5625rem)]">
            <p className="text-[clamp(1rem,1.042vw,1.25rem)] font-normal text-[var(--pop-text-secondary)]">
              1 Month
            </p>
            <p className="text-[clamp(1.5rem,1.562vw,1.875rem)] font-bold tracking-[-0.024em] text-[var(--pop-green)]">
              FREE
            </p>
          </div>
        </div>

        <div className="mt-[clamp(1.25rem,1.566vw,1.875rem)] rounded-[clamp(0.65rem,0.696vw,0.835rem)] bg-gradient-to-r from-[var(--pop-cream)] to-transparent p-[clamp(0.65rem,0.696vw,0.835rem)]">
          <p className="text-[clamp(1rem,1.146vw,1.375rem)] font-normal tracking-[-0.011em] text-[var(--pop-text-secondary)]">
            Total Value After 6 Months
          </p>
          <div className="mt-[clamp(0.45rem,0.521vw,0.625rem)] flex flex-wrap items-center gap-[clamp(0.55rem,0.696vw,0.835rem)]">
            <p className="text-[clamp(1.75rem,2.083vw,2.5rem)] leading-[1.33] font-bold tracking-[0.003em] text-[var(--pop-green)]">
              {formatPrice(6000)}
            </p>
            <span className="rounded-[clamp(0.75rem,0.87vw,1.04rem)] bg-[var(--pop-green-bg)] px-[clamp(0.6rem,0.609vw,0.73rem)] py-[clamp(0.35rem,0.348vw,0.42rem)] text-[clamp(1rem,1.042vw,1.25rem)] font-normal text-[var(--pop-green-dark)]">
              Pay only {formatPrice(5000)}
            </span>
          </div>
        </div>

        <ul className="mt-[clamp(1.25rem,1.566vw,1.875rem)] flex flex-col gap-[clamp(0.9rem,1.044vw,1.25rem)]">
          {popPlanPerks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-[clamp(0.9rem,1.044vw,1.25rem)] text-[clamp(1rem,1.042vw,1.25rem)] font-normal tracking-[-0.011em] text-[var(--pop-text-body)]"
            >
              <PopCheckIcon />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStartSaving}
          className="mt-[clamp(1.25rem,1.566vw,1.875rem)] flex h-[clamp(2.75rem,2.604vw,3.125rem)] w-full cursor-pointer items-center justify-center rounded-[clamp(0.65rem,0.696vw,0.835rem)] border-none bg-[#151515] py-[clamp(0.65rem,0.625vw,0.75rem)] [font-family:inherit] text-[clamp(1rem,0.9375vw,1.125rem)] font-normal tracking-[0.02em] text-white transition-colors hover:bg-[#2a2a2a]"
          aria-label="Start saving now with Pay 5 Get 6 plan"
        >
          Start Saving Now
        </button>
      </div>
    </section>
  );
}
