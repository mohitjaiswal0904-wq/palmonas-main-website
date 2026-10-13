import { Nunito_Sans as NunitoSans } from 'next/font/google';

import { cn } from '@/lib/utils/cn';

const nunitoSansSemibold = NunitoSans({
  subsets: ['latin'],
  weight: '600',
});

interface ShraddhasFavouriteSectionHeadingProps {
  title: string;
  className?: string;
}

export function ShraddhasFavouriteSectionHeading({
  title,
  className,
}: ShraddhasFavouriteSectionHeadingProps) {
  return (
    <h2
      className={cn(
        'tab:text-3xl laptop:text-4xl text-center text-2xl leading-tight tracking-tight text-[#151515]',
        nunitoSansSemibold.className,
        className,
      )}
    >
      {title}
    </h2>
  );
}
