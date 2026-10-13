import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { AppError, normaliseError } from '@/lib/errors';
import type { ApiResponse } from '@/types/api';
import {
  transformAuthTokens,
  transformUser,
  transformUserDetailsToPopPrefill,
} from '@/types/customer';
import type {
  AuthTokens,
  AuthTokensEnvelopeApiResponse,
  Customer,
  LoginCredentials,
  Order,
  PopUserPrefill,
  RegisterInput,
  UserEnvelopeApiResponse,
} from '@/types/customer';

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  try {
    const { data } = await api.post<AuthTokensEnvelopeApiResponse>(ENDPOINTS.auth.login, {
      email_address: credentials.email,
      password: credentials.password,
    });
    return transformAuthTokens(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function registerCustomer(input: RegisterInput): Promise<Customer> {
  try {
    void input;
    throw new AppError('VALIDATION', 'Customer registration is not available in backend v1', 400);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post(ENDPOINTS.auth.logout);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getCurrentCustomer(): Promise<Customer> {
  try {
    const { data } = await api.get<UserEnvelopeApiResponse>(ENDPOINTS.auth.me);
    return transformUser(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches the authenticated user's profile and maps it to POP form prefills.
 * Uses the first saved address when available.
 *
 * @returns Prefill fields for the POP personal-details form.
 * @throws {AppError} When the user/details request fails.
 */
export async function getUserDetailsForPopPrefill(): Promise<PopUserPrefill> {
  try {
    const { data } = await api.get<UserEnvelopeApiResponse>(ENDPOINTS.auth.me);
    return transformUserDetailsToPopPrefill(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const { data } = await api.get<ApiResponse<Order[]>>(ENDPOINTS.orders.list);
    return data.data;
  } catch (err) {
    throw normaliseError(err);
  }
}
