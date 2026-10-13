import { buildHealthCheckResponse } from '@/lib/health/health-check';

describe('buildHealthCheckResponse', () => {
  it('returns ok status with the service name', () => {
    expect(buildHealthCheckResponse('Palmonas')).toEqual({
      status: 'ok',
      service: 'Palmonas',
    });
  });
});
