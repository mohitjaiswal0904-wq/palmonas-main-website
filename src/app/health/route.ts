import { NextResponse } from 'next/server';

import { siteConfig } from '@/config/site.config';
import { buildHealthCheckResponse } from '@/lib/health/health-check';

/** Liveness probe for load balancers, ECS, and Docker health checks. */
export function GET() {
  return NextResponse.json(buildHealthCheckResponse(siteConfig.name), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
