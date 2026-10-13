'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { productMessages, productTheme } from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';

interface SizeGuideSheetProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
  title?: string;
  closeLabel?: string;
  /** Overrides the default heading type (Wallet Benefits sheet). */
  titleClassName?: string;
  /** Hide the header hairline (Wallet Benefits sheet). */
  hideHeaderBorder?: boolean;
  /** Optional body panel style (e.g. diamond guide wash). */
  bodyStyle?: CSSProperties;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function SizeGuideSheet({
  open,
  onClose,
  children,
  className,
  title = productMessages.sizeGuide,
  closeLabel = productMessages.a11y.closeSizeGuide,
  titleClassName,
  hideHeaderBorder = false,
  bodyStyle,
}: SizeGuideSheetProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'z-modal-backdrop laptop:items-center laptop:p-6 fixed inset-0 flex items-end justify-center',
        className,
      )}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className="z-modal laptop:max-h-[80vh] laptop:max-w-lg laptop:rounded-2xl laptop:shadow-lg relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
      >
        <div
          className={cn(
            'laptop:px-6 flex items-center justify-between px-4 py-4',
            !hideHeaderBorder && 'border-b',
          )}
          style={hideHeaderBorder ? undefined : { borderColor: productTheme.borderHairline }}
        >
          <h2
            id="size-guide-title"
            className={cn('text-base font-medium', titleClassName)}
            style={{ color: productTheme.ink }}
          >
            {title}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center"
            style={{ color: productTheme.ink }}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="laptop:px-6 overflow-y-auto px-4 py-6" style={bodyStyle}>
          {children ?? (
            <p className="text-sm font-normal text-stone-600">
              Size guide content will be added soon.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
