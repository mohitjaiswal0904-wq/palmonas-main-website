'use client';

import { useRef } from 'react';

import { CmsButton } from '@/components/cms/shared/CmsButton';
import { CmsCard } from '@/components/cms/shared/CmsCard';
import { CmsRuntimeClassSlot } from '@/components/cms/shared/CmsRuntimeClassSlot';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import {
  HORIZONTAL_SCROLL_MOUSE,
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import {
  buildButtonGridContainerStyle,
  resolveButtonGridMobileColumns,
} from '@/lib/utils/cms-button-grid';
import { CARD_GRID_DEFAULTS, pickTailwindSlot } from '@/lib/utils/cms-card-grid-content';
import {
  getButtonGridColumns,
  getCardGridColumns,
  getCardGridTailwindClasses,
  getVisibleButtons,
  getVisibleCards,
} from '@/lib/utils/cms-content';
import { cn } from '@/lib/utils/cn';
import { parseInlineCss } from '@/lib/utils/parse-inline-css';
import type { CmsSectionButton } from '@/types/cms-section';

interface CmsButtonRowProps {
  buttons: CmsSectionButton[];
  spacingCss?: string;
  columns?: number;
  className?: string;
}

export function CmsButtonRow({ buttons, spacingCss, columns, className }: CmsButtonRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleButtons = buttons.filter((button) => button.is_visible !== false);
  useHorizontalMouseScroll(scrollRef, visibleButtons.length > 0);

  if (visibleButtons.length === 0) {
    return null;
  }

  const mobileColumns = resolveButtonGridMobileColumns(columns);
  const gridStyle = parseInlineCss(spacingCss);

  return (
    <div className={cn('w-full overflow-x-hidden', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'grid w-full min-w-0 overflow-x-auto',
          'tab:mx-0 tab:flex tab:flex-nowrap tab:justify-center tab:gap-8 mx-[2vw]',
          HORIZONTAL_SCROLLBAR_HIDDEN,
          HORIZONTAL_SCROLL_PASS_VERTICAL,
          HORIZONTAL_SCROLL_MOUSE,
        )}
        style={buildButtonGridContainerStyle(mobileColumns, gridStyle)}
      >
        {visibleButtons.map((button) => (
          <div key={button.id ?? button.text} className="tab:block tab:shrink-0 flex min-w-0">
            <CmsButton button={button} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface CmsCardGridProps {
  content: Record<string, unknown>;
  className?: string;
}

export function CmsCardGrid({ content, className }: CmsCardGridProps) {
  const cards = getVisibleCards(content);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardColumns = getCardGridColumns(content);
  const isSwipeable = cardColumns > 2;
  useHorizontalMouseScroll(scrollRef, isSwipeable && cards.length > 0);

  if (cards.length === 0) {
    return null;
  }

  const tailwindClasses = getCardGridTailwindClasses(content);
  const gridSpacing = parseInlineCss(
    typeof content.card_grid_spacing_css === 'string' ? content.card_grid_spacing_css : undefined,
  );
  const gridClassName = pickTailwindSlot(
    isSwipeable ? CARD_GRID_DEFAULTS.gridSwipeable : CARD_GRID_DEFAULTS.gridFixed,
    tailwindClasses.grid,
  );

  const cardNodes = cards.map((card, index) => {
    const itemNodeId = `cms-card-grid-item-${card.id ?? index}`;
    const hasOuterHeight = Boolean(card.height?.trim() && card.height.trim() !== 'auto');

    return (
      <CmsRuntimeClassSlot key={itemNodeId} nodeId={itemNodeId}>
        <CmsCard
          card={{
            ...card,
            width: undefined,
            height: undefined,
          }}
          fillOuterHeight={hasOuterHeight}
          isSwipeable={isSwipeable}
          sectionColumnClass={tailwindClasses.column}
        />
      </CmsRuntimeClassSlot>
    );
  });

  return (
    <div
      className={cn(
        pickTailwindSlot(CARD_GRID_DEFAULTS.wrapper, tailwindClasses.wrapper),
        className,
        'overflow-x-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]',
      )}
    >
      {isSwipeable ? (
        <div ref={scrollRef} className={cn(gridClassName, HORIZONTAL_SCROLL_MOUSE)}>
          <div className={CARD_GRID_DEFAULTS.gridSwipeableTrack} style={gridSpacing}>
            {cardNodes}
          </div>
        </div>
      ) : (
        <div className={gridClassName} style={gridSpacing}>
          {cardNodes}
        </div>
      )}
    </div>
  );
}

interface CmsEmbeddedExtrasProps {
  content: Record<string, unknown>;
  className?: string;
  buttonRowClassName?: string;
}

export function CmsEmbeddedExtras({
  content,
  className,
  buttonRowClassName,
}: CmsEmbeddedExtrasProps) {
  const buttons = getVisibleButtons(content);
  const buttonSpacing =
    typeof content.button_grid_spacing_css === 'string'
      ? content.button_grid_spacing_css
      : undefined;
  const buttonColumns = getButtonGridColumns(content);

  return (
    <div className={cn('space-y-4', className)}>
      <CmsButtonRow
        buttons={buttons}
        spacingCss={buttonSpacing}
        columns={buttonColumns}
        className={buttonRowClassName}
      />
      <CmsCardGrid content={content} />
    </div>
  );
}
