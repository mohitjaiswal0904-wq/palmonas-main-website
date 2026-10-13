describe('isNextProductionRuntime', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns true when NODE_ENV is production', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'production' };
    const { isNextProductionRuntime } = await import('./is-next-production');
    expect(isNextProductionRuntime()).toBe(true);
  });

  it('returns false when NODE_ENV is development', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    const { isNextProductionRuntime } = await import('./is-next-production');
    expect(isNextProductionRuntime()).toBe(false);
  });
});
