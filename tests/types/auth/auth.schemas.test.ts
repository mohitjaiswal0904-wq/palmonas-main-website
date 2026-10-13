import {
  AuthTokensSchema,
  AuthUserSchema,
  DeviceInfoSchema,
  GokwikPayloadSchema,
  SessionClaimsSchema,
  SetSessionBodySchema,
} from '@/types/auth/auth.schemas';

describe('auth.schemas', () => {
  it('validates device info', () => {
    const result = DeviceInfoSchema.safeParse({
      deviceType: 'web',
      deviceId: 'dev-1',
      deviceName: 'Chrome',
      fcmToken: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty device id', () => {
    const result = DeviceInfoSchema.safeParse({
      deviceType: 'web',
      deviceId: '',
      deviceName: 'Chrome',
      fcmToken: null,
    });
    expect(result.success).toBe(false);
  });

  it('validates gokwik payload with kp token', () => {
    const result = GokwikPayloadSchema.safeParse({
      phone: '9999999999',
      email: null,
      password: null,
      shopifyCustomerId: null,
      isNewUser: false,
      state: 'active',
      kpToken: 'kp-token',
    });
    expect(result.success).toBe(true);
  });

  it('validates auth tokens pair', () => {
    const result = AuthTokensSchema.safeParse({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 3600,
      refreshTokenExpiresIn: 7200,
    });
    expect(result.success).toBe(true);
  });

  it('validates set session body with snake_case aliases via preprocess in consumer', () => {
    const result = SetSessionBodySchema.safeParse({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 3600,
    });
    expect(result.success).toBe(true);
  });

  it('rejects set session body without tokens', () => {
    const result = SetSessionBodySchema.safeParse({ expiresIn: 3600 });
    expect(result.success).toBe(false);
  });

  it('validates auth user and session claims', () => {
    expect(
      AuthUserSchema.safeParse({
        id: 'u1',
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        profilePicture: null,
        gender: 'prefer-not-to-say',
        isGuest: false,
      }).success,
    ).toBe(true);

    expect(
      SessionClaimsSchema.safeParse({
        userId: 'u1',
        sessionId: 's1',
        isGuest: false,
        shopifyCustomerId: null,
        expiresAt: 123,
      }).success,
    ).toBe(true);
  });

  it('rejects invalid auth user shape', () => {
    expect(AuthUserSchema.safeParse({ id: 'u1' }).success).toBe(false);
  });
});
