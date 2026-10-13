import axios from 'axios';

export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORISED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode?: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

interface ApiErrorPayload {
  message?: string;
  detail?: string;
}

export function normaliseError(err: unknown): AppError {
  if (isAppError(err)) {
    return err;
  }

  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const payload = err.response?.data as ApiErrorPayload | undefined;
    const message = payload?.message ?? payload?.detail ?? err.message;
    const details = err.response?.data;

    if (!err.response) {
      return new AppError('NETWORK', 'Network error — check your connection', undefined, details);
    }

    switch (status) {
      case 400:
        return new AppError('VALIDATION', message ?? 'Invalid request', 400, details);
      case 401:
        return new AppError('UNAUTHORISED', message ?? 'Not authenticated', 401, details);
      case 403:
        return new AppError('FORBIDDEN', message ?? 'Access denied', 403, details);
      case 404:
        return new AppError('NOT_FOUND', message ?? 'Resource not found', 404, details);
      case 409:
        return new AppError('CONFLICT', message ?? 'Resource already exists', 409, details);
      case 429:
        return new AppError('RATE_LIMITED', message ?? 'Too many requests', 429, details);
      default:
        if (status && status >= 500) {
          return new AppError('SERVER_ERROR', message ?? 'Server error', status, details);
        }
    }
  }

  if (err instanceof Error) {
    return new AppError('UNKNOWN', err.message);
  }

  return new AppError('UNKNOWN', 'An unexpected error occurred');
}
