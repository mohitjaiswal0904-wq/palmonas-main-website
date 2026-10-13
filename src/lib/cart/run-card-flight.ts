import { cartTokens } from '@/config/theme/cart.tokens';

export interface CardFlightMotion {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  endScale: number;
}

/**
 * Ease a 0–1 time value with a cubic ease-out.
 *
 * @param time - Linear progress from 0 to 1.
 * @returns Eased progress.
 */
export function easeOutCubic(time: number): number {
  const t = Math.min(1, Math.max(0, time));
  return 1 - (1 - t) ** 3;
}

/**
 * Compute one frame of the card-to-bag flight.
 *
 * @param time - Linear 0–1 progress.
 * @param flight - Start, end, and land scale.
 * @param arcLiftPx - Peak extra lift at mid-flight.
 * @returns Transform and opacity for that frame.
 */
export function cardFlightFrame(
  time: number,
  flight: CardFlightMotion,
  arcLiftPx: number = cartTokens.addToCartFlight.arcLiftPx,
): { transform: string; opacity: number } {
  const progress = Math.min(1, Math.max(0, time));
  const eased = easeOutCubic(progress);
  const lift = progress === 0 || progress === 1 ? 0 : Math.sin(progress * Math.PI) * arcLiftPx;
  const x = (flight.toX - flight.fromX) * eased;
  const y = (flight.toY - flight.fromY) * eased - lift;
  const scale = progress === 1 ? flight.endScale : 1 + (flight.endScale - 1) * eased;
  const fade = time > 0.82 ? 1 - ((time - 0.82) / 0.18) * 0.25 : 1;

  return {
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
    opacity: fade,
  };
}

/**
 * Drive a continuous card-to-bag transform on an element.
 *
 * @param element - Overlay chip to move.
 * @param flight - Geometry for the flight.
 * @param durationMs - Total flight time.
 * @returns Cancel function.
 */
export function runCardFlightAnimation(
  element: HTMLElement,
  flight: CardFlightMotion,
  durationMs: number = cartTokens.addToCartFlight.durationMs,
): () => void {
  const startedAt = performance.now();
  let frameId = 0;

  const tick = (now: number) => {
    const time = Math.min(1, (now - startedAt) / Math.max(durationMs, 1));
    const frame = cardFlightFrame(time, flight);
    element.style.transform = frame.transform;
    element.style.opacity = String(frame.opacity);
    if (time < 1) {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  frameId = window.requestAnimationFrame(tick);
  return () => {
    window.cancelAnimationFrame(frameId);
  };
}
