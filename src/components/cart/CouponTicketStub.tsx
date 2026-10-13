'use client';

import { cartMessages, cartTheme } from '@/config/cart/cart.config';

const STUB_BG = '#ffffff';
const SCALLOP_TOPS = ['12%', '37%', '62%', '87%'];

interface CouponTicketStubProps {
  label?: string;
  /** `scalloped` = All Offers cards; `notch` = cart preview tickets (Figma 3734:51307). */
  variant?: 'scalloped' | 'notch';
  /** Solid green (applied) vs green gradient (available) for notch stub. */
  applied?: boolean;
}

/** Green discount ticket stub — scalloped (offers page) or single-notch (cart preview). */
export function CouponTicketStub({
  label = cartMessages.offerStub,
  variant = 'scalloped',
  applied = false,
}: CouponTicketStubProps) {
  if (variant === 'notch') {
    return (
      <div
        className="relative z-[1] flex w-9 shrink-0 items-center justify-center self-stretch"
        style={{
          background: applied ? cartTheme.couponAppliedSolid : cartTheme.couponTicketStubGradient,
        }}
        data-testid="coupon-ticket-stub"
        data-variant="notch"
      >
        <span
          className={
            applied
              ? 'text-[7px] font-semibold tracking-[0.4px] whitespace-nowrap text-white uppercase'
              : 'text-[8px] font-semibold tracking-[1px] whitespace-nowrap text-white uppercase'
          }
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {label}
        </span>
        {/* Punch-hole overlaps stub → body; must not be clipped by stub overflow. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-[30px] z-[2] size-2.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: cartTheme.couponTicketNotch }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative flex w-[69px] shrink-0 items-center justify-center self-stretch overflow-hidden rounded-l-lg"
      style={{ backgroundColor: cartTheme.couponAppliedSolid }}
      data-testid="coupon-ticket-stub"
      data-variant="scalloped"
    >
      {SCALLOP_TOPS.map((top) => (
        <span
          key={top}
          aria-hidden
          className="pointer-events-none absolute -left-[9px] h-[18px] w-[18px] rounded-full"
          style={{ top, backgroundColor: STUB_BG }}
        />
      ))}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-2 right-0 flex w-[4px] flex-col justify-between"
      >
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="h-[5px] w-full shrink-0" style={{ backgroundColor: STUB_BG }} />
        ))}
      </span>
      <span className="-rotate-90 text-xs font-bold tracking-wide whitespace-nowrap text-white">
        {label}
      </span>
    </div>
  );
}
