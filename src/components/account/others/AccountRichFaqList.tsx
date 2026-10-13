import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface AccountFaqEntry {
  question: string;
  paragraphs: readonly string[];
  section?: string | null;
}

interface AccountRichFaqListProps {
  heading?: string;
  items: readonly AccountFaqEntry[];
  defaultOpenFirst?: boolean;
  className?: string;
}

interface FaqRenderRow {
  kind: 'section' | 'item';
  key: string;
  label?: string;
  item?: AccountFaqEntry;
  itemIndex?: number;
}

/**
 * Flatten FAQ items into section labels + accordion rows without render-time mutation.
 */
function buildFaqRows(items: readonly AccountFaqEntry[]): FaqRenderRow[] {
  const rows: FaqRenderRow[] = [];
  let lastSection: string | null = null;

  items.forEach((item, index) => {
    if (item.section && item.section !== lastSection) {
      lastSection = item.section;
      rows.push({ kind: 'section', key: `section-${item.section}`, label: item.section });
    }
    rows.push({
      kind: 'item',
      key: `item-${index}-${item.question}`,
      item,
      itemIndex: index,
    });
  });

  return rows;
}

/**
 * Live-style FAQ accordion with multi-paragraph answers; theme-token colours.
 */
export function AccountRichFaqList({
  heading,
  items,
  defaultOpenFirst = true,
  className,
}: AccountRichFaqListProps) {
  const rows = buildFaqRows(items);

  return (
    <section className={cn('space-y-4', className)} aria-label={heading ?? 'FAQ'}>
      {heading ? (
        <h2 className="text-brand-navy text-base font-semibold sm:text-lg">{heading}</h2>
      ) : null}

      <div className="divide-border-subtle border-border-subtle divide-y border-y">
        {rows.map((row) => {
          if (row.kind === 'section') {
            return (
              <p
                key={row.key}
                className="bg-surface-panel text-brand-navy px-1 py-3 text-xs font-semibold tracking-wide uppercase"
              >
                {row.label}
              </p>
            );
          }

          const item = row.item;
          if (!item) {
            return null;
          }

          return (
            <details key={row.key} className="group" open={defaultOpenFirst && row.itemIndex === 0}>
              <summary className="text-brand-navy flex cursor-pointer list-none items-start justify-between gap-3 py-4 text-sm font-medium sm:text-[15px] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span className="mt-0.5 shrink-0 transition-transform duration-200 group-open:rotate-180">
                  <ChevronDownIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                </span>
              </summary>
              <div className="space-y-2 pb-4 text-sm leading-6 text-[var(--color-text-muted)]">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
