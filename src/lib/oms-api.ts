import axios from 'axios';

import { getOmsApiBaseUrl } from '@/lib/env';

/** Request timeout (ms) for the OMS public stores API. */
const OMS_API_TIMEOUT_MS = 15_000;

/** Axios client for Palmonas OMS public API (store listings). */
export const omsApi = axios.create({
  baseURL: getOmsApiBaseUrl(),
  timeout: OMS_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});
