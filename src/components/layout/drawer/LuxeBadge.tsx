interface LuxeBadgeProps {
  text: string;
}

export function LuxeBadge({ text }: LuxeBadgeProps) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#E3C631] px-[0.29rem] py-[0.15rem] text-[0.5rem] leading-none font-normal text-white capitalize">
      {text}
    </span>
  );
}
