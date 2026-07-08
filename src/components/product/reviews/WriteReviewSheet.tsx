"use client";

import { useRef, useState } from "react";
import BottomSheet from "@/components/cart/BottomSheet";
import { cn } from "@/lib/cn";
import type { NewReview } from "./types";

const MIN_CHARS = 10;
const MAX_CHARS = 500;

function StarButton({
  index,
  value,
  hover,
  onRate,
  onHover,
}: {
  index: number;
  value: number;
  hover: number;
  onRate: (n: number) => void;
  onHover: (n: number) => void;
}) {
  const active = (hover || value) >= index;
  return (
    <button
      type="button"
      aria-label={`Rate ${index} star${index > 1 ? "s" : ""}`}
      onClick={() => onRate(index)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(0)}
      className="transition-transform hover:scale-110"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
        <path
          d="m12 2 2.9 6.26L21.5 9.2l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.16L2.5 9.2l6.6-.94L12 2Z"
          fill={active ? "#F5B301" : "none"}
          stroke={active ? "#F5B301" : "#d4d4d4"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export default function WriteReviewSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: NewReview) => Promise<boolean> | boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const valid = rating > 0 && text.trim().length >= MIN_CHARS;

  const reset = () => {
    setRating(0);
    setHover(0);
    setText("");
    setFileName("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({ rating, body: text.trim(), fileName });
    if (ok) {
      reset();
      onClose();
    } else {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="Write a Review"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 flex-1 rounded-lg border border-[#151515] text-sm font-semibold text-[#151515] transition-colors hover:bg-black/[0.03]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className={cn(
              "h-12 flex-1 rounded-lg text-sm font-semibold text-white transition-opacity",
              valid && !submitting
                ? "bg-[#151515] hover:opacity-90"
                : "cursor-not-allowed bg-[#bcbcbc]",
            )}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      }
    >
      {/* Rating */}
      <div className="pt-1">
        <p className="text-sm font-semibold text-[#151515]">
          Rating<span className="text-[#e0533a]">*</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarButton
              key={i}
              index={i}
              value={rating}
              hover={hover}
              onRate={setRating}
              onHover={setHover}
            />
          ))}
        </div>
      </div>

      {/* Review text */}
      <div className="mt-6">
        <label htmlFor="review-text" className="text-sm font-semibold text-[#151515]">
          Your Review
        </label>
        <textarea
          id="review-text"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about the product…"
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-[#e0e0e0] p-3 text-sm text-[#151515] outline-none placeholder:text-[#9a9a9a] focus:border-[#151515]"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-[#8a8a8a]">
          <span>Minimum {MIN_CHARS} characters</span>
          <span>
            {text.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Upload */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-[#151515]">
          Upload File (Optional)
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#e0e0e0] p-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#d4d4d4] bg-[#f7f7f7] px-3 py-1.5 text-xs font-medium text-[#404040]"
          >
            <UploadIcon />
            Choose File
          </button>
          <span className="truncate text-xs text-[#8a8a8a]">
            {fileName || "No file chosen"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </div>
        <p className="mt-2 text-xs text-[#8a8a8a]">
          Supported formats: JPG, PNG, JPEG (Max 10MB)
        </p>
      </div>
    </BottomSheet>
  );
}
