"use client";

import type { ReactNode } from "react";
import { BackArrowIcon } from "./icons";
import { ChevronDownIcon } from "@/components/ui/icons";

/** Panel title row with an optional back arrow. */
export function PanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="text-[#151515] transition-opacity hover:opacity-60"
        >
          <BackArrowIcon />
        </button>
      ) : null}
      <h1 className="text-lg font-bold text-[#151515]">{title}</h1>
    </div>
  );
}

/**
 * Field display states:
 * - "edit": white input, editable, black text.
 * - "view": white input, locked, muted text (read-only display).
 * - "disabled": filled grey box, locked (e.g. e-mail that can't be changed).
 */
export type FieldState = "edit" | "view" | "disabled";

/** Labelled text input. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  state = "edit",
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  state?: FieldState;
  type?: string;
}) {
  const locked = state !== "edit";
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[#404040]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-[50px] w-full rounded-lg border px-4 text-sm outline-none transition-colors placeholder:text-[#a3a3a3] focus:border-[#151515] ${
          state === "disabled"
            ? "cursor-not-allowed border-[#d9d9d9] bg-[#d9d9d9] text-[#6b6b6b]"
            : state === "view"
              ? "border-[#e5e5e5] bg-white text-[#8a8a8a]"
              : "border-[#e5e5e5] bg-white text-[#151515]"
        }`}
      />
    </label>
  );
}

/** Labelled select with a custom chevron. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  state = "edit",
}: {
  label?: string;
  value: string;
  onChange?: (v: string) => void;
  options: string[];
  placeholder?: string;
  state?: FieldState;
}) {
  const locked = state !== "edit";
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm text-[#404040]">{label}</span>
      ) : null}
      <div className="relative">
        <select
          value={value}
          disabled={locked}
          onChange={(e) => onChange?.(e.target.value)}
          className={`h-[50px] w-full appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 pr-10 text-sm outline-none transition-colors focus:border-[#151515] ${
            value ? "text-[#151515]" : "text-[#a3a3a3]"
          }`}
        >
          <option value="" disabled>
            {placeholder ?? "Choose from here"}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-[#151515]">
              {o}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6b6b6b]" />
      </div>
    </label>
  );
}

/** Full-width black primary button. */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="h-[50px] w-full rounded-lg bg-[#151515] text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}

/** Centered confirmation modal (logout / delete). */
export function ConfirmModal({
  icon,
  message,
  onYes,
  onNo,
}: {
  icon: ReactNode;
  message: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#f1f1f1] text-[#151515]">
          {icon}
        </div>
        <p className="mb-5 text-base font-semibold text-[#151515]">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onYes}
            className="min-w-[88px] rounded-lg border border-[#e5e5e5] px-5 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:bg-[#f5f5f5]"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onNo}
            className="min-w-[88px] rounded-lg bg-[#151515] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
