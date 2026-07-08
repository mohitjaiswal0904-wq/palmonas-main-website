"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

function ThumbIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 10v11" />
      <path d="M14.7 3.3 14 6c-.2.7 0 1.5.4 2.1.4.6 1.1.9 1.8.9H20a2 2 0 0 1 2 2.3l-1.4 6A2 2 0 0 1 18.6 21H7V10l3.1-6.9A2.3 2.3 0 0 1 14.7 3.3Z" />
    </svg>
  );
}

export default function ReviewVotes({
  likes = 0,
  dislikes = 0,
}: {
  likes?: number;
  dislikes?: number;
}) {
  const [vote, setVote] = useState<"like" | "dislike" | null>(null);

  const likeCount = likes + (vote === "like" ? 1 : 0);
  const dislikeCount = dislikes + (vote === "dislike" ? 1 : 0);

  const toggle = (next: "like" | "dislike") =>
    setVote((prev) => (prev === next ? null : next));

  return (
    <div className="flex shrink-0 items-center gap-3.5">
      <button
        type="button"
        aria-pressed={vote === "like"}
        aria-label="Helpful"
        onClick={() => toggle("like")}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          vote === "like" ? "text-[#151515]" : "text-[#8a8a8a] hover:text-[#151515]",
        )}
      >
        <ThumbIcon filled={vote === "like"} />
        <span className="tabular-nums">{likeCount}</span>
      </button>

      <button
        type="button"
        aria-pressed={vote === "dislike"}
        aria-label="Not helpful"
        onClick={() => toggle("dislike")}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          vote === "dislike" ? "text-[#151515]" : "text-[#8a8a8a] hover:text-[#151515]",
        )}
      >
        <span className="rotate-180">
          <ThumbIcon filled={vote === "dislike"} />
        </span>
        <span className="tabular-nums">{dislikeCount}</span>
      </button>
    </div>
  );
}
