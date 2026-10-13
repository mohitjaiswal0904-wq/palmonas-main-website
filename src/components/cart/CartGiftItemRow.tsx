import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { formatPrice } from '@/lib/format-price';

interface CartGiftItemRowProps {
  /** Gift product name (primary line). */
  name: string;
  /** Gift product thumbnail. */
  imageUrl: string;
  /** Retail value shown in the "Worth …" line. */
  worthAmount: number;
}

/** Free gift you already earned — thumb, worth copy, "Yours" pill (Figma 3862:94976). */
export function CartGiftItemRow({ name, imageUrl, worthAmount }: CartGiftItemRowProps) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl border border-solid p-2.5"
      style={{ backgroundColor: cartTheme.giftItemBg, borderColor: cartTheme.giftItemBorder }}
      data-testid="cart-gift-item-row"
    >
      <div
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-solid bg-white p-1"
        style={{ borderColor: cartTheme.giftItemBorder }}
      >
        {/* Local Figma thumb — keep the 46px leaf inside the 56px padded frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          width={46}
          height={46}
          className="size-[46px] object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-[13px] leading-[19.5px] font-semibold text-[#151515]">{name}</p>
        <p
          className="pt-0.5 text-[11px] leading-[16.5px] font-normal"
          style={{ color: cartTheme.giftItemDetail }}
        >
          {cartMessages.giftItemWorth.replace('{amount}', formatPrice(worthAmount))}
        </p>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-1 text-[10px] leading-[15px] font-semibold"
        style={{
          backgroundColor: cartTheme.giftItemBadgeBg,
          color: cartTheme.giftItemBadgeText,
        }}
        data-testid="cart-gift-item-badge"
      >
        {cartMessages.giftItemYours}
      </span>
    </div>
  );
}
