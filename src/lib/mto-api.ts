import axios from 'axios';

import { getMtoApiBaseUrl } from '@/lib/env';

/**
 * Request timeout (ms) for the MTO pricing API. Pricing is fetched on the
 * client and blocks the price UI, so keep it short enough to fail fast.
 */
const MTO_API_TIMEOUT_MS = 10_000;

/** Axios client for Palmonas MTO pricing utils API. */
export const mtoApi = axios.create({
  baseURL: getMtoApiBaseUrl(),
  timeout: MTO_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});
