'use client';

import { ArrowRight, Briefcase, MapPin } from 'lucide-react';

import type { CareerJobOpening } from '@/config/careers.config';
import { cn } from '@/lib/utils/cn';

interface CareersJobCardProps {
  job: CareerJobOpening;
  onSelect: (job: CareerJobOpening) => void;
}

/** Open-position row/card with department, location, and apply CTA. */
export function CareersJobCard({ job, onSelect }: CareersJobCardProps) {
  const isDisabled = !job.isOpen;

  return (
    <article className="tab:gap-3 tab:rounded-[20px] tab:px-5 tab:py-4 flex items-center justify-between gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <h3 className="font-nunito-sans text-lg leading-normal font-[510] tracking-[-0.898px] text-[#101828]">
          {job.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-nunito-sans inline-flex items-center gap-2 text-sm font-medium text-[#6b5b52]">
            <Briefcase className="size-4 shrink-0 text-[#8a7a72]" aria-hidden="true" />
            {job.department}
          </span>
          <span className="font-nunito-sans inline-flex items-center gap-2 text-sm font-medium text-[#6b5b52]">
            <MapPin className="size-4 shrink-0 text-[#8a7a72]" aria-hidden="true" />
            {job.location}
          </span>
        </div>
        <span className="mt-1 inline-block rounded-full bg-[#ece2df] px-3 py-1 text-xs font-semibold text-[#3d2c24]">
          {job.employmentType}
        </span>
      </div>

      <button
        type="button"
        className={cn(
          'inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ece2df] text-[#3d2c24] transition-opacity',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80',
        )}
        aria-label={
          isDisabled
            ? `${job.title} application is not available yet`
            : `View and apply for ${job.title}`
        }
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onSelect(job);
          }
        }}
      >
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
    </article>
  );
}
