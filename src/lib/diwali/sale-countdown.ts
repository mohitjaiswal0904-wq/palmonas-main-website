export interface SaleCountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Split the time left until a sale end into days, hours, minutes, and seconds.
 *
 * @param nowMs - Current time in epoch milliseconds.
 * @param endsAtMs - Sale end time in epoch milliseconds.
 * @returns Countdown parts, or null when the end is missing or already passed.
 */
export function getSaleCountdownParts(nowMs: number, endsAtMs: number): SaleCountdownParts | null {
  if (!Number.isFinite(nowMs) || !Number.isFinite(endsAtMs)) {
    return null;
  }

  const remainingMs = endsAtMs - nowMs;

  if (remainingMs <= 0) {
    return null;
  }

  const days = Math.floor(remainingMs / DAY_MS);
  const hours = Math.floor((remainingMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remainingMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remainingMs % MINUTE_MS) / SECOND_MS);

  return { days, hours, minutes, seconds };
}

/**
 * Format one countdown unit as two digits plus a suffix, such as `02d`.
 *
 * @param value - Non-negative unit count.
 * @param suffix - Unit suffix appended after the digits.
 * @returns Padded unit label.
 */
export function formatCountdownUnit(value: number, suffix: string): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

  return `${String(safeValue).padStart(2, '0')}${suffix}`;
}
