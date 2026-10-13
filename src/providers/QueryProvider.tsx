'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { makeQueryClient } from '@/lib/query/client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures new client per render on server if this was SSR-ed,
  // but it's a client component. It ensures stable instance during hydration.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
