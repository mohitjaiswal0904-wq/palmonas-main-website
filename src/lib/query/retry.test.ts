describe('shouldRetryQuery', () => {
  it('does not retry NOT_FOUND errors', async () => {
    const { shouldRetryQuery } = await import('./retry');
    const { AppError } = await import('@/lib/errors');
    expect(shouldRetryQuery(0, new AppError('NOT_FOUND', 'Missing'))).toBe(false);
  });

  it('retries up to two times for unknown errors', async () => {
    const { shouldRetryQuery } = await import('./retry');
    expect(shouldRetryQuery(0, new Error('temporary'))).toBe(true);
    expect(shouldRetryQuery(2, new Error('temporary'))).toBe(false);
  });
});
