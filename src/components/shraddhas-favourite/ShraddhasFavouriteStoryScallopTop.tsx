import Image from 'next/image';

import styles from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryScallopTop.module.css';
import { shraddhasFavouriteImages } from '@/config/shraddhas-favourite.config';
import { cn } from '@/lib/utils/cn';

interface ShraddhasFavouriteStoryScallopTopProps {
  className?: string;
}

export function ShraddhasFavouriteStoryScallopTop({
  className = '',
}: ShraddhasFavouriteStoryScallopTopProps) {
  return (
    <div className={cn(styles.edge, className)} aria-hidden="true">
      <Image
        src={shraddhasFavouriteImages.storyScallopBorder}
        alt=""
        width={1024}
        height={38}
        sizes="100vw"
        className={styles.image}
      />
    </div>
  );
}
