describe('buildMetadata', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'https://palmonas.com',
      NEXT_PUBLIC_APP_ENV: 'production',
      NEXT_PUBLIC_API_DEV: 'https://app-backend.palmonas.tech',
      NEXT_PUBLIC_API_PROD: 'https://app-backend.palmonas.tech',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sets canonical URL from path', async () => {
    const { buildMetadata: build } = await import('./build-metadata');
    const metadata = build({ title: 'About', path: '/pages/about' });
    expect(metadata.alternates?.canonical).toBe('https://palmonas.com/pages/about');
  });

  it('marks private pages as noindex', async () => {
    const { buildMetadata: build } = await import('./build-metadata');
    const metadata = build({ title: 'Login', path: '/account/login', noIndex: true });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('uses default description when omitted', async () => {
    const { buildMetadata: build } = await import('./build-metadata');
    const metadata = build({ title: 'Shop' });
    expect(metadata.description).toContain('Palmonas');
  });
});
