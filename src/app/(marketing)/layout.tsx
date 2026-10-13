import type { ReactNode } from 'react';

import { StreamingPageShell } from '@/components/layout/StreamingPageShell';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StreamingPageShell>{children}</StreamingPageShell>
    </div>
  );
}
