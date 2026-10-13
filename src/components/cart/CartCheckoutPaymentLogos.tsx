import { cartCheckoutPaymentLogos, cartTheme } from '@/config/cart/cart.config';

/** Paytm, PhonePe, and GPay badges on checkout CTA (Figma 3802:53794). */
export function CartCheckoutPaymentLogos() {
  return (
    <span className="flex items-center gap-1" data-testid="cart-checkout-payment-logos" aria-hidden>
      <span className="relative flex size-[16.5px] shrink-0 overflow-hidden rounded-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- local checkout badge asset */}
        <img
          src={cartCheckoutPaymentLogos.paytm}
          alt=""
          className="size-full object-cover"
          width={17}
          height={17}
        />
      </span>
      <span className="relative flex size-[16.5px] shrink-0 overflow-hidden rounded-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- local checkout badge asset */}
        <img
          src={cartCheckoutPaymentLogos.phonepe}
          alt=""
          className="size-full object-cover"
          width={17}
          height={17}
        />
      </span>
      <span
        className="flex size-[16.5px] shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: cartTheme.checkoutPaymentGpayBg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local checkout badge asset */}
        <img
          src={cartCheckoutPaymentLogos.gpay}
          alt=""
          className="size-[9.625px] object-contain"
          width={10}
          height={10}
        />
      </span>
    </span>
  );
}
