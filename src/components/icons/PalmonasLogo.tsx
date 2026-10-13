import Image from 'next/image';

import palmonasLogo from '@/components/icons/palmonas-logo.png';
import { cn } from '@/lib/utils/cn';

interface PalmonasLogoProps {
  className?: string;
  priority?: boolean;
}

export function PalmonasLogo({ className, priority = false }: PalmonasLogoProps) {
  return (
    <Image
      src={palmonasLogo}
      alt="Palmonas"
      width={1676}
      height={592}
      className={cn('h-8 w-auto object-contain', className)}
      priority={priority}
    />
  );
}
