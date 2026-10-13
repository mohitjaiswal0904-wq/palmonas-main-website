"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ReviewCard, Stars } from "./ui";
import { SAMPLE_BREAKDOWN, SAMPLE_REVIEWS } from "./data";
import type { NewReview, RatingBreakdown, Review } from "./types";
import WriteReviewSheet from "./WriteReviewSheet";
import AllReviewsOverlay from "./AllReviewsOverlay";

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SmallStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5B301" aria-hidden>
      <path d="m12 2 2.9 6.26L21.5 9.2l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.16L2.5 9.2l6.6-.94L12 2Z" />
    </svg>
  );
}

function Toast({ kind }: { kind: "success" | "error" }) {
  const success = kind === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 lg:bottom-10">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm [animation:badge-fade-slide_0.25s_ease-out]",
          success
            ? "bg-[#eafaf0] text-[#15803d]"
            : "bg-[#fdecec] text-[#c2410c]",
        )}
      >
        {success ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        )}
        {success
          ? "Review Added Successfully!"
          : "Oops! Something went wrong. Please try again."}
      </div>
    </div>
  );
}

function RatingBar({
  star,
  count,
  max,
}: {
  star: number;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.max((count / max) * 100, 2) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 text-sm text-[#151515]">{star}</span>
      <SmallStar />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e5e5e5]">
        <div className="h-full rounded-full bg-[#151515]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right text-sm text-[#8a8a8a]">{count}</span>
    </div>
  );
}

export default function ReviewsSection({
  avg = 4.3,
  count = 41,
  initialReviews = SAMPLE_REVIEWS,
  breakdown = SAMPLE_BREAKDOWN,
}: {
  avg?: number;
  count?: number;
  initialReviews?: Review[];
  breakdown?: RatingBreakdown;
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);

  const maxCount = Math.max(...(Object.values(breakdown) as number[]), 1);

  const showToast = (kind: "success" | "error") => {
    setToast(kind);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (review: NewReview): boolean => {
    setReviews((prev) => [
      {
        id: `new-${Date.now()}`,
        name: "You",
        initials: "YO",
        rating: review.rating,
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        body: review.body,
      },
      ...prev,
    ]);
    showToast("success");
    return true;
  };

  const desktopVisible = 4;

  return (
    <section className="mx-auto w-full max-w-[480px] px-4 py-8 lg:max-w-[1200px] lg:px-10 lg:py-14">
      {/* Section title (desktop only) */}
      <h2 className="hidden text-2xl font-bold text-[#151515] lg:block">
        Ratings &amp; Reviews
      </h2>

      <div className="lg:mt-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-14">
        {/* Summary column */}
        <div className="lg:sticky lg:top-24">
          {/* Mobile header with inline average */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-bold text-[#151515]">
              Ratings &amp; Reviews
            </h2>
            <span className="flex items-center gap-1.5 text-base font-bold text-[#151515]">
              {avg.toFixed(1)}
              <SmallStar />
              <span className="ml-1 text-sm font-normal text-[#8a8a8a]">
                {count} reviews
              </span>
            </span>
          </div>

          {/* Desktop average block */}
          <div className="hidden flex-col items-center rounded-2xl bg-[#faf7f4] p-8 text-center lg:flex">
            <p className="text-5xl font-bold leading-none text-[#151515]">
              {avg.toFixed(1)}
            </p>
            <div className="mt-3">
              <Stars value={avg} size={20} />
            </div>
            <p className="mt-2 text-sm text-[#8a8a8a]">Based on {count} reviews</p>
          </div>

          {/* Breakdown bars */}
          <div className="mt-5 flex flex-col gap-3 lg:mt-6">
            {([5, 4, 3, 2, 1] as const).map((s) => (
              <RatingBar key={s} star={s} count={breakdown[s]} max={maxCount} />
            ))}
          </div>

          {/* Write a Review */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-6 h-12 w-full rounded-lg bg-[#151515] text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Write a Review
          </button>
        </div>

        {/* List column */}
        <div className="mt-8 lg:mt-0">
          {/* List header */}
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-[#151515] lg:text-lg">
              {reviews.length} Reviews
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#151515] transition-colors hover:border-[#151515]"
            >
              Most Recent
              <ChevronDown />
            </button>
          </div>

          {/* Reviews — 3 on mobile, a few more on desktop */}
          <div className="mt-2 lg:mt-4">
            {reviews.slice(0, 3).map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                className="last:border-0 lg:hidden"
              />
            ))}
            {reviews.slice(0, desktopVisible).map((r) => (
              <ReviewCard
                key={`d-${r.id}`}
                review={r}
                className="hidden last:border-0 lg:block"
              />
            ))}
          </div>

          {/* View All */}
          {reviews.length > 3 ? (
            <div className="mt-6 flex justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => setAllOpen(true)}
                className="rounded-full border border-[#151515] px-7 py-2 text-sm font-medium text-[#151515] transition-colors hover:bg-[#151515] hover:text-white"
              >
                View All
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <WriteReviewSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
      />
      <AllReviewsOverlay
        open={allOpen}
        onClose={() => setAllOpen(false)}
        reviews={reviews}
      />
      {toast ? <Toast kind={toast} /> : null}
    </section>
  );
}
