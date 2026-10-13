'use client';

interface CarouselDotsProps {
  /** Total number of slides. */
  count: number;
  /** Index of the currently visible slide. */
  activeIndex: number;
  /** Called with the slide index when a dot is activated. */
  onSelect: (index: number) => void;
  /** Builds the accessible label for each dot. */
  getLabel?: (index: number, count: number) => string;
  className?: string;
}

/** Figma 963:62325 — active blush / idle grey. */
const ACTIVE_COLOR = '#FCCACA';
const INACTIVE_COLOR = '#DFDFDF';

/**
 * Presentational pagination dots for a horizontally scrolling carousel.
 * Kept generic so any slide-based component can reuse it.
 */
export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  getLabel = (index, total) => `View item ${index + 1} of ${total}`,
  className = 'pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2',
}: CarouselDotsProps) {
  if (count < 2) {
    return null;
  }

  return (
    <div className={className} role="tablist" aria-label="Carousel pagination">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          className="pointer-events-auto size-[5px] rounded-full transition-colors"
          style={{ backgroundColor: index === activeIndex ? ACTIVE_COLOR : INACTIVE_COLOR }}
          aria-label={getLabel(index, count)}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
