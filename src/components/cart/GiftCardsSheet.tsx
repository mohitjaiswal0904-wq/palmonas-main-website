"use client";

import { useState } from "react";
import BottomSheet from "./BottomSheet";
import { formatINR } from "@/lib/format";
import type { GiftCard } from "./types";

function RedeemCard({ card }: { card: GiftCard }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-xl border border-[#f0d9b5] bg-[#fdf6ea] p-4">
      <p className="text-sm text-[#7a5a12]">Your Gift card is ready to Redeem</p>
      <p className="mt-1 text-2xl font-bold text-[#151515]">
        {formatINR(card.amount)}
      </p>
      {card.bonus ? (
        <p className="text-xs text-[#1aaa3a]">
          Including {formatINR(card.bonus)} bonus
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-[#cbb07e] bg-white px-3 py-2">
        <span className="flex-1 truncate font-mono text-sm tracking-wide text-[#151515]">
          {card.code}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-[#151515] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/** "All Gift Cards" sheet — redeemable cards + how-it-works steps. */
export default function GiftCardsSheet({
  open,
  onClose,
  cards,
}: {
  open: boolean;
  onClose: () => void;
  cards: GiftCard[];
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="All Gift Cards">
      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <RedeemCard key={c.code} card={c} />
        ))}

        <div className="mt-3">
          <p className="text-base font-semibold text-[#151515]">
            How Redemption Works
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[#6a6a6a]">
            <li>Browse our exclusive jewellery collection.</li>
            <li>Use your full amount towards any purchase.</li>
            <li>Pay any remaining balance with other payment methods.</li>
          </ul>
          <p className="mt-3 text-xs text-[#9a9a9a]">
            Note: After redeeming the code, you will receive a gift card. You can
            apply it during checkout. If the order value is less than the gift
            card amount, the balance will be retained in your wallet.
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
