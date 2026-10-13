/** Client-only — calls Palmonas OMS public stores API via @/lib/oms-api. Used by useStores hook. */
import { normaliseError } from '@/lib/errors';
import { omsApi } from '@/lib/oms-api';
import {
  transformStoresResponse,
  type StoreListParams,
  type StoresApiResponse,
  type StoresResponse,
} from '@/types/store';

const STORES_PATH = '/api/v1/public/stores';

function toStoreQuery(params: StoreListParams): Record<string, string | number | boolean> {
  return {
    images: params.images ?? true,
    limit: params.limit,
    page: params.page,
    ...(params.search && { search: params.search }),
  };
}

export async function getStores(params: StoreListParams): Promise<StoresResponse> {
  try {
    const { data } = await omsApi.get<StoresApiResponse>(STORES_PATH, {
      params: toStoreQuery(params),
    });

    return transformStoresResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
