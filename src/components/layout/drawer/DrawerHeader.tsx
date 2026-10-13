import { X } from 'lucide-react';
import Image from 'next/image';

interface DrawerHeaderProps {
  onClose: () => void;
}

export function DrawerHeader({ onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white px-4 pt-6 pb-3">
      <span className="font-display tracking-palmonas-wide text-2xl text-stone-900">
        <Image
          src="https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Frame%202613859-189051b5.webp"
          alt="PALMONAS"
          width={100}
          height={100}
          className="h-4 w-auto object-contain"
        />
      </span>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center text-stone-900"
        aria-label="Close menu"
        onClick={onClose}
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
