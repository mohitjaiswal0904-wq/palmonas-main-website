import { z } from 'zod';

import type { ApiResponse } from '@/types/api';

/** Address row from GET user/details — used for POP form prefills. */
export interface UserAddressApiResponse {
  id?: number | string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zip?: string | null;
  phone?: string | null;
  default?: boolean;
}

export interface UserApiResponse {
  user_id?: string;
  id?: string | number;
  full_name?: string;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email_address?: string;
  email?: string | null;
  phone?: string | null;
  role?: 'admin' | 'user';
  addresses?: UserAddressApiResponse[];
}

/** Prefill payload for the POP personal-details form. */
export interface PopUserPrefill {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
}

export interface AuthTokensApiResponse {
  access_token: string;
  refresh_token: string;
}

export type UserEnvelopeApiResponse = ApiResponse<UserApiResponse>;
export type AuthTokensEnvelopeApiResponse = ApiResponse<AuthTokensApiResponse>;

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type User = Customer;

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const RegisterInputSchema = LoginCredentialsSchema.extend({
  name: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
}

export function transformUser(raw: UserApiResponse | UserEnvelopeApiResponse): Customer {
  const user = 'data' in raw ? raw.data : raw;
  const name =
    user.full_name ?? user.name ?? [user.first_name, user.last_name].filter(Boolean).join(' ');

  return {
    id: String(user.user_id ?? user.id ?? user.email ?? ''),
    name,
    email: user.email_address ?? user.email ?? '',
    role: user.role ?? 'user',
  };
}

/**
 * Strips country codes / non-digits and keeps the last 10 digits for Indian mobile fields.
 *
 * @param phone - Raw phone from the user API (e.g. `+919833290022`).
 * @returns Ten-digit phone string, or empty when none can be derived.
 */
export function normaliseIndianPhone(phone: string | null | undefined): string {
  if (!phone) {
    return '';
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.slice(-10);
}

/**
 * Maps user/details API payload into POP personal-details form values.
 * Uses the first address in `addresses` when present; missing fields stay empty.
 *
 * @param raw - Envelope or bare user details payload.
 * @returns Prefill fields for the POP form.
 */
export function transformUserDetailsToPopPrefill(
  raw: UserApiResponse | UserEnvelopeApiResponse,
): PopUserPrefill {
  const user = 'data' in raw ? raw.data : raw;
  const address = user.addresses?.[0];

  const nameFromUser = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const nameFromAddress = [address?.first_name, address?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const name =
    nameFromUser || address?.name?.trim() || nameFromAddress || user.full_name || user.name || '';

  const phoneSource = user.phone || address?.phone || '';

  return {
    name,
    phone: normaliseIndianPhone(phoneSource),
    email: user.email_address ?? user.email ?? '',
    addressLine1: address?.address1?.trim() ?? '',
    addressLine2: address?.address2?.trim() ?? '',
    city: address?.city?.trim() ?? '',
    pincode: (address?.zip ?? '').replace(/\D/g, '').slice(0, 6),
  };
}

export function transformAuthTokens(
  raw: AuthTokensApiResponse | AuthTokensEnvelopeApiResponse,
): AuthTokens {
  const tokens = 'data' in raw ? raw.data : raw;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}
