import { formatCountdownUnit, getSaleCountdownParts } from '@/lib/diwali/sale-countdown';

const NOW = Date.parse('2026-10-09T00:00:00.000Z');

describe('getSaleCountdownParts', () => {
  it('splits a future end into days, hours, minutes, and seconds', () => {
    const endsAt = NOW + ((2 * 24 + 3) * 60 * 60 + 4 * 60 + 5) * 1000;

    expect(getSaleCountdownParts(NOW, endsAt)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it('keeps a sub-day remainder in hours and minutes', () => {
    const endsAt = NOW + (90 * 60 + 1) * 1000;

    expect(getSaleCountdownParts(NOW, endsAt)).toEqual({
      days: 0,
      hours: 1,
      minutes: 30,
      seconds: 1,
    });
  });

  it('returns null once the sale end has passed', () => {
    expect(getSaleCountdownParts(NOW, NOW - 1)).toBeNull();
  });

  it('returns null for a non-finite end time', () => {
    expect(getSaleCountdownParts(NOW, Number.NaN)).toBeNull();
  });
});

describe('formatCountdownUnit', () => {
  it('pads a single digit and appends the suffix', () => {
    expect(formatCountdownUnit(2, 'd')).toBe('02d');
  });

  it('keeps a two-digit value', () => {
    expect(formatCountdownUnit(14, 'h')).toBe('14h');
  });

  it('treats a negative value as zero', () => {
    expect(formatCountdownUnit(-3, 'm')).toBe('00m');
  });

  it('treats a non-finite value as zero', () => {
    expect(formatCountdownUnit(Number.NaN, 's')).toBe('00s');
  });
});
