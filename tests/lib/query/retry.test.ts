import { AppError } from '@/lib/errors';
import { isTransientAppError, retryOnceOnTransient, shouldRetryQuery } from '@/lib/query/retry';

describe('shouldRetryQuery', () => {
  it('does not retry NOT_FOUND errors', () => {
    expect(shouldRetryQuery(0, new AppError('NOT_FOUND', 'Missing'))).toBe(false);
  });

  it('retries up to two times for unknown errors', () => {
    expect(shouldRetryQuery(0, new Error('temporary'))).toBe(true);
    expect(shouldRetryQuery(2, new Error('temporary'))).toBe(false);
  });
});

describe('isTransientAppError', () => {
  it('treats 5xx as transient', () => {
    expect(isTransientAppError(new AppError('SERVER_ERROR', 'Failed', 502))).toBe(true);
  });

  it('treats network errors as transient', () => {
    expect(isTransientAppError(new AppError('NETWORK', 'offline'))).toBe(true);
  });

  it('does not treat not-found as transient', () => {
    expect(isTransientAppError(new AppError('NOT_FOUND', 'gone', 404))).toBe(false);
  });

  it('does not treat validation as transient', () => {
    expect(isTransientAppError(new AppError('VALIDATION', 'bad', 400))).toBe(false);
  });
});

describe('retryOnceOnTransient', () => {
  it('returns the first success without retrying', async () => {
    const run = jest.fn().mockResolvedValue('ok');

    await expect(retryOnceOnTransient(run)).resolves.toBe('ok');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('retries once after a 502 and returns the second result', async () => {
    const run = jest
      .fn()
      .mockRejectedValueOnce(new AppError('SERVER_ERROR', 'Failed to retrieve product', 502))
      .mockResolvedValueOnce('recovered');

    await expect(retryOnceOnTransient(run)).resolves.toBe('recovered');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not retry not-found', async () => {
    const run = jest.fn().mockRejectedValue(new AppError('NOT_FOUND', 'missing', 404));

    await expect(retryOnceOnTransient(run)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('throws the second error when retry also fails', async () => {
    const run = jest
      .fn()
      .mockRejectedValueOnce(new AppError('SERVER_ERROR', 'first', 502))
      .mockRejectedValueOnce(new AppError('SERVER_ERROR', 'second', 502));

    await expect(retryOnceOnTransient(run)).rejects.toMatchObject({ message: 'second' });
    expect(run).toHaveBeenCalledTimes(2);
  });
});
