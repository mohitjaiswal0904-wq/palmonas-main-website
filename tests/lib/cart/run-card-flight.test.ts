import { cardFlightFrame, easeOutCubic } from '@/lib/cart/run-card-flight';

const flight = {
  fromX: 0,
  fromY: 0,
  toX: 100,
  toY: 40,
  endScale: 0.2,
};

describe('run-card-flight', () => {
  it('eases out so mid time has traveled more than halfway', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(1)).toBe(1);
  });

  it('starts at the origin at full size', () => {
    const frame = cardFlightFrame(0, flight, 40);
    expect(frame.transform).toContain('translate3d(0px, 0px, 0)');
    expect(frame.transform).toContain('scale(1)');
    expect(frame.opacity).toBe(1);
  });

  it('lands on the bag at the end scale', () => {
    const frame = cardFlightFrame(1, flight, 40);
    expect(frame.transform).toContain('translate3d(100px, 40px, 0)');
    expect(frame.transform).toContain('scale(0.2)');
  });

  it('clamps time below 0 and above 1', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(cardFlightFrame(2, flight, 0).transform).toBe(cardFlightFrame(1, flight, 0).transform);
  });

  it('lifts the path at mid flight', () => {
    const mid = cardFlightFrame(0.5, flight, 40);
    expect(mid.transform).toMatch(/translate3d\([^,]+, -?\d/);
    expect(mid.transform).not.toContain('translate3d(50px, 20px, 0)');
  });
});
