import { isModifiedClick } from '@/lib/navigation/is-modified-click';

describe('isModifiedClick', () => {
  it('returns false for a plain left click', () => {
    expect(isModifiedClick({ button: 0 })).toBe(false);
  });

  it('returns true for meta/ctrl/shift/alt', () => {
    expect(isModifiedClick({ metaKey: true, button: 0 })).toBe(true);
    expect(isModifiedClick({ ctrlKey: true, button: 0 })).toBe(true);
    expect(isModifiedClick({ shiftKey: true, button: 0 })).toBe(true);
    expect(isModifiedClick({ altKey: true, button: 0 })).toBe(true);
  });

  it('returns true for non-primary button', () => {
    expect(isModifiedClick({ button: 1 })).toBe(true);
  });

  it('returns false when button is undefined', () => {
    expect(isModifiedClick({})).toBe(false);
  });
});
