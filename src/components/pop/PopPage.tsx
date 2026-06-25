"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatINR } from "@/lib/format";
import {
  CalendarPayIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  EnrollIcon,
  GemIcon,
  GiftIcon,
  HeartIcon,
  HelpIcon,
  RedeemIcon,
  ShieldIcon,
  ShopBagIcon,
  SlidersIcon,
  TagIcon,
} from "./icons";

const STEPS = [
  { Icon: EnrollIcon, title: "Enroll in Plan", body: "Choose your monthly installment amount and register" },
  { Icon: CalendarPayIcon, title: "Pay for 5 Months", body: "Pay for 5 months at your selected amount" },
  { Icon: GiftIcon, title: "Get 6th Month FREE", body: "We add the 6th month's value to your plan absolutely free!" },
  { Icon: ShopBagIcon, title: "Shop Your Choice", body: "Redeem your plan value on any jewellery from our collection" },
];

const PLAN_POINTS = [
  "Pay for only 5 months",
  "6 month contribution is FREE-month's",
  "No hidden charges",
  "Buy any jewellery from collection",
];

const FEATURES = [
  { Icon: GemIcon, title: "Premium Collection", body: "Access to our entire range of gold, diamond & platinum jewellery" },
  { Icon: TagIcon, title: "Extra Benefits", body: "Get discounts on making charges & special offers" },
  { Icon: ShieldIcon, title: "100% Secure", body: "Your savings are completely safe and insured" },
  { Icon: SlidersIcon, title: "Flexible Plans", body: "Choose instalment amounts that suit your budget" },
  { Icon: RedeemIcon, title: "Instant Redemption", body: "Redeem your plan anytime after completion" },
  { Icon: HeartIcon, title: "Lifetime Support", body: "24/7 customer service for all your queries" },
];

const POPULAR_QUESTIONS = [
  "Minimum monthly amount: ₹1,000",
  "Redemption: Days 151-210 (60-day window)",
  "You can open multiple plans",
];

const MIN = 1000;
const MAX = 50000;
const STEP = 1000;

function SectionTitle({
  title,
  subtitle,
  embedded,
}: {
  title: string;
  subtitle: string;
  embedded?: boolean;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <h2 className={`font-bold text-[#151515] ${embedded ? "text-2xl" : "text-3xl"}`}>
        {title}
      </h2>
      <p className="mt-2 text-[15px] text-[#8a8a8a]">{subtitle}</p>
    </div>
  );
}

/**
 * The POP landing sections. Rendered full-bleed as the standalone `/pop` page,
 * or `embedded` (rounded, tighter spacing) inside the account "Plan of Purchase".
 */
export function PopSections({ embedded = false }: { embedded?: boolean }) {
  const [monthly, setMonthly] = useState(3000);
  const instalments = monthly * 5;
  const bonus = monthly;
  const total = monthly * 6;
  const pct = ((monthly - MIN) / (MAX - MIN)) * 100;

  const px = embedded ? "" : "px-6 lg:px-8";
  const sectionPad = embedded ? "py-8" : "py-16";

  return (
    <>
      {/* Hero */}
      <section
        className={`bg-gradient-to-br from-[#fdf4ec] via-[#fdf6f0] to-[#fcede3] ${
          embedded ? "rounded-2xl" : "w-full"
        }`}
      >
        <div
          className={`mx-auto grid w-full max-w-[1296px] grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
            embedded ? "p-6" : "px-6 py-16 lg:px-8"
          }`}
        >
          <div>
            <h1
              className={`bg-gradient-to-r from-[#d4a017] via-[#b06a3a] to-[#7a2e8f] bg-clip-text font-extrabold tracking-tight text-transparent ${
                embedded ? "text-4xl" : "text-5xl sm:text-6xl"
              }`}
            >
              Pay 5, Get 6
            </h1>
            <p className="mt-4 text-lg text-[#3f3f46]">
              A flexible monthly savings plan for your dream jewellery
            </p>

            <div className="mt-8 inline-flex items-stretch gap-0 rounded-2xl bg-white/60 px-2 py-4 backdrop-blur">
              {[
                { value: "5+1", label: "Monthly Plan" },
                { value: "100%", label: "Secure" },
                { value: "Free", label: "6th Month" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-4 text-center sm:px-6 ${i !== 0 ? "border-l border-[#e7d8c9]" : ""}`}
                >
                  <p className="text-2xl font-bold text-[#7a2e8f] sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#6b6b6b]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[924/544] w-full overflow-hidden rounded-2xl">
            <Image
              src="/pop/hero.png"
              alt="Gold chain necklace and gemstone ring"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`mx-auto w-full max-w-[1296px] ${px} ${sectionPad}`}>
        <SectionTitle title="How It Works" subtitle="Simple steps to start your savings journey" embedded={embedded} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-[#f0eaea] p-6 text-center">
              <span className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-[#fbe9ea] text-[#a0454f]">
                <step.Icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold text-[#151515]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#8a8a8a]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan card */}
      <section className={`mx-auto w-full max-w-[1296px] ${px} ${embedded ? "pb-8" : "pb-16"}`}>
        <div className="rounded-2xl border border-[#e7d8c9] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg text-[#8a8a8a]">Starting from</p>
              <p className="text-5xl font-bold text-[#151515]">{formatINR(1000)}</p>
              <p className="mt-1 text-lg text-[#8a8a8a]">per month</p>
            </div>
            <div className="rounded-xl bg-[#e7f6ec] px-5 py-3 text-center">
              <p className="text-sm text-[#3f6b48]">1 Month</p>
              <p className="text-2xl font-bold text-[#1a7f37]">FREE</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#ecfdf3] p-4">
            <p className="text-lg text-[#3f6b48]">Total Value After 6 Months</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold text-[#1a7f37]">{formatINR(6000)}</span>
              <span className="rounded-full bg-[#d4f3df] px-3 py-1 text-sm font-medium text-[#1a7f37]">
                Pay only {formatINR(5000)}
              </span>
            </div>
          </div>

          <ul className="mt-6 space-y-4">
            {PLAN_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[15px] text-[#3f3f46]">
                <CheckCircleIcon className="size-5 shrink-0 text-[#1a7f37]" />
                {point}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-6 h-12 w-full rounded-lg bg-[#151515] text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start Saving Now
          </button>
        </div>
      </section>

      {/* Calculate Your Savings */}
      <section className={`bg-[#f6f6f6] ${embedded ? "rounded-2xl py-10" : "w-full py-16"}`}>
        <div className={`mx-auto w-full max-w-[1296px] ${embedded ? "px-4" : "px-6 lg:px-8"}`}>
          <SectionTitle
            title="Calculate Your Savings"
            subtitle="See how much you'll save with our 5+1 offer-save"
            embedded={embedded}
          />
          <div className="mx-auto max-w-[960px] rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-[#151515]">
              Monthly Instalment (Multiples of ₹1,000 only)
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#151515]">{formatINR(monthly)}</span>
              <span className="text-[#8a8a8a]">Start Investing</span>
            </div>
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="pop-range mt-3 w-full"
              style={{ background: `linear-gradient(to right, #151515 ${pct}%, #e5e5e5 ${pct}%)` }}
              aria-label="Monthly instalment amount"
            />

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-[#3f3f46]">
                <span>Your Total Instalments (5 Months)</span>
                <span className="font-medium text-[#151515]">{formatINR(instalments)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#3f3f46]">
                <span>Palmonas Bonus (6th Month)</span>
                <span className="font-medium text-[#1a7f37]">{formatINR(bonus)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#ececec] pt-3">
                <span className="text-base font-semibold text-[#151515]">
                  Total Redeemable Amount
                </span>
                <span className="text-xl font-bold text-[#151515]">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 h-12 w-full rounded-lg bg-[#151515] text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Calculate
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Saving Plan */}
      <section className={`mx-auto w-full max-w-[1296px] ${px} ${sectionPad}`}>
        <SectionTitle title="Why Choose Saving Plan?" subtitle="Simple steps to start your savings journey" embedded={embedded} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-xl border border-[#f0eaea] p-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#fbe9ea] text-[#a0454f]">
                <f.Icon className="size-7" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#151515]">{f.title}</h3>
                <p className="mt-1 text-sm text-[#8a8a8a]">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={`mx-auto w-full max-w-[768px] ${px} ${embedded ? "pb-4" : "pb-20"}`}>
        <h2 className="mb-8 text-center text-2xl font-bold text-[#151515]">
          Frequently asked Questions
        </h2>

        <Link
          href="#"
          className="flex items-center justify-between rounded-xl border border-[#f0eaea] p-4 transition-colors hover:bg-[#faf7f7]"
        >
          <span className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#fbe9ea] text-[#a0454f]">
              <HelpIcon className="size-7" />
            </span>
            <span>
              <span className="block text-base font-medium text-[#151515]">View All FAQs</span>
              <span className="block text-[13px] text-[#8a8a8a]">
                26 questions covering Generic, Enrollment, Redemption & Policy
              </span>
            </span>
          </span>
          <ChevronRightIcon className="size-5 shrink-0 text-[#bdbdbd]" />
        </Link>

        <div className="mt-3 rounded-xl bg-[#f6f6f6] p-4">
          <p className="text-sm font-semibold text-[#151515]">Popular Questions</p>
          <ul className="mt-3 space-y-2">
            {POPULAR_QUESTIONS.map((q) => (
              <li key={q} className="flex gap-2 text-sm text-[#62748e]">
                <span className="text-[#a0454f]">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export default function PopPage() {
  return (
    <main className="w-full bg-white">
      <PopSections />
    </main>
  );
}
