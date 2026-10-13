import { z } from 'zod';

/** Zod schema for device_info sent to auth APIs. */
export const DeviceInfoSchema = z.object({
  deviceType: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().min(1),
  deviceName: z.string().min(1),
  fcmToken: z.string().nullable(),
});

/** Zod schema for Gokwik login payload. */
export const GokwikPayloadSchema = z.object({
  phone: z.string(),
  email: z.string().nullable(),
  password: z.string().nullable(),
  shopifyCustomerId: z.string().nullable(),
  isNewUser: z.boolean(),
  state: z.string().nullable(),
  kpToken: z.string().nullable().optional(),
  multipassToken: z.string().nullable().optional(),
  customerInsights: z.record(z.unknown()).nullable().optional(),
});

/** Zod schema for AuthUser domain object. */
export const AuthUserSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePicture: z.string().nullable(),
  gender: z.string(),
  isGuest: z.boolean(),
});

/** Zod schema for session claims derived from JWT. */
export const SessionClaimsSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  isGuest: z.boolean(),
  shopifyCustomerId: z.string().nullable(),
  expiresAt: z.number(),
});

/** Zod schema for access + refresh token pair. */
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  refreshTokenExpiresIn: z.number(),
});

/** Zod schema for persisting tokens (legacy BFF body shape; kept for validation helpers). */
export const SetSessionBodySchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
  refreshTokenExpiresIn: z.number().optional(),
});
