import { CARD_GRID_DEFAULTS } from '@/lib/utils/cms-card-grid-content';

describe('CARD_GRID_DEFAULTS', () => {
  it('does not add spacing above card-grid content', () => {
    expect(CARD_GRID_DEFAULTS.wrapper).toContain('pt-0');
    expect(CARD_GRID_DEFAULTS.wrapper).not.toMatch(/\b(?:pt-9|laptop:pt-10)\b/);
  });

  it('centers swipeable cards when they fit and scrolls overflow to the right', () => {
    expect(CARD_GRID_DEFAULTS.gridSwipeable).toContain('overflow-x-auto');
    expect(CARD_GRID_DEFAULTS.gridSwipeable).toContain('[&::-webkit-scrollbar]:hidden');
    expect(CARD_GRID_DEFAULTS.gridSwipeable).not.toContain('justify-center');
    expect(CARD_GRID_DEFAULTS.gridSwipeableTrack).toContain('justify-center');
    expect(CARD_GRID_DEFAULTS.gridSwipeableTrack).toContain('min-w-full');
    expect(CARD_GRID_DEFAULTS.gridSwipeableTrack).toContain('w-max');
  });
});
