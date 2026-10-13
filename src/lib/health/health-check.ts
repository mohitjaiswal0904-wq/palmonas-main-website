/** Liveness payload returned by GET /health. */
export interface HealthCheckResponse {
  status: 'ok';
  service: string;
}

/**
 * Builds the standard health-check JSON body.
 *
 * @param service - Application or service name for load balancers / probes.
 */
export function buildHealthCheckResponse(service: string): HealthCheckResponse {
  return {
    status: 'ok',
    service,
  };
}
