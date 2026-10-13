import { cartMessages, cartTheme } from '@/config/cart/cart.config';

/** Truck glyph for dispatch callout (Figma 3814:43741). */
function CartDispatchTruckIcon({ className = 'size-[15px]' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.25 10.625H8.75M8.75 10.625V3.125H1.25V10.625H3.125M8.75 10.625V5.625H11.875L13.75 8.125V10.625H12.5M8.75 10.625H10"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.6875 12.5C5.55044 12.5 6.25 11.8004 6.25 10.9375C6.25 10.0746 5.55044 9.375 4.6875 9.375C3.82456 9.375 3.125 10.0746 3.125 10.9375C3.125 11.8004 3.82456 12.5 4.6875 12.5Z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.9375 12.5C11.8004 12.5 12.5 11.8004 12.5 10.9375C12.5 10.0746 11.8004 9.375 10.9375 9.375C10.0746 9.375 9.375 10.0746 9.375 10.9375C9.375 11.8004 10.0746 12.5 10.9375 12.5Z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Static dispatch + free shipping callout above cart order summary (Figma 3814:43739). */
export function CartDispatchInfoBanner() {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
      style={{
        backgroundColor: cartTheme.dispatchBannerBg,
        borderColor: cartTheme.dispatchBannerBorder,
      }}
      role="region"
      aria-label={cartMessages.a11y.dispatchInfo}
      data-testid="cart-dispatch-info-banner"
    >
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: cartTheme.dispatchBannerIconBg }}
        aria-hidden
      >
        <CartDispatchTruckIcon />
      </span>
      <div className="flex min-w-0 flex-col">
        <p
          className="font-nunito-sans text-[13px] leading-[19.5px] font-semibold"
          style={{ color: cartTheme.dispatchBannerTitle }}
        >
          {cartMessages.dispatchInfoTitle}
        </p>
        <p
          className="font-nunito-sans text-[11px] leading-[16.5px] font-normal"
          style={{ color: cartTheme.dispatchBannerSubtitle }}
        >
          {cartMessages.dispatchInfoSubtitle}
        </p>
      </div>
    </div>
  );
}
