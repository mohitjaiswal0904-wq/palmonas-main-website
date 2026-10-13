import 'server-only';

import axios from 'axios';
import { cookies } from 'next/headers';

import { AUTH_TOKEN_KEY } from '@/lib/cookies/constants';
import { getApiBaseUrl } from '@/lib/env';

function createAxiosClient(headers: Record<string, string> = {}) {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/** Public server client — no cookies. Safe inside `unstable_cache` / ISR fetches. */
export function createPublicServerApi() {
  return createAxiosClient();
}

/** Server-only Axios instance for Server Components and Server Actions. */
export async function createServerApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  return createAxiosClient({
    ...(token && { Authorization: `Bearer ${token}` }),
  });
}
