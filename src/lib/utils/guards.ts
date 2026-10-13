/**
 * Type guards for safe type checking
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
