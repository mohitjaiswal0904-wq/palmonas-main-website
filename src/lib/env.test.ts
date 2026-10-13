describe('getApiBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function setBaseEnv() {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'http://localhost:8000';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';
  }

  it('returns dev API URL in development', async () => {
    setBaseEnv();

    const { getApiBaseUrl } = await import('./env');
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('returns prod API URL in production', async () => {
    setBaseEnv();
    process.env.NEXT_PUBLIC_APP_URL = 'https://palmonas.com';
    process.env.NEXT_PUBLIC_APP_ENV = 'production';
    process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_API_PROD = 'https://api.palmonas.tech';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'production';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://pdp.gokwik.co';

    const { getApiBaseUrl } = await import('./env');
    expect(getApiBaseUrl()).toBe('https://api.palmonas.tech');
  });

  it('returns OMS API URL', async () => {
    setBaseEnv();

    const { getOmsApiBaseUrl } = await import('./env');
    expect(getOmsApiBaseUrl()).toBe(process.env.NEXT_PUBLIC_OMS_API_URL);
  });
});

describe('getMtoApiBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the configured MTO API base URL from env', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://mto.example.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';

    const { getMtoApiBaseUrl } = await import('./env');
    expect(getMtoApiBaseUrl()).toBe('https://mto.example.com');
  });
});

describe('getKwikpassBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the configured KwikPass base URL from env', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://example.com/kp';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';

    const { getKwikpassBaseUrl } = await import('./env');
    expect(getKwikpassBaseUrl()).toBe('https://example.com/kp');
  });
});

describe('getGokwikStoreId', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns numeric store id when env is set', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'http://localhost:8000';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_GOKWIK_STORE_ID = '123456';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';

    const { getGokwikStoreId } = await import('./env');
    expect(getGokwikStoreId()).toBe(123456);
  });

  it('returns undefined when store id env is empty', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'http://localhost:8000';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_GOKWIK_STORE_ID = '';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';

    const { getGokwikStoreId } = await import('./env');
    expect(getGokwikStoreId()).toBeUndefined();
  });
});

describe('careers Apps Script URLs', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the configured careers script URLs from env', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';

    const { getCareersGeneralScriptUrl, getCareersJobScriptUrl } = await import('./env');
    expect(getCareersGeneralScriptUrl()).toBe(
      'https://script.google.com/macros/s/general-test/exec',
    );
    expect(getCareersJobScriptUrl()).toBe('https://script.google.com/macros/s/job-test/exec');
  });
});

describe('getAnalyticsMixpanelApiHost', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
    process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
    process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
    process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'sandbox';
    process.env.NEXT_PUBLIC_KP_BASE = 'https://sandbox.pdp.gokwik.co';
    process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
    process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
    process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
      'https://script.google.com/macros/s/general-test/exec';
    process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
      'https://script.google.com/macros/s/job-test/exec';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns an absolute Mixpanel proxy host', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST = 'http://localhost:8080/v1/i/TEST1';

    const { getAnalyticsMixpanelApiHost } = await import('./env');
    expect(getAnalyticsMixpanelApiHost()).toBe('http://localhost:8080/v1/i/TEST1');
  });

  it('strips a duplicated env-key prefix from the host value', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST =
      'NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST=http://localhost:8080/v1/i/TEST1';

    const { getAnalyticsMixpanelApiHost } = await import('./env');
    expect(getAnalyticsMixpanelApiHost()).toBe('http://localhost:8080/v1/i/TEST1');
  });

  it('returns undefined when the host is a relative path', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST = 'localhost:8080/v1/i/TEST1';

    const { getAnalyticsMixpanelApiHost } = await import('./env');
    expect(getAnalyticsMixpanelApiHost()).toBeUndefined();
  });

  it('returns undefined when the host is missing', async () => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST;

    const { getAnalyticsMixpanelApiHost } = await import('./env');
    expect(getAnalyticsMixpanelApiHost()).toBeUndefined();
  });
});
