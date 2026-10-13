'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { AddressForm, type AddressFormValues } from '@/components/cart/sheets/AddressForm';
import {
  AddressList,
  AddressPickerFooter,
  type CartAddress,
} from '@/components/cart/sheets/AddressList';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { cartMessages } from '@/config/cart/cart.config';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type AddressView = 'select' | 'add';

interface AddressSelectSheetProps {
  open: boolean;
  onClose: () => void;
  addresses: CartAddress[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAddAddress: (values: AddressFormValues) => void;
}

/** Centered modal for address selection on laptop+ desktop. */
function CartAddressModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="z-modal fixed inset-0 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={cartMessages.a11y.closeSheet}
        onClick={onClose}
      />
      <div
        className="z-modal relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#EFEFEF] px-6 py-4">
          <h2 id="address-modal-title" className="text-lg font-normal text-[#151515]">
            {title}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-[#151515]"
            aria-label={cartMessages.a11y.closeSheet}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Address picker — bottom sheet on mobile/tablet, centered modal on laptop+. */
export function AddressSelectSheet({
  open,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAddAddress,
}: AddressSelectSheetProps) {
  const isLaptop = useMediaQuery('laptop');
  const [view, setView] = useState<AddressView>('select');

  useEffect(() => {
    if (!open) return undefined;

    window.history.pushState({ cartSheet: 'address' }, '');

    const handlePopState = () => {
      setView('select');
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose, open]);

  const handleClose = () => {
    setView('select');
    onClose();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    handleClose();
  };

  const handleSave = (values: AddressFormValues) => {
    onAddAddress(values);
    setView('select');
  };

  const title = view === 'add' ? cartMessages.addNewAddress : cartMessages.selectAddress;

  const content =
    view === 'add' ? (
      <AddressForm onSave={handleSave} />
    ) : (
      <div className="flex flex-col gap-4">
        <AddressList addresses={addresses} selectedId={selectedId} onSelect={handleSelect} />
        <AddressPickerFooter onAddNew={() => setView('add')} />
      </div>
    );

  if (!open) return null;

  if (isLaptop) {
    return (
      <CartAddressModal open={open} onClose={handleClose} title={title}>
        {content}
      </CartAddressModal>
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      {content}
    </BottomSheet>
  );
}
