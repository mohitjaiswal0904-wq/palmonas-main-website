import { Suspense, type ReactNode } from 'react';

import { PageChromeSkeleton } from '@/components/layout/PageChromeSkeleton';

export default function CmsPagesLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageChromeSkeleton />}>{children}</Suspense>;
}
