"use client";

import { useEffect } from "react";
import { ReviewCard } from "./ui";
import type { Review } from "./types";

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function AllReviewsOverlay({
  open,
  onClose,
  reviews,
}: {
  open: boolean;
  onClose: () => void;
  reviews: Review[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/30 lg:items-center lg:p-6">
      <div className="flex h-full w-full max-w-[480px] flex-col bg-white [animation:sheet-up_0.28s_cubic-bezier(0.22,0.61,0.36,1)] lg:h-auto lg:max-h-[85vh] lg:max-w-[640px] lg:overflow-hidden lg:rounded-2xl lg:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-[#ededed] px-4 py-4 lg:px-6">
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            className="transition-opacity hover:opacity-70"
          >
            <BackIcon />
          </button>
          <h2 className="text-base font-semibold text-[#151515]">All Reviews</h2>
        </header>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 lg:px-6">
          <div className="flex items-center justify-between py-4">
            <p className="text-base font-semibold text-[#151515]">
              {reviews.length} Reviews
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#151515]"
            >
              Most Recent
              <ChevronDown />
            </button>
          </div>

          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} className="last:border-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
