import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PageChromeSkeleton } from '@/components/layout/PageChromeSkeleton';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Dashboard',
  path: '/dashboard',
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<PageChromeSkeleton />}>{children}</Suspense>
    </div>
  );
}
