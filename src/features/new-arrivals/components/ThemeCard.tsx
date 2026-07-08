import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { PRODUCT_IMAGE } from "@/data/products";

export default function ThemeCard({
  label,
  handle,
  rotate = 0,
}: {
  label: string;
  handle: string;
  rotate?: number;
}) {
  const card = (
    <Link
      href={`/collection/${handle}`}
      className="relative block h-40 w-[150px] overflow-hidden rounded-[9px] border border-[#EDE4EA] bg-white sm:h-44 sm:w-40"
    >
      <Image
        src={PRODUCT_IMAGE}
        alt={label}
        fill
        sizes="160px"
        className="object-cover opacity-90"
      />
      <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#E5D5DC] bg-[#EDE4EA] px-2.5 py-1 text-[11px] font-medium text-[#8B6B75] sm:text-xs">
        {label}
        <ArrowIcon className="size-2.5" />
      </span>
    </Link>
  );

  if (!rotate) return card;

  return (
    <div
      className="flex items-center justify-center"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {card}
    </div>
  );
}
