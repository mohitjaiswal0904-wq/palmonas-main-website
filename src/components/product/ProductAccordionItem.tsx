import type { CSSProperties, ReactNode } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { productTheme } from '@/config/product/product.config';

interface ProductAccordionItemProps {
  title: string;
  content?: string;
  children?: ReactNode;
  /** Gold: header + panel share stickyBarBg. Demifine: white. */
  tone?: 'default' | 'gold';
  /** Optional chevron color (Figma: Price Details uses gold accent). */
  chevronColor?: string;
}

/**
 * PDP accordion row — bottom border only.
 * Pad owns text→border gap (`py-3` ≈ 12px); small chevron avoids flex-center row inflate.
 * Phone: 14px. Desktop: mild bump to 16px (screenshot density).
 */
export function ProductAccordionItem({
  title,
  content,
  children,
  tone = 'default',
  chevronColor,
}: ProductAccordionItemProps) {
  const hasTextContent = typeof content === 'string' && content.trim().length > 0;

  if (!children && !hasTextContent) {
    return null;
  }

  const isGold = tone === 'gold';
  const surface: CSSProperties | undefined = isGold
    ? { backgroundColor: productTheme.stickyBarBg }
    : undefined;

  return (
    <details
      className="group"
      style={{
        borderBottom: `0.5px solid ${productTheme.borderHairline}`,
        ...surface,
      }}
    >
      <summary
        className="laptop:px-3 laptop:text-base flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-3 text-sm leading-normal font-normal [&::-webkit-details-marker]:hidden"
        style={{
          color: productTheme.ink,
          backgroundColor: isGold ? productTheme.stickyBarBg : productTheme.surfaceWhite,
        }}
      >
        <span className="min-w-0 flex-1">{title}</span>
        <span
          className="flex size-5 shrink-0 items-center justify-center transition-transform duration-200 group-open:rotate-180"
          style={{ color: chevronColor ?? productTheme.ink }}
          aria-hidden
        >
          <ChevronDownIcon className="h-1.5 w-2.5 shrink-0" />
        </span>
      </summary>
      <div style={surface}>
        {children ?? (
          <p
            className="laptop:px-3 laptop:pb-4 laptop:text-sm px-2 pb-3 text-xs leading-snug whitespace-pre-line"
            style={{ color: productTheme.titleMuted }}
          >
            {content}
          </p>
        )}
      </div>
    </details>
  );
}
