'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils/cn';

interface AuthModalShellProps {
  'open': boolean;
  'onClose'?: () => void;
  'children': ReactNode;
  'role'?: 'dialog' | 'status';
  'aria-label': string;
  'className'?: string;
}

/**
 * Portal-based auth overlay shell using Palmonas theme tokens.
 */
export function AuthModalShell({
  open,
  onClose,
  children,
  role = 'dialog',
  'aria-label': ariaLabel,
  className,
}: AuthModalShellProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
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
    <div className="z-modal-backdrop fixed inset-0 flex items-center justify-center p-4">
      {onClose ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label="Close"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      )}
      <div
        className={cn(
          'z-modal rounded-palmonas-xl border-palmonas-border relative w-full max-w-sm border',
          'bg-palmonas-surface shadow-palmonas-medium p-8 text-center',
          className,
        )}
        role={role}
        aria-modal={role === 'dialog' ? true : undefined}
        aria-label={ariaLabel}
        aria-live={role === 'status' ? 'polite' : undefined}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export const authModalPrimaryButtonClassName =
  'h-12 w-full rounded-full bg-palmonas-ink text-palmonas-surface hover:bg-palmonas-muted';

export const authModalSecondaryButtonClassName =
  'h-12 rounded-full border border-palmonas-border bg-palmonas-surface text-palmonas-ink hover:bg-palmonas-soft';

export const authModalInputClassName =
  'border-palmonas-border bg-palmonas-soft text-palmonas-ink placeholder:text-palmonas-subtle';
