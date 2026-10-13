'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  readDeliveryPincodeFromStorage,
  writeDeliveryPincodeToStorage,
} from '@/lib/utils/delivery-pincode-storage';
import { pincodeValidator } from '@/lib/validators';

interface PincodeContextValue {
  pincode: string | null;
  pincodeHydrated: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setPincode: (pincode: string) => void;
  clearPincode: () => void;
}

const PINCODE_CONTEXT_FALLBACK: PincodeContextValue = {
  pincode: null,
  pincodeHydrated: false,
  isModalOpen: false,
  openModal: () => undefined,
  closeModal: () => undefined,
  setPincode: () => undefined,
  clearPincode: () => undefined,
};

const pincodeListeners = new Set<() => void>();

function subscribeToPincodeStore(listener: () => void): () => void {
  pincodeListeners.add(listener);

  return () => {
    pincodeListeners.delete(listener);
  };
}

function notifyPincodeStore(): void {
  pincodeListeners.forEach((listener) => listener());
}

const subscribeNoop = (): (() => void) => () => undefined;

function getPincodeSnapshot(): string | null {
  return readDeliveryPincodeFromStorage();
}

function getPincodeServerSnapshot(): string | null {
  return null;
}

const PincodeContext = createContext<PincodeContextValue | null>(null);

export function PincodeProvider({ children }: { children: ReactNode }) {
  const pincode = useSyncExternalStore(
    subscribeToPincodeStore,
    getPincodeSnapshot,
    getPincodeServerSnapshot,
  );
  const pincodeHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setPincode = useCallback((value: string) => {
    const parsed = pincodeValidator.safeParse(value.trim());

    if (!parsed.success) {
      return;
    }

    writeDeliveryPincodeToStorage(parsed.data);
    notifyPincodeStore();
  }, []);

  const clearPincode = useCallback(() => {
    writeDeliveryPincodeToStorage(null);
    notifyPincodeStore();
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo<PincodeContextValue>(
    () => ({
      pincode,
      pincodeHydrated,
      isModalOpen,
      openModal,
      closeModal,
      setPincode,
      clearPincode,
    }),
    [pincode, pincodeHydrated, isModalOpen, openModal, closeModal, setPincode, clearPincode],
  );

  return <PincodeContext.Provider value={value}>{children}</PincodeContext.Provider>;
}

export function useDeliveryPincode(): PincodeContextValue {
  const context = useContext(PincodeContext);

  return context ?? PINCODE_CONTEXT_FALLBACK;
}
