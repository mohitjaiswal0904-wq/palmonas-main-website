'use client';

import { Suspense, useLayoutEffect, useState, type ReactNode } from 'react';

interface StableChromeSuspenseProps {
  /** Shown only before the first successful render of `children`. */
  fallback: ReactNode;
  children: ReactNode;
}

/**
 * Suspense boundary that keeps the last resolved chrome visible during soft navigations.
 *
 * @param props - Initial fallback and async server chrome children.
 */
export function StableChromeSuspense({ fallback, children }: StableChromeSuspenseProps) {
  const [lastResolved, setLastResolved] = useState<ReactNode | null>(null);

  return (
    <Suspense fallback={lastResolved ?? fallback}>
      <StableChromeCapture onCapture={setLastResolved}>{children}</StableChromeCapture>
    </Suspense>
  );
}

interface StableChromeCaptureProps {
  children: ReactNode;
  onCapture: (node: ReactNode) => void;
}

/** Stores the latest resolved chrome for reuse as the next Suspense fallback. */
function StableChromeCapture({ children, onCapture }: StableChromeCaptureProps) {
  useLayoutEffect(() => {
    onCapture(children);
  }, [children, onCapture]);

  return children;
}
