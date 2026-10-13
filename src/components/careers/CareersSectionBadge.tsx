interface CareersSectionBadgeProps {
  label: string;
}

/** Gradient pill badge shared across Careers page sections. */
export function CareersSectionBadge({ label }: CareersSectionBadgeProps) {
  return (
    <div className="mx-auto mb-2 flex w-fit max-w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#fff4d4_0%,#ebe4f5_100%)] px-4 py-2">
      <span className="size-3 shrink-0 rounded-full bg-[#e8b84a]" aria-hidden="true" />
      <span className="font-nunito-sans text-xs font-semibold tracking-wide whitespace-nowrap text-[#3d2c24]">
        {label}
      </span>
    </div>
  );
}
