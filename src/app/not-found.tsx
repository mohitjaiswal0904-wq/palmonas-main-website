'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { AppLink } from '@/components/ui/AppLink';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (pathname === '/' || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    router.replace('/');
  }, [pathname, router]);

  if (pathname !== '/') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-stone-600" aria-live="polite">
          Redirecting to home…
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="tracking-palmonas-wider text-sm text-amber-700 uppercase">404</p>
      <h1 className="font-display mt-4 text-4xl">Page not found</h1>
      <p className="mt-4 max-w-md text-stone-600">
        The page you are looking for does not exist or is not available yet.
      </p>
      <AppLink
        href="/"
        prefetch
        className="rounded-palmonas-md mt-8 bg-stone-900 px-6 py-3 text-sm font-medium text-white"
      >
        Back to home
      </AppLink>
    </main>
  );
}
