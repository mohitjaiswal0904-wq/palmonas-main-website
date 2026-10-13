"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/format";
import CouponsSheet from "./CouponsSheet";
import GiftCardsSheet from "./GiftCardsSheet";
import AddressSheet from "./AddressSheet";
import type { Address, Coupon, GiftCard } from "./types";

const PRODUCT_IMAGE = "/collection/product-earrings.jpg";
const WALLET_BALANCE = 700;
const GIFT_WRAP_PER_ITEM = 50;
const OFFER_COUNTDOWN = 179; // 2:59 in seconds

/* ---------- mock data ---------- */

const COUPONS: Coupon[] = [
  {
    code: "B1G1",
    title: "B1G1",
    headline: "Buy One get one free",
    description:
      "Perfect Time to Stock Up! Note: You need to add minimum 2 products to avail this discount.",
    kind: "bogo",
    value: 0,
    group: "discount",
  },
  {
    code: "BUY3AT3999",
    title: "Buy 3 at ₹3999",
    headline: "Buy more, save more",
    description: "Add any 3 demi-fine styles and pay a flat ₹3,999.",
    kind: "flat",
    value: 500,
    group: "discount",
  },
  {
    code: "PALM15",
    title: "PALM15",
    headline: "Flat 15% off",
    description: "Get 15% off on your entire order. No minimum spend.",
    kind: "percent",
    value: 15,
    group: "discount",
  },
  {
    code: "SAVE10",
    title: "SAVE10",
    headline: "Welcome offer",
    description: "10% off for first-time shoppers on Palmonas.",
    kind: "percent",
    value: 10,
    group: "other",
  },
  {
    code: "FLAT500",
    title: "FLAT500",
    headline: "Flat ₹500 off",
    description: "Save ₹500 on orders above ₹2,999.",
    kind: "flat",
    value: 500,
    group: "other",
  },
];

const GIFT_CARDS: GiftCard[] = [
  { code: "KYZ123456789", amount: 18000, bonus: 3000 },
  { code: "KYZ234567890", amount: 18000, bonus: 3000 },
];

// Typed gift-card codes → credit applied to the order.
const GIFT_CREDIT: Record<string, number> = { XYZ: 500, PALM1000: 1000 };

const initialAddresses: Address[] = [
  {
    id: "a1",
    name: "Priya kumari",
    lines: ["Palmonas", "XYZ Nagar colony", "221002 Pune", "India", "+918090833565"],
    isDefault: true,
  },
  {
    id: "a2",
    name: "Aditi Sharma",
    lines: ["Palmonas", "XYZ Nagar colony", "221002 Pune", "India", "+918090833565"],
    isDefault: false,
  },
];

const limitedOffers = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  title: "Lunar Flow 9KT Gold…",
  price: "₹3,32,266",
}));

/* ---------- icons ---------- */

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6" />
    </svg>
  );
}
function MiniCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

function fmtTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, updateQty, removeItem, clear } = useCart();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState("a1");
  const [useWallet, setUseWallet] = useState(true);
  const [giftWrap, setGiftWrap] = useState(false);

  // Discount / promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<Coupon | null>(null);
  const [promoError, setPromoError] = useState("");

  // Gift card
  const [giftInput, setGiftInput] = useState("");
  const [giftApplied, setGiftApplied] = useState(0);
  const [giftError, setGiftError] = useState("");

  // Sheets
  const [offersOpen, setOffersOpen] = useState(false);
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  // Limited-offer countdown
  const [countdown, setCountdown] = useState(OFFER_COUNTDOWN);
  useEffect(() => {
    const id = setInterval(
      () => setCountdown((s) => (s <= 0 ? OFFER_COUNTDOWN : s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const [orderId, setOrderId] = useState<string | null>(null);

  const currentAddress = addresses.find((a) => a.id === selectedAddress);

  const offerDiscount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (appliedOffer.kind === "percent")
      return Math.round((subtotal * appliedOffer.value) / 100);
    if (appliedOffer.kind === "flat") return Math.min(appliedOffer.value, subtotal);
    if (items.length === 0) return 0;
    return Math.min(...items.map((it) => it.price)); // BOGO: cheapest free
  }, [appliedOffer, subtotal, items]);

  const giftWrapFee = giftWrap ? items.length * GIFT_WRAP_PER_ITEM : 0;
  const taxable = Math.max(0, subtotal - offerDiscount);
  const gst = taxable * 0.03;
  const afterGift = Math.max(0, taxable + gst + giftWrapFee - giftApplied);
  const walletUsed = useWallet ? Math.min(WALLET_BALANCE, afterGift) : 0;
  const total = Math.max(0, afterGift - walletUsed);

  const applyOffer = (offer: Coupon) => {
    setAppliedOffer(offer);
    setPromoError("");
    setPromoInput("");
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const match = COUPONS.find((c) => c.code === code);
    if (match) applyOffer(match);
    else setPromoError("Invalid code. Try PALM15, SAVE10 or FLAT500.");
  };

  const handleApplyGift = () => {
    const code = giftInput.trim().toUpperCase();
    if (!code) return;
    const credit = GIFT_CREDIT[code];
    if (credit) {
      setGiftApplied(credit);
      setGiftError("");
      setGiftInput("");
    } else {
      setGiftError("Invalid gift card. Try XYZ.");
    }
  };

  const handleAddAddress = (addr: Omit<Address, "id">) => {
    const id = `addr-${Date.now()}`;
    setAddresses((prev) => [...prev, { ...addr, id }]);
    setSelectedAddress(id);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setOrderId(`PLM${Math.floor(100000 + Math.random() * 900000)}`);
    clear();
  };

  /* ---------- order placed ---------- */
  if (orderId) {
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#1aaa3a] text-white">
          <MiniCheck className="size-8" />
        </span>
        <h1 className="text-2xl font-bold text-[#151515]">Order Placed!</h1>
        <p className="text-[#64748b]">
          Thank you for your purchase. Order{" "}
          <span className="font-semibold text-[#151515]">#{orderId}</span> is
          confirmed.
        </p>
        <Link
          href="/collection"
          className="mt-2 rounded-lg bg-[#151515] px-7 py-3 text-sm font-medium text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  /* ---------- empty cart ---------- */
  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-lg text-[#64748b]">Your cart is empty.</p>
        <Link
          href="/collection"
          className="rounded-lg bg-[#151515] px-6 py-3 text-sm font-medium text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  const bundleProgress = Math.min(100, Math.round((subtotal / 7396) * 100));

  return (
    <>
      <main className="mx-auto w-full max-w-[480px] bg-white pb-[150px]">
        {/* Cart sub-header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
            className="text-[#151515]"
          >
            <BackIcon />
          </button>
          <h1 className="text-base font-semibold text-[#151515]">Cart</h1>
        </div>

        {/* Delivery address */}
        <div className="flex items-center justify-between gap-3 bg-[#f6f6f6] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#151515]">
              Delivery Address{" "}
              <span className="font-normal">{currentAddress?.name}</span>
            </p>
            <p className="truncate text-xs text-[#8a8a8a]">
              {currentAddress
                ? currentAddress.lines.slice(0, 2).join(", ")
                : "No address selected"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddressOpen(true)}
            className="shrink-0 text-sm font-medium text-[#151515] underline-offset-2 hover:underline"
          >
            {currentAddress ? "Change" : "Add Address"}
          </button>
        </div>

        {/* Order summary */}
        <section className="px-4 pt-5">
          <h2 className="text-base font-semibold text-[#151515]">Order Summary</h2>
          <div className="mt-3 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.lineId}
                className="flex gap-3 rounded-2xl border border-black/5 bg-white p-2"
              >
                <div className="relative size-[92px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#fffbeb] to-[#fef3c6]">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} fill sizes="92px" className="object-cover" />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm text-[#151515]">{item.title}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#151515]">
                      {formatINR(item.price)}
                    </span>
                    {item.mrp > item.price ? (
                      <span className="text-xs text-[#a3a3a3] line-through">
                        {formatINR(item.mrp)}
                      </span>
                    ) : null}
                  </div>
                  {item.colour ? (
                    <p className="mt-1 text-xs text-[#6a6a6a]">Colour : {item.colour}</p>
                  ) : null}
                  {item.size ? (
                    <p className="text-xs text-[#6a6a6a]">Size : {item.size}</p>
                  ) : null}
                </div>

                <div className="flex flex-col items-end justify-between py-1">
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.lineId)}
                    className="text-[#8a8a8a] transition-colors hover:text-[#e0517a]"
                  >
                    <TrashIcon />
                  </button>
                  <div className="flex items-center gap-1.5 rounded-lg border border-black/10 p-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(item.lineId, item.qty - 1)}
                      className="flex size-6 items-center justify-center rounded-md text-[#151515] hover:bg-[#f1f5f9]"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold text-[#151515]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.lineId, item.qty + 1)}
                      className="flex size-6 items-center justify-center rounded-md text-[#151515] hover:bg-[#f1f5f9]"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gift wrap */}
          <button
            type="button"
            onClick={() => setGiftWrap((v) => !v)}
            className="mt-3 flex items-center gap-2 text-sm text-[#151515]"
          >
            <span
              className={`flex size-[18px] items-center justify-center rounded border ${
                giftWrap ? "border-[#151515] bg-[#151515] text-white" : "border-[#cbd5e1] bg-white"
              }`}
            >
              {giftWrap ? <MiniCheck /> : null}
            </span>
            Add Gift Wrap – ₹50 per Product
          </button>
        </section>

        {/* Discount */}
        <section className="px-4 pt-6">
          <p className="text-sm font-medium text-[#151515]">Discount</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Enter code"
              className="h-9 flex-1 rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none placeholder:text-[#a3a3a3] focus:border-[#151515]"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="h-9 rounded-lg bg-[#151515] px-5 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
          {promoError ? <p className="mt-1 text-xs text-[#e0517a]">{promoError}</p> : null}

          {appliedOffer ? (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-[#1aaa3a] px-3 py-2.5 text-white">
              <span className="text-sm font-medium">{appliedOffer.title}</span>
              <button
                type="button"
                onClick={() => setAppliedOffer(null)}
                className="text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-black/10 px-3 py-2.5">
              <span className="text-sm text-[#151515]">{COUPONS[1].title}</span>
              <button
                type="button"
                onClick={() => applyOffer(COUPONS[1])}
                className="rounded-md bg-[#1aaa3a] px-3 py-1 text-xs font-medium text-white"
              >
                Apply
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOffersOpen(true)}
            className="mx-auto mt-3 block text-sm font-medium text-[#151515] underline underline-offset-2"
          >
            See All Coupons
          </button>
        </section>

        {/* Limited time offers */}
        <section className="mt-6 bg-gradient-to-b from-[#fdeef0] to-white py-4">
          <div className="flex items-center justify-between px-4">
            <p className="text-sm font-semibold text-[#151515]">Limited Time Offers</p>
            <span className="rounded-md bg-[#151515] px-2 py-1 text-xs font-semibold tabular-nums text-white">
              {fmtTimer(countdown)}
            </span>
          </div>
          <div className="mt-2 px-4">
            <span className="inline-block rounded-full bg-[#e0517a] px-3 py-1 text-xs font-semibold text-white">
              70% off
            </span>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {limitedOffers.map((o) => (
              <div key={o.id} className="w-[126px] shrink-0">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#fffbeb] to-[#fef3c6]">
                  <Image src={PRODUCT_IMAGE} alt={o.title} fill sizes="126px" className="object-cover" />
                </div>
                <p className="mt-1.5 truncate text-[11px] text-[#454545]">{o.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#151515]">{o.price}</span>
                  <span className="flex size-5 items-center justify-center rounded-md border border-[#151515] text-[#151515]">
                    <PlusIcon />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gift card */}
        <section className="px-4 pt-6">
          <p className="text-sm font-medium text-[#151515]">Gift Card</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyGift()}
              placeholder="XYZ"
              className="h-9 flex-1 rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none placeholder:text-[#a3a3a3] focus:border-[#151515]"
            />
            <button
              type="button"
              onClick={handleApplyGift}
              className="h-9 rounded-lg bg-[#151515] px-5 text-sm font-medium text-white"
            >
              Apply
            </button>
          </div>
          {giftError ? <p className="mt-1 text-xs text-[#e0517a]">{giftError}</p> : null}

          {giftApplied > 0 ? (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-[#1aaa3a] bg-[#e9f8ed] px-3 py-2.5">
              <span className="text-sm font-medium text-[#008236]">
                {formatINR(giftApplied)} Gift Card Applied
              </span>
              <button
                type="button"
                aria-label="Remove gift card"
                onClick={() => setGiftApplied(0)}
                className="text-[#008236]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setGiftsOpen(true)}
            className="mx-auto mt-3 block text-sm font-medium text-[#151515] underline underline-offset-2"
          >
            See All Gifts Cards
          </button>
        </section>

        {/* Wallet */}
        <section className="px-4 pt-5">
          <button
            type="button"
            onClick={() => setUseWallet((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <span className="text-sm text-[#151515]">
              Wallet Balance ({formatINR(WALLET_BALANCE)})
            </span>
            <span
              className={`flex size-[18px] items-center justify-center rounded ${
                useWallet ? "bg-[#151515] text-white" : "border border-[#cbd5e1] bg-white"
              }`}
            >
              {useWallet ? <MiniCheck /> : null}
            </span>
          </button>
        </section>

        {/* Totals */}
        <section className="mt-4 flex flex-col gap-2.5 border-t border-black/5 px-4 pt-4">
          <Row label="Delivery" value={<span className="font-medium text-[#1aaa3a]">FREE</span>} />
          {offerDiscount > 0 ? (
            <Row
              label="Discount"
              value={<span className="text-[#008236]">−{formatINR(offerDiscount)}</span>}
            />
          ) : null}
          {giftWrapFee > 0 ? <Row label="Gift Wrap" value={formatINR(giftWrapFee)} /> : null}
          <Row label="GST (3%)" value={formatINR(gst, true)} />
          {giftApplied > 0 ? (
            <Row label="Gift Card" value={<span className="text-[#008236]">−{formatINR(giftApplied)}</span>} />
          ) : null}
          {walletUsed > 0 ? (
            <Row label="Wallet" value={<span className="text-[#008236]">−{formatINR(walletUsed, true)}</span>} />
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-black/5 pt-3">
            <span className="text-base font-semibold text-[#151515]">Subtotal</span>
            <span className="text-base font-bold text-[#151515]">{formatINR(total, true)}</span>
          </div>
        </section>
      </main>

      {/* Sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] bg-white">
        {/* Bundle deal */}
        <div className="border-t border-black/5 px-4 pt-2.5">
          <p className="text-xs font-semibold text-[#151515]">🎁 Unlock Bundle Deal</p>
          <p className="mt-1 text-[11px] text-[#6a6a6a]">
            Add {formatINR(Math.max(0, 7396 - subtotal))} more to unlock 20% Extra off!
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e6e6e6]">
            <div
              className="h-full rounded-full bg-[#1aaa3a] transition-all"
              style={{ width: `${bundleProgress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[#9a9a9a]">
            {bundleProgress}% complete • {formatINR(subtotal)} of {formatINR(7396)}
          </p>
        </div>
        <div className="p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleCheckout}
            className="h-12 w-full rounded-xl bg-[#151515] text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue to Checkout
          </button>
        </div>
      </div>

      {/* Sheets */}
      <CouponsSheet
        open={offersOpen}
        onClose={() => setOffersOpen(false)}
        coupons={COUPONS}
        appliedCode={appliedOffer?.code}
        onApply={applyOffer}
      />
      <GiftCardsSheet open={giftsOpen} onClose={() => setGiftsOpen(false)} cards={GIFT_CARDS} />
      <AddressSheet
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses}
        selectedId={selectedAddress}
        onSelect={setSelectedAddress}
        onAdd={handleAddAddress}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6a6a6a]">{label}</span>
      <span className="font-medium text-[#151515]">{value}</span>
    </div>
  );
}
