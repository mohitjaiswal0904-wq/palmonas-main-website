'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cartMessages, cartTheme } from '@/config/cart/cart.config';

interface ChooseOptionsOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Document id for the dialog title (must be unique when two pickers can nest). */
  titleId?: string;
}

const overlay = cartTheme.chooseOptionsOverlay;

/**
 * Shared choose-options chrome: bottom sheet below `tab`, Figma dialog from `tab` up.
 */
export function ChooseOptionsOverlay({
  open,
  onClose,
  title,
  children,
  titleId = 'choose-options-title',
}: ChooseOptionsOverlayProps) {
  // Lock body scroll and close on Escape while the picker is open.
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
    <div className={overlay.backdropClass}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={cartMessages.a11y.closeSheet}
        onClick={onClose}
      />
      <div
        className={overlay.shellClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-choose-options-chrome=""
      >
        <div className={overlay.headerClass} style={{ borderColor: overlay.headerBorder }}>
          <h2 id={titleId} className={overlay.titleClass} style={{ color: overlay.titleColor }}>
            {title}
          </h2>
          <button
            type="button"
            className={overlay.closeClass}
            style={{ color: overlay.titleColor }}
            aria-label={cartMessages.a11y.closeSheet}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={overlay.bodyClass}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
