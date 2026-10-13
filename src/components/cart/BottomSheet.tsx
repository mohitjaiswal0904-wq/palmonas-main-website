"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Mobile sheet that slides up from the bottom with a dimmed backdrop. Used for
 * the cart's offers, gift-card, and address flows. Renders nothing when closed.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 [animation:badge-fade-slide_0.2s_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[88vh] w-full max-w-[480px] flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)] [animation:sheet-up_0.28s_cubic-bezier(0.22,0.61,0.36,1)] sm:rounded-3xl",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <h2 className="text-lg font-semibold text-[#151515]">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 text-[#151515] transition-opacity hover:opacity-70"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>

        {/* Optional sticky footer */}
        {footer ? (
          <div className="border-t border-black/5 bg-white p-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
