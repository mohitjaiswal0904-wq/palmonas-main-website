import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Review } from "./types";
import ReviewVotes from "./ReviewVotes";

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <path
              d="m12 2 2.9 6.26L21.5 9.2l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.16L2.5 9.2l6.6-.94L12 2Z"
              fill={filled ? "#F5B301" : "#e3e3e3"}
            />
          </svg>
        );
      })}
    </div>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0e0db] text-sm font-semibold text-[#9a6b5e]">
      {initials}
    </span>
  );
}

/** Up to 3 image thumbnails; the 3rd shows a "+N" overlay when there are more. */
function ReviewImages({ images }: { images: string[] }) {
  const shown = images.slice(0, 3);
  const extra = images.length - 3;
  return (
    <div className="mt-3 flex gap-3">
      {shown.map((src, i) => {
        const isLast = i === 2 && extra > 0;
        return (
          <div
            key={i}
            className="relative size-[88px] overflow-hidden rounded-md bg-[#ededed]"
          >
            {src ? (
              <Image src={src} alt="Review" fill className="object-cover" sizes="88px" />
            ) : null}
            {isLast ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                +{extra}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ReviewCard({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  return (
    <article className={cn("border-b border-[#ededed] py-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={review.initials} />
          <div>
            <p className="text-sm font-semibold text-[#151515]">{review.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <Stars value={review.rating} />
              <span className="text-xs text-[#8a8a8a]">{review.date}</span>
            </div>
          </div>
        </div>
        <ReviewVotes likes={review.likes} dislikes={review.dislikes} />
      </div>

      {review.images && review.images.length > 0 ? (
        <ReviewImages images={review.images} />
      ) : null}

      {review.title ? (
        <p className="mt-3 text-sm font-semibold text-[#151515]">{review.title}</p>
      ) : null}
      <p className="mt-1 text-sm leading-relaxed text-[#525252]">{review.body}</p>
    </article>
  );
}
