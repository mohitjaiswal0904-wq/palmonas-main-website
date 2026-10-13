import { cn } from '@/lib/utils/cn';

interface GiftingSectionHeadingProps {
  title: string;
  className?: string;
  align?: 'left' | 'center';
  id?: string;
}

/**
 * Section title for gifting page blocks.
 */
export function GiftingSectionHeading({
  title,
  className,
  align = 'left',
  id,
}: GiftingSectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        'font-nunito-sans tab:text-2xl text-xl font-semibold tracking-tight text-[#151515]',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {title}
    </h2>
  );
}
