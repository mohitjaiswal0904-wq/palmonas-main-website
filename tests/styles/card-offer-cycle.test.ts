import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/card-offer-cycle.css'), 'utf8');

describe('card-offer-cycle.css', () => {
  it('defines the original-line exit keyframes', () => {
    expect(css).toContain('@keyframes card-offer-cycle-out');
    expect(css).toContain('.card-offer-cycle-original');
  });

  it('defines the gold-pill enter keyframes', () => {
    expect(css).toContain('@keyframes card-offer-cycle-in');
    expect(css).toContain('.card-offer-cycle-pill');
  });

  it('hides the pill when motion is reduced', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('opacity: 0');
  });

  it('does not use a fractional keyframe offset that Lightning CSS may drop', () => {
    expect(css).not.toContain('74.01%');
    expect(css).toContain('75%');
  });
});
