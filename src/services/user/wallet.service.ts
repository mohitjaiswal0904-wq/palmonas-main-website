/** Client-only — thin HTTP layer for user wallet v2 API. */
import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { transformWalletResponse } from '@/types/user/wallet.transforms';
import type { Wallet, WalletApiData } from '@/types/user/wallet.types';

interface BackendEnvelope<T> {
  status?: number;
  message?: string;
  data: T;
  timestamp?: string;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as BackendEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return payload as T;
}

/**
 * Fetches authenticated user's wallet details.
 *
 * @returns UI-friendly wallet model.
 * @throws Normalised app error when the API request fails.
 */
export async function fetchWalletDetails(): Promise<Wallet> {
  try {
    const response = await api.get<BackendEnvelope<WalletApiData>>(ENDPOINTS.user.wallet);
    const data = unwrapData<WalletApiData>(response.data);
    return transformWalletResponse(data);
  } catch (error) {
    throw normaliseError(error);
  }
}
