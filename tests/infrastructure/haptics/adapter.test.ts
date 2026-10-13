const mockTrigger = jest.fn().mockResolvedValue(undefined);
const mockConstruct = jest.fn();
const mockVibrate = jest.fn();

jest.mock('web-haptics', () => {
  class MockWebHaptics {
    static isSupported = false;

    constructor(options?: { debug?: boolean }) {
      mockConstruct(options);
    }

    trigger = mockTrigger;
  }

  return { WebHaptics: MockWebHaptics };
});

jest.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_APP_ENV: 'development' },
}));

describe('triggerButtonHaptic', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_APP_ENV: 'development' },
    }));
    mockTrigger.mockClear();
    mockConstruct.mockClear();
    mockVibrate.mockReset();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: mockVibrate,
    });
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { isActive: true, hasBeenActive: true },
    });
  });

  it('vibrates immediately and skips the async SDK path in development', async () => {
    const { triggerButtonHaptic } = await import('@/infrastructure/haptics/web-haptics/adapter');

    triggerButtonHaptic();

    expect(mockVibrate).toHaveBeenCalledWith(30);
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('skips vibrate when Chrome has no transient user activation', async () => {
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { isActive: false, hasBeenActive: false },
    });
    const { triggerButtonHaptic } = await import('@/infrastructure/haptics/web-haptics/adapter');

    triggerButtonHaptic();

    expect(mockVibrate).not.toHaveBeenCalled();
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('uses the SDK only in production when vibrate exists', async () => {
    jest.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_APP_ENV: 'production' },
    }));
    const { triggerButtonHaptic } = await import('@/infrastructure/haptics/web-haptics/adapter');

    triggerButtonHaptic();

    expect(mockVibrate).toHaveBeenCalledWith(30);
    expect(mockConstruct).toHaveBeenCalledWith({ debug: false });
    expect(mockTrigger).toHaveBeenCalledWith('medium');
  });

  it('plays click audio in production when vibrate is missing (iOS)', async () => {
    jest.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_APP_ENV: 'production' },
    }));
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });
    const { triggerButtonHaptic } = await import('@/infrastructure/haptics/web-haptics/adapter');

    triggerButtonHaptic();

    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('swallows vibrate exceptions', async () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: () => {
        throw new Error('blocked');
      },
    });
    const { triggerButtonHaptic } = await import('@/infrastructure/haptics/web-haptics/adapter');

    expect(() => triggerButtonHaptic()).not.toThrow();
    expect(mockTrigger).not.toHaveBeenCalled();
  });
});
