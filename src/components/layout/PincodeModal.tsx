'use client';

import { X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { pincodeMessages } from '@/config/pincode/pincode.config';
import { usePincode } from '@/hooks/usePincode';
import { pincodeValidator } from '@/lib/validators';
import { useDeliveryPincode } from '@/providers/PincodeProvider';

interface PincodeModalFormProps {
  initialPincode: string;
  onClose: () => void;
  onSave: (pincode: string) => void;
}

function PincodeModalForm({ initialPincode, onClose, onSave }: PincodeModalFormProps) {
  const [input, setInput] = useState(initialPincode);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { validatePincode, isValidating } = usePincode();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = pincodeValidator.safeParse(input.trim());

    if (!parsed.success) {
      setValidationError(pincodeMessages.invalidFormat);
      return;
    }

    setValidationError(null);

    try {
      const validation = await validatePincode(parsed.data);

      if (!validation.valid) {
        setValidationError(validation.message);
        return;
      }

      onSave(parsed.data);
      onClose();
    } catch {
      setValidationError(pincodeMessages.validationFailed);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
        <h2 id="pincode-modal-title" className="text-base font-semibold text-stone-900">
          Enter delivery pincode
        </h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-700 transition-colors hover:bg-stone-100"
          aria-label="Close pincode modal"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form className="px-6 py-5" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-stone-900" htmlFor="delivery-pincode">
          Pincode
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="delivery-pincode"
            inputMode="numeric"
            maxLength={6}
            value={input}
            onChange={(event) => {
              setInput(event.target.value.replace(/\D/g, ''));
              setValidationError(null);
            }}
            placeholder="Enter 6 digit pincode"
            aria-label="Delivery pincode"
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? 'delivery-pincode-error' : undefined}
            autoFocus
          />
          <Button
            type="submit"
            className="shrink-0"
            aria-label="Save delivery pincode"
            disabled={isValidating}
          >
            {isValidating ? pincodeMessages.validating : 'Save'}
          </Button>
        </div>
        {validationError ? (
          <p id="delivery-pincode-error" className="mt-2 text-sm text-red-600" role="alert">
            {validationError}
          </p>
        ) : null}
      </form>
    </>
  );
}

export function PincodeModal() {
  const { isModalOpen, closeModal, pincode, setPincode } = useDeliveryPincode();

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal, isModalOpen]);

  if (!isModalOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="z-modal-backdrop fixed inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close pincode modal"
        onClick={closeModal}
      />
      <Modal className="z-modal relative w-full max-w-md p-0" aria-labelledby="pincode-modal-title">
        <PincodeModalForm
          key={`${isModalOpen}-${pincode ?? ''}`}
          initialPincode={pincode ?? ''}
          onClose={closeModal}
          onSave={setPincode}
        />
      </Modal>
    </div>,
    document.body,
  );
}
