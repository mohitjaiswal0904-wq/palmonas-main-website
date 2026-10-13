import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils/cn';

interface AccountPageShellProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}

/** Account auth chrome — header + main only (no site footer, same as cart). */
export function AccountPageShell({ children, centered = false, className }: AccountPageShellProps) {
  return (
    <>
      <Header />
      <main
        className={cn(
          'container py-10',
          centered && 'flex min-h-[calc(100vh-8rem)] items-center justify-center',
          className,
        )}
      >
        {children}
      </main>
    </>
  );
}
