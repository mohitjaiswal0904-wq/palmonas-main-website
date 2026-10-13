import 'server-only';

import axios from 'axios';

import { getMtoApiBaseUrl } from '@/lib/env';
import { normaliseError } from '@/lib/errors';
import { transformMtoPrice, type MtoPrice, type MtoPriceParams } from '@/types/mto-price';

const MTO_API_TIMEOUT_MS = 10_000;

const mtoApiClient = axios.create({
  baseURL: getMtoApiBaseUrl(),
  timeout: MTO_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

export async function getMtoPrice(params: MtoPriceParams): Promise<MtoPrice> {
  try {
    const { data } = await mtoApiClient.get('/api/mto/price', {
      params: {
        sku: params.sku,
        purity: params.purity,
      },
    });

    return transformMtoPrice(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
