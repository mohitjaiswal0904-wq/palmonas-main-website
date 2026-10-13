import { cn } from '@/lib/utils/cn';

interface BrandAccordionChevronProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function BrandAccordionChevron({ className, size = 'sm' }: BrandAccordionChevronProps) {
  const dimension = size === 'sm' ? 12 : 15;
  const strokeWidth = size === 'sm' ? 1 : 1.22;

  return (
    <svg
      viewBox="0 0 12 12"
      width={dimension}
      height={dimension}
      className={cn('shrink-0 text-[#AAAAAA]', className)}
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
