import axios from 'axios';

import {
  POSTAL_PINCODE_API_BASE_URL,
  POSTAL_PINCODE_API_TIMEOUT_MS,
} from '@/config/pincode/pincode.config';

/** Axios client for India Post public pincode lookup API. */
export const postalPincodeApi = axios.create({
  baseURL: POSTAL_PINCODE_API_BASE_URL,
  timeout: POSTAL_PINCODE_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});
