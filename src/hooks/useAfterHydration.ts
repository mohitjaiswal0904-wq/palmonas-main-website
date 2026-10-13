'use client';

import { useSyncExternalStore } from 'react';

const subscribeNoop = (): (() => void) => () => undefined;

/**
 * False during SSR and this component's hydration pass; true afterward.
 * Local gate for streaming Suspense — parent effects can update counts before
 * a suspended child hydrates, so badges must gate in the header itself.
 */
export function useAfterHydration(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
