/** Client-only — calls external user API via @/lib/api. Used by account hooks. */
import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import {
  toCreateUserAddressApi,
  toUpdateUserAddressApi,
  toUpdateUserDetailsApi,
  transformUserAddress,
  transformUserOrderDetail,
  transformUserOrderInvoice,
  transformUserOrdersList,
  transformUserProfile,
  transformUserWallet,
  transformWalletTransactions,
  unwrapUserEnvelope,
} from '@/types/user';
import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
  UpdateUserProfileInput,
  UserAddress,
  UserAddressApi,
  UserApiEnvelope,
  UserDetailsApi,
  UserOrderDetailApi,
  UserOrderInvoiceApi,
  UserOrdersListApi,
  UserOrderDetail,
  UserOrderInvoice,
  UserOrderSummary,
  UserOrdersQuery,
  UserProfile,
  UserWallet,
  UserWalletApi,
  WalletTransaction,
  WalletTransactionsApi,
} from '@/types/user';

function toOrdersQueryParams(query: UserOrdersQuery = {}): Record<string, string | number> {
  return {
    ...(query.limit !== undefined && { limit: query.limit }),
    ...(query.sinceId && { since_id: query.sinceId }),
    ...(query.status && { status: query.status }),
  };
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserDetailsApi>>(ENDPOINTS.user.details);
    return transformUserProfile(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
  try {
    const { data } = await api.put<UserApiEnvelope<UserDetailsApi>>(
      ENDPOINTS.user.details,
      toUpdateUserDetailsApi(input),
    );
    return transformUserProfile(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserAddresses(): Promise<UserAddress[]> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserAddressApi[]>>(ENDPOINTS.user.addresses);
    return unwrapUserEnvelope(data).map(transformUserAddress);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserAddressById(addressId: string): Promise<UserAddress> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserAddressApi>>(
      ENDPOINTS.user.addressById(addressId),
    );
    return transformUserAddress(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function createUserAddress(input: CreateUserAddressInput): Promise<UserAddress> {
  try {
    const { data } = await api.post<UserApiEnvelope<UserAddressApi>>(
      ENDPOINTS.user.addresses,
      toCreateUserAddressApi(input),
    );
    return transformUserAddress(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function updateUserAddress(
  addressId: string,
  input: UpdateUserAddressInput,
): Promise<UserAddress> {
  try {
    const { data } = await api.put<UserApiEnvelope<UserAddressApi>>(
      ENDPOINTS.user.addressById(addressId),
      toUpdateUserAddressApi(input),
    );
    return transformUserAddress(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function setDefaultUserAddress(addressId: string): Promise<UserAddress> {
  try {
    const { data } = await api.put<UserApiEnvelope<UserAddressApi>>(
      ENDPOINTS.user.addressDefault(addressId),
    );
    return transformUserAddress(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/** Deletes a saved user address by id. */
export async function deleteUserAddress(addressId: string): Promise<void> {
  try {
    await api.delete(ENDPOINTS.user.addressById(addressId));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserOrders(query: UserOrdersQuery = {}): Promise<UserOrderSummary[]> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserOrdersListApi>>(ENDPOINTS.user.orders, {
      params: toOrdersQueryParams(query),
    });
    return transformUserOrdersList(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserOrderById(orderId: string): Promise<UserOrderDetail> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserOrderDetailApi>>(
      ENDPOINTS.user.orderById(orderId),
    );
    return transformUserOrderDetail(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/** Fetches printable invoice payload for an order. */
export async function getUserOrderInvoice(orderId: string): Promise<UserOrderInvoice> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserOrderInvoiceApi>>(
      ENDPOINTS.user.orderInvoice(orderId),
    );
    return transformUserOrderInvoice(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserWallet(): Promise<UserWallet> {
  try {
    const { data } = await api.get<UserApiEnvelope<UserWalletApi>>(ENDPOINTS.user.wallet);
    return transformUserWallet(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getUserWalletTransactions(): Promise<WalletTransaction[]> {
  try {
    const { data } = await api.get<UserApiEnvelope<WalletTransactionsApi>>(
      ENDPOINTS.user.walletTransactions,
    );
    return transformWalletTransactions(unwrapUserEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getRecentlyViewedProducts(limit = 10): Promise<string[]> {
  try {
    const { data } = await api.get<UserApiEnvelope<string[] | string>>(
      ENDPOINTS.user.recentlyViewedProducts,
      { params: { limit } },
    );
    const payload = unwrapUserEnvelope(data);
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload ? [payload] : [];
  } catch (err) {
    throw normaliseError(err);
  }
}
