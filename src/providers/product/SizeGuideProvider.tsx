'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

export type SizeGuideKind = 'ring' | 'diamond';

export interface SizeGuideOpenParams {
  kind: SizeGuideKind;
  title?: string;
  closeLabel?: string;
  bodyStyle?: CSSProperties;
}

interface SizeGuideContextValue {
  isOpen: boolean;
  params: SizeGuideOpenParams | null;
  openSizeGuide: (params: SizeGuideOpenParams) => void;
  closeSizeGuide: () => void;
}

const SIZE_GUIDE_FALLBACK: SizeGuideContextValue = {
  isOpen: false,
  params: null,
  openSizeGuide: () => undefined,
  closeSizeGuide: () => undefined,
};

const SizeGuideContext = createContext<SizeGuideContextValue | null>(null);

/**
 * Holds size/diamond guide sheet state for shared layout hosting.
 */
export function SizeGuideProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<SizeGuideOpenParams | null>(null);

  const openSizeGuide = useCallback((next: SizeGuideOpenParams) => {
    setParams(next);
  }, []);

  const closeSizeGuide = useCallback(() => {
    setParams(null);
  }, []);

  const value = useMemo<SizeGuideContextValue>(
    () => ({
      isOpen: params !== null,
      params,
      openSizeGuide,
      closeSizeGuide,
    }),
    [params, openSizeGuide, closeSizeGuide],
  );

  return <SizeGuideContext.Provider value={value}>{children}</SizeGuideContext.Provider>;
}

/**
 * Access size-guide sheet open/close controls.
 *
 * @returns Context value, or no-op fallback when used outside the provider
 */
export function useSizeGuide(): SizeGuideContextValue {
  const context = useContext(SizeGuideContext);

  return context ?? SIZE_GUIDE_FALLBACK;
}
