import 'server-only';

import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { createServerApi } from '@/lib/server-api';
import { transformAuthUser } from '@/types/auth/auth.transforms';
import type { AuthUser } from '@/types/auth/auth.types';

interface UserEnvelopeApiResponse {
  data: {
    user_id?: string;
    id?: string;
    full_name?: string;
    email_address?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    is_guest?: boolean;
  };
}

/**
 * Fetches current user on the server using httpOnly cookie from createServerApi.
 *
 * @returns Authenticated user profile.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const client = await createServerApi();
    const { data } = await client.get<UserEnvelopeApiResponse>(ENDPOINTS.auth.me);
    const user = data.data;
    return transformAuthUser({
      id: user.user_id ?? user.id ?? '',
      first_name: user.first_name ?? user.full_name?.split(' ')[0] ?? null,
      last_name: user.last_name ?? null,
      email: user.email ?? user.email_address ?? null,
      phone_number: null,
      profile_picture: null,
      gender: 'prefer-not-to-say',
      is_guest: user.is_guest ?? false,
    });
  } catch (err) {
    throw normaliseError(err);
  }
}
