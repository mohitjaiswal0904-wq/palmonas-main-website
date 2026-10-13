import { EMILY_IN_PARIS_HEADING_FONT_CLASS } from '@/components/emily-in-paris/emily-in-paris-constants';
import { cn } from '@/lib/utils/cn';

interface EmilyInParisSectionHeadingProps {
  title: string;
  className?: string;
}

export function EmilyInParisSectionHeading({ title, className }: EmilyInParisSectionHeadingProps) {
  return (
    <h2
      className={cn(
        'tab:text-3xl laptop:text-4xl text-center text-2xl leading-tight tracking-tight text-[#151515]',
        EMILY_IN_PARIS_HEADING_FONT_CLASS,
        className,
      )}
    >
      {title}
    </h2>
  );
}
