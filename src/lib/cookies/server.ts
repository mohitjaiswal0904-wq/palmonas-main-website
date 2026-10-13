import { cookies } from 'next/headers';

export const cookieServer = {
  get: async (key: string) => {
    const cookieStore = await cookies();
    return cookieStore.get(key)?.value ?? null;
  },

  set: async (key: string, value: string, maxAgeSeconds = 604_800) => {
    const cookieStore = await cookies();
    cookieStore.set(key, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds,
    });
  },

  remove: async (key: string) => {
    const cookieStore = await cookies();
    cookieStore.delete(key);
  },
};
