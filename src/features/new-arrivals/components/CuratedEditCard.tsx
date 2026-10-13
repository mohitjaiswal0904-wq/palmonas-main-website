import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { PRODUCT_IMAGE } from "@/data/products";

export default function CuratedEditCard({
  label,
  handle,
  gradient,
}: {
  label: string;
  handle: string;
  gradient: string;
}) {
  return (
    <Link
      href={`/collection/${handle}`}
      className="group relative block aspect-square overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(238,40,76,0.2)]"
      style={{ backgroundImage: gradient }}
    >
      <div className="relative h-full w-full">
        <Image
          src={PRODUCT_IMAGE}
          alt={label}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain object-bottom p-4 transition-transform group-hover:scale-105"
        />
      </div>
      <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#E5D5DC] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#151515] backdrop-blur-sm">
        {label}
        <ArrowIcon className="size-2.5" />
      </span>
    </Link>
  );
}
