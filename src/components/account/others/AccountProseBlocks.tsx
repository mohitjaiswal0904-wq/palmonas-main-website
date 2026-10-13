import { cn } from '@/lib/utils/cn';

interface AccountProseBlocksProps {
  lines: readonly string[];
  className?: string;
}

const SECTION_HEADING =
  /^(ELIGIBILITY:|OFFER:|PALMONAS REWARDS EXPIRY:|OTHER TERMS AND CONDITIONS:|[A-Z][A-Z0-9 /&’'()\-]{2,}:?)$/;

/**
 * Render verbatim policy body lines; ALL-CAPS / labelled lines become headings.
 */
export function AccountProseBlocks({ lines, className }: AccountProseBlocksProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {lines.map((line, index) => {
        const isHeading =
          SECTION_HEADING.test(line) ||
          (line === line.toUpperCase() &&
            line.length > 3 &&
            /[A-Z]/.test(line) &&
            line.split(' ').length <= 8);

        if (isHeading) {
          return (
            <h2
              key={`${index}-${line.slice(0, 24)}`}
              className="text-brand-navy pt-4 text-base font-semibold tracking-wide first:pt-0"
            >
              {line}
            </h2>
          );
        }

        if (line.startsWith('•') || line.startsWith('- ')) {
          return (
            <p
              key={`${index}-${line.slice(0, 24)}`}
              className="pl-4 text-[var(--color-text-muted)]"
            >
              {line}
            </p>
          );
        }

        return (
          <p key={`${index}-${line.slice(0, 24)}`} className="text-[var(--color-text-muted)]">
            {line}
          </p>
        );
      })}
    </div>
  );
}
