"use client";

import { useState } from "react";
import {
  WALLET_BALANCE,
  WALLET_FAQS,
  WALLET_TXNS,
  type WalletTxn,
} from "@/data/profile";
import { formatINR } from "@/lib/format";
import { ChevronDownIcon } from "@/components/ui/icons";
import {
  ArrowDownReceiveIcon,
  ArrowUpPayIcon,
  BoltIcon,
  LockIcon,
  ShieldIcon,
} from "../icons";
import { PanelHeader } from "../ui";

const WHY_USE = [
  {
    Icon: BoltIcon,
    title: "Lightning Fast Checkout",
    body: "Complete purchases in seconds without entering payment details every time",
  },
  {
    Icon: LockIcon,
    title: "Safe & Secure",
    body: "Your money is protected with bank-level security and encryption",
  },
  {
    Icon: ShieldIcon,
    title: "Exclusive Offers",
    body: "Get special cashback and promotional credits when you use your wallet",
  },
];

function TxnRow({ txn }: { txn: WalletTxn }) {
  const received = txn.type === "received";
  return (
    <div className="flex items-center gap-3 rounded-lg px-1 py-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          received ? "bg-[#e7f6ec] text-[#1a7f37]" : "bg-[#fdf2e3] text-[#d08700]"
        }`}
      >
        {received ? (
          <ArrowDownReceiveIcon className="size-4" />
        ) : (
          <ArrowUpPayIcon className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#151515]">{txn.label}</p>
        <p className="text-xs text-[#8a8a8a]">{txn.date}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${received ? "text-[#1a7f37]" : "text-[#151515]"}`}>
          {received ? "+" : "-"}
          {formatINR(txn.amount)}
        </p>
        <p className="text-[11px] text-[#a3a3a3]">{txn.time}</p>
      </div>
    </div>
  );
}

function AllTransactions({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-[560px]">
      <PanelHeader title="All Transactions" onBack={onBack} />
      <div className="divide-y divide-[#f0f0f0]">
        {WALLET_TXNS.map((t) => (
          <TxnRow key={t.id} txn={t} />
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#f0f0f0]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm text-[#151515]"
      >
        {q}
        <ChevronDownIcon
          className={`size-4 shrink-0 text-[#6b6b6b] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <p className="pb-4 text-sm text-[#62748e]">{a}</p> : null}
    </div>
  );
}

export default function Wallet({ onExit }: { onExit: () => void }) {
  const [showAll, setShowAll] = useState(false);

  if (showAll) return <AllTransactions onBack={() => setShowAll(false)} />;

  return (
    <div className="max-w-[560px]">
      <PanelHeader title="Wallet" onBack={onExit} />

      {/* Balance */}
      <div className="rounded-2xl bg-[#fcebec] px-6 py-7 text-center">
        <p className="text-sm text-[#62748e]">Wallet Balance</p>
        <p className="my-1 text-3xl font-bold text-[#151515]">{formatINR(WALLET_BALANCE)}</p>
        <p className="text-xs text-[#8a8a8a]">Available for all purchases and transactions</p>
      </div>

      {/* Recent transactions */}
      <h3 className="mb-1 mt-6 text-sm font-semibold text-[#151515]">Recent Transactions</h3>
      <div className="divide-y divide-[#f0f0f0]">
        {WALLET_TXNS.slice(0, 6).map((t) => (
          <TxnRow key={t.id} txn={t} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowAll(true)}
        className="mx-auto mt-3 block rounded-lg border border-[#e5e5e5] px-6 py-2 text-sm font-medium text-[#151515] transition-colors hover:bg-[#f5f5f5]"
      >
        View All
      </button>

      {/* Why use */}
      <h3 className="mb-3 mt-8 text-sm font-semibold text-[#151515]">Why use Palmonas Wallet?</h3>
      <div className="space-y-3">
        {WHY_USE.map((w) => (
          <div
            key={w.title}
            className="flex items-start gap-3 rounded-xl border border-[#f0f0f0] p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fbe9ea] text-[#a0454f]">
              <w.Icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#151515]">{w.title}</p>
              <p className="text-xs text-[#8a8a8a]">{w.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h3 className="mb-1 mt-8 text-sm font-semibold text-[#151515]">
        Frequently Asked Questions
      </h3>
      <div>
        {WALLET_FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  );
}
