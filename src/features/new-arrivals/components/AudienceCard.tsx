import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";
import { PRODUCT_IMAGE } from "@/data/products";

export default function AudienceCard({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-44 w-[150px] overflow-hidden bg-white sm:h-48 sm:w-[170px]">
        <Image
          src={PRODUCT_IMAGE}
          alt={label}
          fill
          sizes="170px"
          className="object-cover"
        />
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 text-xs font-medium text-white sm:px-4 sm:py-2 sm:text-sm"
      >
        {label}
        <ArrowIcon className="size-3" />
      </Link>
    </div>
  );
}
