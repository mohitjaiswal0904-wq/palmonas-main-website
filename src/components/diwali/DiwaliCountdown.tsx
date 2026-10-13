'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';

import { DIWALI_SALE_ENDS_AT, diwaliImages, diwaliMessages } from '@/config/diwali/diwali.config';
import { formatCountdownUnit, getSaleCountdownParts } from '@/lib/diwali/sale-countdown';

interface DiwaliCountdownProps {
  /** ISO sale end. Defaults to the configured Diwali end. */
  endsAt?: string;
}

/** Subscribe to a one-second clock. Server snapshot stays at 0 so hydration matches. */
function subscribeToSaleClock(onChange: () => void): () => void {
  const intervalId = window.setInterval(onChange, 1000);

  return () => {
    window.clearInterval(intervalId);
  };
}

function readSaleClock(): number {
  return Date.now();
}

/**
 * Sale countdown strip styled like the site announcement bar.
 */
export function DiwaliCountdown({ endsAt = DIWALI_SALE_ENDS_AT }: DiwaliCountdownProps) {
  const nowMs = useSyncExternalStore(subscribeToSaleClock, readSaleClock, () => 0);

  const endsAtMs = Date.parse(endsAt);
  const parts = nowMs === 0 ? null : getSaleCountdownParts(nowMs, endsAtMs);

  if (nowMs !== 0 && parts === null) {
    return null;
  }

  const { countdown } = diwaliMessages;
  const units = parts
    ? [
        formatCountdownUnit(parts.days, countdown.daySuffix),
        formatCountdownUnit(parts.hours, countdown.hourSuffix),
        formatCountdownUnit(parts.minutes, countdown.minuteSuffix),
        formatCountdownUnit(parts.seconds, countdown.secondSuffix),
      ]
    : [];

  return (
    <div
      className="diwali-countdown laptop:gap-4 laptop:py-3 laptop:text-base tab:gap-2.5 tab:px-4 relative my-4 flex min-h-11 items-center justify-center gap-1.5 overflow-hidden border-y-2 border-[#E8B84A] bg-gradient-to-r from-[#3A0D19] via-[#7A1F2B] to-[#3A0D19] px-2 py-2 text-[13px] font-semibold whitespace-nowrap text-[#FCE7B2]"
      role="region"
      aria-label={diwaliMessages.a11y.countdownRegion}
    >
      <span aria-hidden="true" className="diwali-sparkle top-1.5 left-[8%]" />
      <span
        aria-hidden="true"
        className="diwali-sparkle bottom-1.5 left-[22%] [animation-delay:0.7s]"
      />
      <span
        aria-hidden="true"
        className="diwali-sparkle top-2 right-[20%] [animation-delay:1.3s]"
      />
      <span
        aria-hidden="true"
        className="diwali-sparkle right-[6%] bottom-2 [animation-delay:0.4s]"
      />

      <Image
        src={diwaliImages.headingDiya}
        alt=""
        width={120}
        height={108}
        className="diwali-countdown-diya relative h-6 w-7 shrink-0 object-contain"
      />
      <p className="relative tracking-wide">{countdown.label}</p>
      {units.length > 0 ? (
        <p className="tab:gap-1 relative flex items-center gap-0.5">
          {units.map((unit, index) => (
            <span key={unit} className="tab:gap-1 flex items-center gap-0.5">
              {index > 0 ? (
                <span aria-hidden="true" className="diwali-countdown-colon text-[#F6C445]">
                  :
                </span>
              ) : null}
              <span className="diwali-countdown-tile tab:px-1.5 tab:text-[13px] rounded-md border border-[#FDE68A] bg-gradient-to-b from-[#FDE68A] to-[#E8B84A] px-1 py-0.5 text-[12px] font-bold text-[#4A1020] shadow-[0_2px_6px_rgba(246,196,69,0.45)]">
                {unit}
              </span>
            </span>
          ))}
        </p>
      ) : (
        <span className="sr-only">{countdown.label}</span>
      )}
      <Image
        src={diwaliImages.headingDiya}
        alt=""
        width={120}
        height={108}
        className="diwali-countdown-diya relative h-6 w-7 shrink-0 object-contain [animation-delay:0.6s]"
      />
    </div>
  );
}
