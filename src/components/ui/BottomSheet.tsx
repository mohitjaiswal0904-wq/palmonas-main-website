'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cartMessages } from '@/config/cart/cart.config';
import { cn } from '@/lib/utils/cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Modal bottom sheet with scroll lock and portal rendering. */
export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  // Lock body scroll and handle Escape while sheet is open.
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
    <div className={cn('z-modal-backdrop fixed inset-0 flex items-end justify-center', className)}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={cartMessages.a11y.closeSheet}
        onClick={onClose}
      />
      <div
        className="z-modal relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
      >
        <div className="flex items-center justify-between border-b border-[#EFEFEF] px-4 py-4">
          <h2 id="bottom-sheet-title" className="text-lg font-normal text-[#151515]">
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
        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
