'use client';

import { isAppError } from '@/lib/errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = isAppError(error) ? error.message : 'Something went wrong. Please try again.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="tracking-palmonas-wider text-sm text-amber-700 uppercase">Error</p>
      <h1 className="font-display mt-4 text-3xl">We hit a snag</h1>
      <p className="mt-4 max-w-md text-stone-600">{message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-palmonas-md mt-8 bg-stone-900 px-6 py-3 text-sm font-medium text-white"
        aria-label="Try again"
      >
        Try again
      </button>
    </main>
  );
}
