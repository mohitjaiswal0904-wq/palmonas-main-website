import Image from 'next/image';

import bestsellerLightningBolt from '@/components/icons/svg/bestseller-lightning-bolt.svg';
import { cn } from '@/lib/utils/cn';

interface BestsellerLightningBoltIconProps {
  className?: string;
}

export function BestsellerLightningBoltIcon({ className }: BestsellerLightningBoltIconProps) {
  return (
    <Image
      src={bestsellerLightningBolt}
      alt=""
      width={11}
      height={11}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      unoptimized
    />
  );
}
