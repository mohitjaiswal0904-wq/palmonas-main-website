import axios from 'axios';

import { AppError, isAppError, normaliseError } from '@/lib/errors';

describe('normaliseError', () => {
  it('returns existing AppError unchanged', () => {
    const original = new AppError('NOT_FOUND', 'Missing');
    expect(normaliseError(original)).toBe(original);
  });

  it('maps 404 axios errors to NOT_FOUND', () => {
    const axiosError = new axios.AxiosError('Not found', '404', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { message: 'User missing' },
    });

    const error = normaliseError(axiosError);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('User missing');
  });

  it('maps network failures to NETWORK', () => {
    const axiosError = new axios.AxiosError('Network Error');
    const error = normaliseError(axiosError);
    expect(error.code).toBe('NETWORK');
  });
});
