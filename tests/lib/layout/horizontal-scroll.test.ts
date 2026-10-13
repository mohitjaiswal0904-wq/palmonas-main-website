import {
  HORIZONTAL_SCROLL_MOUSE,
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';

describe('HORIZONTAL_SCROLL_PASS_VERTICAL', () => {
  it('allows vertical page scroll alongside horizontal tracks (PW-567)', () => {
    expect(HORIZONTAL_SCROLL_PASS_VERTICAL).toContain('overscroll-x-contain');
    expect(HORIZONTAL_SCROLL_PASS_VERTICAL).not.toMatch(/touch-pan-x/);
  });
});

describe('HORIZONTAL_SCROLLBAR_HIDDEN', () => {
  it('hides scrollbars across major engines while keeping overflow scroll', () => {
    expect(HORIZONTAL_SCROLLBAR_HIDDEN).toContain('scrollbar-hide');
    expect(HORIZONTAL_SCROLLBAR_HIDDEN).toContain('[scrollbar-width:none]');
    expect(HORIZONTAL_SCROLLBAR_HIDDEN).toContain('[&::-webkit-scrollbar]:hidden');
  });
});

describe('HORIZONTAL_SCROLL_MOUSE', () => {
  it('exposes a grab cursor and disables native image drag', () => {
    expect(HORIZONTAL_SCROLL_MOUSE).toContain('cursor-grab');
    expect(HORIZONTAL_SCROLL_MOUSE).toContain('overflow-y-clip');
    expect(HORIZONTAL_SCROLL_MOUSE).toContain('[-webkit-user-drag:none]');
  });
});
