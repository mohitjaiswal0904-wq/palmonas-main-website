import Image from 'next/image';

import { DiwaliMarigold } from '@/components/diwali/DiwaliMarigold';
import { diwaliImages } from '@/config/diwali/diwali.config';

interface DiwaliSectionHeadingProps {
  eyebrow: string;
  title: string;
  titleId: string;
}

/**
 * Festive section title: a gold label, a title flanked by marigold rules, and a diya below.
 */
export function DiwaliSectionHeading({ eyebrow, title, titleId }: DiwaliSectionHeadingProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="relative inline-flex drop-shadow-[0_1px_1px_rgba(122,31,43,0.25)]">
        <span className="inline-flex bg-gradient-to-b from-[#F6C445] via-[#E8B84A] to-[#B8862B] p-[2px] [clip-path:polygon(12px_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,12px_100%,0_50%)]">
          <span className="inline-flex items-center gap-2 bg-[#FFF8EE] px-7 py-1.5 text-[11px] font-bold tracking-[0.2em] text-[#9A3412] uppercase [clip-path:polygon(11px_0,calc(100%-11px)_0,100%_50%,calc(100%-11px)_100%,11px_100%,0_50%)]">
            <Image
              src={diwaliImages.headingDiya}
              alt=""
              width={120}
              height={108}
              className="h-4 w-[18px] shrink-0 object-contain"
            />
            {eyebrow}
            <Image
              src={diwaliImages.headingDiya}
              alt=""
              width={120}
              height={108}
              className="h-4 w-[18px] shrink-0 object-contain"
            />
          </span>
        </span>
        <span
          aria-hidden="true"
          className="diwali-ribbon-lights pointer-events-none absolute inset-0"
        >
          <span className="diwali-ribbon-lights-row absolute top-0 right-3 left-3 h-2 -translate-y-1/2" />
          <span className="diwali-ribbon-lights-row absolute right-3 bottom-0 left-3 h-2 translate-y-1/2" />
          <svg
            viewBox="0 0 12 30"
            preserveAspectRatio="none"
            className="absolute top-0 left-0 h-full w-3 overflow-visible"
          >
            <polyline points="12,0 0,15 12,30" className="diwali-ribbon-lights-end" />
          </svg>
          <svg
            viewBox="0 0 12 30"
            preserveAspectRatio="none"
            className="absolute top-0 right-0 h-full w-3 overflow-visible"
          >
            <polyline points="0,0 12,15 0,30" className="diwali-ribbon-lights-end" />
          </svg>
        </span>
      </p>
      <div className="mt-3 flex w-full items-center justify-center gap-2">
        <span aria-hidden="true" className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <span className="tab:max-w-16 h-px w-full max-w-10 bg-gradient-to-r from-transparent to-[#E8B84A]" />
          <DiwaliMarigold />
        </span>
        <h2
          id={titleId}
          className="font-nunito-sans tab:text-3xl laptop:text-4xl shrink-0 bg-gradient-to-r from-[#7A1F2B] via-[#C45C26] to-[#7A1F2B] bg-clip-text text-2xl font-bold tracking-tight text-transparent"
        >
          {title}
        </h2>
        <span aria-hidden="true" className="flex min-w-0 flex-1 items-center justify-start gap-1.5">
          <DiwaliMarigold />
          <span className="tab:max-w-16 h-px w-full max-w-10 bg-gradient-to-l from-transparent to-[#E8B84A]" />
        </span>
      </div>
    </div>
  );
}
