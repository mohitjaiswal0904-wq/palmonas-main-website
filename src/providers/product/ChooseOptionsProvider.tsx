'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ChooseOptionsIntent } from '@/components/product/ChooseOptionsSheet';
import type { ProductCartMatchingLine } from '@/hooks/cart/useProductCartState';
import type { Product } from '@/types/product';

export type ChooseOptionsSheetIntent = ChooseOptionsIntent | 'removeFromCart';

export interface ChooseOptionsOpenParams {
  product: Product;
  intent: ChooseOptionsSheetIntent;
  onAddedToCart?: () => void;
  /** In-cart lines when {@link intent} is `removeFromCart`. */
  matchingLines?: ProductCartMatchingLine[];
}

interface ChooseOptionsContextValue {
  isOpen: boolean;
  params: ChooseOptionsOpenParams | null;
  openChooseOptions: (params: ChooseOptionsOpenParams) => void;
  closeChooseOptions: () => void;
}

const CHOOSE_OPTIONS_FALLBACK: ChooseOptionsContextValue = {
  isOpen: false,
  params: null,
  openChooseOptions: () => undefined,
  closeChooseOptions: () => undefined,
};

const ChooseOptionsContext = createContext<ChooseOptionsContextValue | null>(null);

/**
 * Holds choose-options sheet state so product CTAs can open one shared sheet host.
 */
export function ChooseOptionsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<ChooseOptionsOpenParams | null>(null);

  const openChooseOptions = useCallback((next: ChooseOptionsOpenParams) => {
    setParams(next);
  }, []);

  const closeChooseOptions = useCallback(() => {
    setParams(null);
  }, []);

  const value = useMemo<ChooseOptionsContextValue>(
    () => ({
      isOpen: params !== null,
      params,
      openChooseOptions,
      closeChooseOptions,
    }),
    [params, openChooseOptions, closeChooseOptions],
  );

  return <ChooseOptionsContext.Provider value={value}>{children}</ChooseOptionsContext.Provider>;
}

/**
 * Access choose-options sheet open/close controls.
 *
 * @returns Context value, or no-op fallback when used outside the provider
 */
export function useChooseOptions(): ChooseOptionsContextValue {
  const context = useContext(ChooseOptionsContext);

  return context ?? CHOOSE_OPTIONS_FALLBACK;
}
