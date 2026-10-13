"use client";

import BottomSheet from "./BottomSheet";
import type { Coupon } from "./types";

/** A single coupon "ticket" with the green DISCOUNT stub on the left. */
function CouponCard({
  coupon,
  applied,
  onApply,
}: {
  coupon: Coupon;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-xl bg-[#f3f3f3]">
      {/* Green stub with vertical label + notches */}
      <div className="relative flex w-[52px] shrink-0 items-center justify-center bg-[#1aaa3a]">
        <span className="rotate-180 text-[11px] font-semibold uppercase tracking-wider text-white [writing-mode:vertical-rl]">
          {coupon.kind === "bogo" ? "Discount" : "Coupon"}
        </span>
        <span className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-white" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="text-sm text-[#454545]">{coupon.headline}</p>
        <p className="text-lg font-bold text-[#151515]">{coupon.title}</p>
        <p className="text-xs leading-snug text-[#8a8a8a]">{coupon.description}</p>
        <button
          type="button"
          onClick={onApply}
          className={`mt-1 w-full rounded-full border py-2 text-sm font-medium transition-colors ${
            applied
              ? "border-[#1aaa3a] bg-[#1aaa3a] text-white"
              : "border-[#151515] text-[#151515] hover:bg-[#151515] hover:text-white"
          }`}
        >
          {applied ? "Applied" : "Apply Code"}
        </button>
      </div>
    </div>
  );
}

/** "All Offers" sheet — lists discount coupons and other offers. */
export default function CouponsSheet({
  open,
  onClose,
  coupons,
  appliedCode,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  coupons: Coupon[];
  appliedCode?: string;
  onApply: (coupon: Coupon) => void;
}) {
  const discounts = coupons.filter((c) => c.group === "discount");
  const others = coupons.filter((c) => c.group === "other");

  const handleApply = (c: Coupon) => {
    onApply(c);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="All Offers">
      <div className="flex flex-col gap-3">
        {discounts.map((c) => (
          <CouponCard
            key={c.code}
            coupon={c}
            applied={appliedCode === c.code}
            onApply={() => handleApply(c)}
          />
        ))}

        {others.length > 0 ? (
          <>
            <p className="mt-3 text-lg font-semibold text-[#151515]">Other Offers</p>
            {others.map((c) => (
              <CouponCard
                key={c.code}
                coupon={c}
                applied={appliedCode === c.code}
                onApply={() => handleApply(c)}
              />
            ))}
          </>
        ) : null}
      </div>
    </BottomSheet>
  );
}
