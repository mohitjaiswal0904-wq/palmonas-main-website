import {
  buildToastRecord,
  getToastAnimationClass,
  groupToastsByPlacement,
  resolveToastDuration,
} from '@/lib/toast/toast-manager';

describe('buildToastRecord', () => {
  it('merges defaults and returns a stable shape', () => {
    const record = buildToastRecord('Saved', { type: 'success', placement: 'top' });

    expect(record.message).toBe('Saved');
    expect(record.type).toBe('success');
    expect(record.placement).toBe('top');
    expect(record.id).toBeTruthy();
  });
});

describe('resolveToastDuration', () => {
  it('uses option duration when provided', () => {
    expect(resolveToastDuration({ duration: 1000 }, 4000)).toBe(1000);
  });

  it('falls back to provider default', () => {
    expect(resolveToastDuration(undefined, 4000)).toBe(4000);
  });
});

describe('getToastAnimationClass', () => {
  it('maps animation types to css classes', () => {
    expect(getToastAnimationClass('slide-in')).toBe('toast-animate-slide-in');
    expect(getToastAnimationClass('zoom-in')).toBe('toast-animate-zoom-in');
  });
});

describe('groupToastsByPlacement', () => {
  it('splits toasts into top and bottom stacks', () => {
    const top = buildToastRecord('Top', { placement: 'top' });
    const bottom = buildToastRecord('Bottom', { placement: 'bottom' });

    expect(groupToastsByPlacement([top, bottom])).toEqual({
      top: [top],
      bottom: [bottom],
    });
  });
});
