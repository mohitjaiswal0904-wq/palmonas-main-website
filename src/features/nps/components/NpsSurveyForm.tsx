"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  deliveryL1Options,
  deliveryPreQuestions,
  deliveryRatingLabels,
  feedbackTypes,
  followUpQuestion,
  optionalImprovementAreas,
  optionalQuestion,
  overallL1Categories,
  overallL2ByL1,
  shoppingMatrix,
  type FeedbackTypeId,
  type ScoreBand,
} from "@/features/nps/data/content";
import { cn } from "@/lib/cn";

type QuestStep = "choose" | "warmup" | "score" | "details" | "polish" | "done";

const QUEST_LABELS: Record<
  FeedbackTypeId,
  { title: string; blurb: string; mark: string }
> = {
  shopping: {
    title: "Shopping Quest",
    blurb: "Right after you place an order",
    mark: "S",
  },
  delivery: {
    title: "Delivery Quest",
    blurb: "Right after your order arrives",
    mark: "D",
  },
  overall: {
    title: "Overall Quest",
    blurb: "Day 21 — the full journey",
    mark: "O",
  },
};

function getScoreBand(score: number | null): ScoreBand | null {
  if (score === null) return null;
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

function needsDetails(
  feedbackType: FeedbackTypeId | null,
  band: ScoreBand | null,
): boolean {
  if (!band || !feedbackType) return false;
  if (feedbackType === "delivery") return band === "detractor";
  if (feedbackType === "shopping" || feedbackType === "overall") {
    return band !== "promoter";
  }
  return false;
}

function needsWarmup(feedbackType: FeedbackTypeId | null) {
  return feedbackType === "delivery";
}

const COMPLETION_BENEFITS = [
  {
    title: "100 coins added",
    detail: "When you complete this entire process, you get 100 coins.",
  },
  {
    title: "Your voice reaches the CX team",
    detail: "Your answers are reviewed and used to guide what we fix next.",
  },
  {
    title: "Priority follow-up unlocked",
    detail:
      "If your score was 6 or below, a teammate may call you within 24 hours.",
  },
  {
    title: "You helped improve Palmonas",
    detail:
      "Shopping, delivery, and product quality get better because of feedback like yours.",
  },
] as const;

const MOOD_BY_SCORE: Record<
  number,
  { emoji: string; label: string }
> = {
  0: { emoji: "😭", label: "Very sad" },
  1: { emoji: "😢", label: "Very sad" },
  2: { emoji: "😞", label: "Sad" },
  3: { emoji: "😕", label: "Not great" },
  4: { emoji: "😐", label: "Not great" },
  5: { emoji: "🙂", label: "Okay" },
  6: { emoji: "😊", label: "Okay" },
  7: { emoji: "😄", label: "Pretty good" },
  8: { emoji: "😁", label: "Pretty good" },
  9: { emoji: "🤩", label: "Very happy" },
  10: { emoji: "🥰", label: "Very happy" },
};

function scoreSegmentColor(value: number): string {
  const hue = (value / 10) * 125;
  return `hsl(${hue} 78% 48%)`;
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad),
  };
}

function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polar(cx, cy, outerR, startAngle);
  const endOuter = polar(cx, cy, outerR, endAngle);
  const startInner = polar(cx, cy, innerR, endAngle);
  const endInner = polar(cx, cy, innerR, startAngle);
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 0 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 0 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function ScorePicker({
  score,
  onChange,
}: {
  score: number | null;
  onChange: (value: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayScore = hovered ?? score;
  const mood =
    displayScore === null
      ? { emoji: "🤔", label: "Pick a score" }
      : MOOD_BY_SCORE[displayScore];

  const size = 340;
  const viewH = 210;
  const cx = size / 2;
  const cy = 178;
  const outerR = 150;
  const midR = 118;
  const innerR = 84;
  const segmentSweep = Math.PI / 11;
  const gap = 0.018;
  const emojiTop = `${(cy / viewH) * 100}%`;

  return (
    <div className="mt-8">
      <div
        className="relative mx-auto w-full max-w-[360px]"
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${size} ${viewH}`}
          className="w-full overflow-visible"
          role="img"
          aria-label="Score from 0 to 10"
        >
          {Array.from({ length: 11 }, (_, value) => {
            const startAngle = Math.PI - value * segmentSweep - gap / 2;
            const endAngle = Math.PI - (value + 1) * segmentSweep + gap / 2;
            const midAngle = (startAngle + endAngle) / 2;
            const selected = score === value;
            const color = scoreSegmentColor(value);
            const labelPos = polar(cx, cy, (outerR + midR) / 2 + 1, midAngle);

            return (
              <g key={value}>
                <path
                  d={wedgePath(cx, cy, midR, outerR, startAngle, endAngle)}
                  fill={selected ? color : "#eef0f2"}
                  className="cursor-pointer outline-none transition-[fill] duration-150"
                  style={{ outline: "none" }}
                  onMouseEnter={() => setHovered(value)}
                  onClick={() => onChange(value)}
                />
                <path
                  d={wedgePath(cx, cy, innerR, midR - 3, startAngle, endAngle)}
                  fill={color}
                  opacity={0.9}
                  className="pointer-events-none"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={selected ? "#ffffff" : "#6b7280"}
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>

        <div
          className="pointer-events-none absolute left-1/2 flex size-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#eceef1] sm:size-[104px]"
          style={{ top: emojiTop }}
        >
          <span
            key={displayScore ?? "empty"}
            className="animate-nps-xp-pop text-5xl leading-none sm:text-[56px]"
            role="img"
            aria-label={mood.label}
          >
            {mood.emoji}
          </span>
        </div>
      </div>

      <div className="mx-auto -mt-1 flex w-full max-w-[320px] justify-between px-1 text-sm text-[#9ca3af]">
        <span>Unlikely</span>
        <span>Likely</span>
      </div>
    </div>
  );
}

function ChipOption({
  selected,
  onClick,
  children,
  large,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border text-left transition-all duration-200",
        large ? "px-4 py-4" : "px-4 py-3 text-sm",
        selected
          ? "border-[#151515] bg-[#f7f7f7] shadow-[0_0_0_1px_#151515]"
          : "border-[#eee] bg-white hover:border-[#151515]/40 hover:bg-[#fafafa]",
      )}
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
            selected
              ? "border-[#151515] bg-[#151515] text-white"
              : "border-[#ddd] text-transparent",
          )}
        >
          ✓
        </span>
        <span className={cn(selected ? "font-medium text-[#151515]" : "text-[#333]")}>
          {children}
        </span>
      </span>
    </button>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[#e6e6e6] px-5 py-2.5 text-sm text-[#666] transition-colors hover:border-[#151515] hover:text-[#151515]"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className="rounded-full bg-gradient-to-r from-[#333333] to-[#151515] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default function NpsSurveyForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType =
    typeParam === "shopping" ||
    typeParam === "delivery" ||
    typeParam === "overall"
      ? typeParam
      : null;

  const [step, setStep] = useState<QuestStep>(
    initialType ? (needsWarmup(initialType) ? "warmup" : "score") : "choose",
  );
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeId | null>(
    initialType,
  );
  const [score, setScore] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [overallL1, setOverallL1] = useState<string | null>(null);
  const [overallL2, setOverallL2] = useState<Set<string>>(() => new Set());
  const [storeL2Category, setStoreL2Category] = useState<string | null>(null);
  const [deliveryShorterTime, setDeliveryShorterTime] = useState<
    "yes" | "no" | null
  >(null);
  const [deliveryBehaviour, setDeliveryBehaviour] = useState("");
  const [deliveryRatings, setDeliveryRatings] = useState<
    Record<string, string>
  >({});
  const [deliveryTexts, setDeliveryTexts] = useState<Record<string, string>>(
    {},
  );
  const [remarksEnabled, setRemarksEnabled] = useState<"yes" | "no" | null>(
    null,
  );
  const [optionalAreas, setOptionalAreas] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [stepKey, setStepKey] = useState(0);

  const activeType = feedbackTypes.find((t) => t.id === feedbackType);
  const band = getScoreBand(score);
  const showDetails = needsDetails(feedbackType, band);

  const goTo = (next: QuestStep) => {
    setStepKey((k) => k + 1);
    setStep(next);
  };

  const resetFollowUp = () => {
    setSelectedIds(new Set());
    setOverallL1(null);
    setOverallL2(new Set());
    setStoreL2Category(null);
    setDeliveryRatings({});
    setDeliveryTexts({});
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleOverallL2 = (value: string) => {
    setOverallL2((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleArea = (area: string) => {
    setOptionalAreas((prev) =>
      prev.includes(area)
        ? prev.filter((item) => item !== area)
        : [...prev, area],
    );
  };

  if (step === "done") {
    const title =
      score !== null && score >= 9
        ? "Quest complete, champion!"
        : score !== null && score >= 7
          ? "Quest complete — thanks for leveling us up"
          : "Quest complete — we'll make this right";

    return (
      <div className="relative overflow-hidden rounded-3xl border border-[#eee] bg-gradient-to-b from-[#fafafa] to-white px-6 py-14 text-center sm:px-10">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="animate-nps-confetti pointer-events-none absolute text-lg"
            style={{
              left: `${10 + i * 11}%`,
              bottom: "20%",
              animationDelay: `${i * 0.08}s`,
              color: i % 2 === 0 ? "#151515" : "#333333",
            }}
          >
            ★
          </span>
        ))}
        <div className="animate-nps-step-in relative">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#333333] to-[#151515] text-2xl text-white shadow-lg">
            ★
          </div>
          <h2 className="mt-5 font-heading text-2xl text-[#151515] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-base font-semibold text-[#151515]">
            You earned 100 coins
          </p>
          <p className="mt-2 text-sm text-[#666]">
            Here’s what you’ve unlocked by completing the full flow:
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {COMPLETION_BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className="flex gap-3 rounded-2xl border border-[#eee] bg-[#fafafa] px-4 py-3"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#151515] text-[10px] font-bold text-white">
                  ✓
                </span>
                <span>
                  <span className="block text-sm font-medium text-[#151515]">
                    {benefit.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#666]">
                    {benefit.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {score !== null && score <= 6 ? (
            <p className="mt-5 text-sm font-medium text-[#151515]">
              A teammate may reach out within 24 hours.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setFeedbackType(null);
              setScore(null);
              resetFollowUp();
              setDeliveryShorterTime(null);
              setDeliveryBehaviour("");
              setRemarksEnabled(null);
              setOptionalAreas([]);
              setRemarks("");
              goTo("choose");
            }}
            className="mt-8 rounded-full border border-[#e6e6e6] px-5 py-2.5 text-sm text-[#666] transition-colors hover:border-[#151515] hover:text-[#151515]"
          >
            Share more feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#eee] bg-white p-5 shadow-sm sm:p-8">
      <div key={stepKey} className="animate-nps-step-in">
        {step === "choose" ? (
          <div>
            <h2 className="font-heading text-2xl text-[#151515]">
              Pick your quest
            </h2>
            <p className="mt-1 text-sm text-[#666]">
              Complete this entire process and you’ll get 100 coins.
            </p>
            <div className="mt-6 grid gap-3">
              {feedbackTypes.map((type) => {
                const meta = QUEST_LABELS[type.id];
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setFeedbackType(type.id);
                      setScore(null);
                      resetFollowUp();
                      goTo(needsWarmup(type.id) ? "warmup" : "score");
                    }}
                    className="group flex items-center gap-4 rounded-2xl border border-[#eee] bg-white px-4 py-4 text-left transition-all hover:border-[#151515]/50 hover:bg-[#fafafa] hover:shadow-sm"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f5f5] text-sm font-bold text-[#151515] transition-transform group-hover:scale-105">
                      {meta.mark}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#151515]">
                        {meta.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#888]">
                        {meta.blurb}
                      </span>
                    </span>
                    <span className="ml-auto text-[#151515] opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === "warmup" && activeType ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9b848c]">
              {QUEST_LABELS.delivery.title}
            </p>
            <h2 className="mt-2 font-heading text-2xl text-[#151515]">
              Quick warm-up
            </h2>
            <p className="mt-1 text-sm text-[#666]">
              Two fast questions before your score.
            </p>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-[#151515]">
                {deliveryPreQuestions.shorterDeliveryTime}
              </legend>
              <div className="mt-3 flex gap-2">
                {(["yes", "no"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDeliveryShorterTime(option)}
                    className={cn(
                      "flex-1 rounded-2xl border py-3 text-sm capitalize transition-all",
                      deliveryShorterTime === option
                        ? "border-[#151515] bg-[#f7f7f7] font-medium text-[#151515]"
                        : "border-[#eee] text-[#444] hover:border-[#151515]/40",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-6 block">
              <span className="text-sm font-medium text-[#151515]">
                {deliveryPreQuestions.deliveryPersonBehaviour}
              </span>
              <input
                type="text"
                value={deliveryBehaviour}
                onChange={(e) => setDeliveryBehaviour(e.target.value)}
                placeholder="Tell us briefly..."
                className="mt-2 w-full rounded-2xl border border-[#e5e5e5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#151515]"
              />
            </label>

            <NavButtons
              onBack={() => {
                setFeedbackType(null);
                goTo("choose");
              }}
              onNext={() => goTo("score")}
              nextDisabled={deliveryShorterTime === null}
            />
          </div>
        ) : null}

        {step === "score" && activeType ? (
          <div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl leading-snug text-[#151515] sm:text-[28px]">
                {activeType.primaryQuestion}
                {activeType.primaryQuestion.endsWith("?") ||
                activeType.primaryQuestion.endsWith(".")
                  ? ""
                  : "?"}
              </h2>
              <p className="text-sm text-[#666]">
                Complete and earn{" "}
                <span className="font-bold text-[#151515]">100 Coins</span>
              </p>
            </div>
            <ScorePicker
              score={score}
              onChange={(value) => {
                setScore(value);
                resetFollowUp();
              }}
            />
            <NavButtons
              onBack={() =>
                goTo(needsWarmup(feedbackType) ? "warmup" : "choose")
              }
              onNext={() => {
                if (needsDetails(feedbackType, getScoreBand(score))) {
                  goTo("details");
                } else {
                  goTo("polish");
                }
              }}
              nextDisabled={score === null}
            />
          </div>
        ) : null}

        {step === "details" && band && feedbackType ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9b848c]">
              Detail round
            </p>
            <h2 className="mt-2 font-heading text-2xl text-[#151515]">
              {followUpQuestion}
            </h2>
            <p className="mt-1 text-sm text-[#666]">
              Tap everything that applies — each tip helps us improve.
            </p>

            {feedbackType === "shopping" ? (
              <div className="mt-5 grid gap-2">
                {shoppingMatrix.map((row) => (
                  <div key={row.id}>
                    <ChipOption
                      selected={selectedIds.has(row.id)}
                      onClick={() => toggleId(row.id)}
                    >
                      {row.l1}
                    </ChipOption>
                    {band === "passive" &&
                    row.l2 &&
                    selectedIds.has(row.id) ? (
                      <p className="mt-2 ml-2 rounded-xl bg-[#f5f5f5] px-3 py-2 text-xs text-[#666]">
                        {row.l2}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {feedbackType === "delivery" ? (
              <div className="mt-5 grid gap-3">
                {deliveryL1Options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      selectedIds.has(option.id)
                        ? "border-[#151515] bg-[#f7f7f7]"
                        : "border-[#eee]",
                    )}
                  >
                    <ChipOption
                      selected={selectedIds.has(option.id)}
                      onClick={() => toggleId(option.id)}
                    >
                      {option.label}
                    </ChipOption>
                    {selectedIds.has(option.id) &&
                    option.ratingType === "GoodBadWorst" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {deliveryRatingLabels.map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setDeliveryRatings((prev) => ({
                                ...prev,
                                [option.id]: rating,
                              }))
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs transition-colors",
                              deliveryRatings[option.id] === rating
                                ? "border-[#151515] bg-[#151515] text-white"
                                : "border-[#e6e6e6] bg-white text-[#444]",
                            )}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {selectedIds.has(option.id) &&
                    option.ratingType === "Text" ? (
                      <textarea
                        value={deliveryTexts[option.id] ?? ""}
                        onChange={(e) =>
                          setDeliveryTexts((prev) => ({
                            ...prev,
                            [option.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Add a note..."
                        className="mt-3 w-full rounded-xl border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#151515]"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {feedbackType === "overall" ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-2">
                  {overallL1Categories.map((category) => (
                    <ChipOption
                      key={category.id}
                      selected={overallL1 === category.id}
                      onClick={() => {
                        setOverallL1(category.id);
                        setOverallL2(new Set());
                        setStoreL2Category(null);
                      }}
                    >
                      {category.label}
                    </ChipOption>
                  ))}
                </div>

                {overallL1 && overallL2ByL1[overallL1] ? (
                  <div className="rounded-2xl border border-[#f0e6ea] bg-[#fffbfc] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#9b848c]">
                      Next level — {overallL2ByL1[overallL1].label}
                    </p>
                    {overallL2ByL1[overallL1].options.length > 0 ? (
                      <div className="mt-3 grid gap-2">
                        {overallL2ByL1[overallL1].options.map((option) => (
                          <ChipOption
                            key={option}
                            selected={overallL2.has(option)}
                            onClick={() => toggleOverallL2(option)}
                          >
                            {option}
                          </ChipOption>
                        ))}
                      </div>
                    ) : null}

                    {overallL2ByL1[overallL1].children?.length ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {overallL2ByL1[overallL1].children!.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => setStoreL2Category(child.id)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                                storeL2Category === child.id
                                  ? "border-[#151515] bg-[#151515] text-white"
                                  : "border-[#e6e6e6] bg-white text-[#444]",
                              )}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                        {storeL2Category
                          ? overallL2ByL1[overallL1].children
                              ?.find((c) => c.id === storeL2Category)
                              ?.options.map((option) => (
                                <ChipOption
                                  key={option}
                                  selected={overallL2.has(option)}
                                  onClick={() => toggleOverallL2(option)}
                                >
                                  {option}
                                </ChipOption>
                              ))
                          : null}
                      </div>
                    ) : null}

                    {overallL2ByL1[overallL1].options.length === 0 &&
                    !overallL2ByL1[overallL1].children?.length ? (
                      <p className="mt-2 text-sm text-[#666]">
                        No preset options — add remarks in the next step.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <NavButtons
              onBack={() => goTo("score")}
              onNext={() => goTo("polish")}
              nextLabel="Continue"
            />
          </div>
        ) : null}

        {step === "polish" ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9b848c]">
              Final stretch
            </p>
            <h2 className="mt-2 font-heading text-2xl text-[#151515]">
              Polish your feedback
            </h2>
            <p className="mt-1 text-sm text-[#666]">{optionalQuestion}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {optionalImprovementAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all sm:text-sm",
                    optionalAreas.includes(area)
                      ? "border-[#151515] bg-[#151515] text-white"
                      : "border-[#e6e6e6] bg-white text-[#444] hover:border-[#151515]/40",
                  )}
                >
                  {area}
                </button>
              ))}
            </div>

            {band === "promoter" && feedbackType === "overall" ? (
              <label className="mt-6 block">
                <span className="text-sm font-medium text-[#151515]">
                  What did you like?
                </span>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Share the win..."
                  className="mt-2 w-full rounded-2xl border border-[#e5e5e5] px-4 py-3 text-sm outline-none focus:border-[#151515]"
                />
              </label>
            ) : null}

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-[#151515]">
                Add remarks? (optional)
              </legend>
              <div className="mt-3 flex gap-2">
                {(["yes", "no"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRemarksEnabled(option)}
                    className={cn(
                      "flex-1 rounded-2xl border py-3 text-sm capitalize transition-all",
                      remarksEnabled === option
                        ? "border-[#151515] bg-[#f7f7f7] font-medium"
                        : "border-[#eee] text-[#444]",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            {remarksEnabled === "yes" ? (
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Anything else we should know..."
                className="mt-4 w-full rounded-2xl border border-[#e5e5e5] px-4 py-3 text-sm outline-none focus:border-[#151515]"
              />
            ) : null}

            <NavButtons
              onBack={() => goTo(showDetails ? "details" : "score")}
              onNext={() => goTo("done")}
              nextLabel="Submit feedback"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
