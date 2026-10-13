import Cookies from 'js-cookie';

const SECURE = process.env.NODE_ENV === 'production';

export const cookieClient = {
  get: (key: string) => Cookies.get(key),

  set: (key: string, value: string, days = 7) => {
    Cookies.set(key, value, {
      expires: days,
      secure: SECURE,
      sameSite: 'lax',
      path: '/',
    });

    if (process.env.NODE_ENV === 'development' && Cookies.get(key) !== value) {
      console.warn(
        `[auth.cookies] Failed to persist "${key}" — check host (localhost vs 127.0.0.1)`,
        'and browser cookie settings',
      );
    }
  },

  remove: (key: string) => Cookies.remove(key, { path: '/' }),
};
