import Image from 'next/image';

import { diwaliImages } from '@/config/diwali/diwali.config';

interface DiwaliOfferArchProps {
  kicker: string;
  price: string;
  note: string;
  imageLabel: string;
  imageSrc?: string;
}

/**
 * Maroon temple-arch offer tile with the offer copy set inside the arch.
 */
export function DiwaliOfferArch({
  kicker,
  price,
  note,
  imageLabel,
  imageSrc,
}: DiwaliOfferArchProps) {
  return (
    <span className="relative block aspect-[736/1037] w-full overflow-hidden rounded-lg">
      <Image
        src={diwaliImages.offerArch}
        alt=""
        fill
        sizes="(max-width: 767px) 50vw, 33vw"
        className="object-cover"
      />
      <span className="absolute inset-x-[14%] top-[28%] flex flex-col items-center text-center">
        <span className="text-[11px] tracking-[0.12em] text-[#FCE7B2] uppercase">{kicker}</span>
        <span className="font-nunito-sans tab:text-4xl mt-0.5 bg-gradient-to-b from-[#FCE7B2] via-[#F6C445] to-[#E8B84A] bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          {price}
        </span>
        <span className="mt-1 h-px w-10 bg-[#E8B84A]" aria-hidden="true" />
        <span className="mt-1 text-[11px] text-[#FCE7B2]/85">{note}</span>
      </span>
      {imageSrc ? (
        <span className="absolute bottom-[7%] left-1/2 block aspect-square w-[34%] -translate-x-1/2 overflow-hidden rounded-md border border-[#E8B84A]">
          <Image src={imageSrc} alt="" fill sizes="120px" className="object-cover" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="absolute bottom-[7%] left-1/2 flex aspect-square w-[34%] -translate-x-1/2 items-center justify-center rounded-md border border-dashed border-[#E8B84A] bg-[#3A0D19]/35 px-1 text-center"
        >
          <span className="text-[9px] font-semibold tracking-[0.08em] text-[#FCE7B2] uppercase">
            {imageLabel}
          </span>
        </span>
      )}
    </span>
  );
}
