"use client";

import { useState } from "react";
import BottomSheet from "./BottomSheet";
import type { Address } from "./types";

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

interface NewAddress {
  fullName: string;
  line1: string;
  line2: string;
  zip: string;
  phone: string;
  city: string;
  country: string;
  isDefault: boolean;
}

const emptyForm: NewAddress = {
  fullName: "",
  line1: "",
  line2: "",
  zip: "",
  phone: "",
  city: "",
  country: "",
  isDefault: false,
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-[#151515]">
        {label}
        {required ? <span className="text-[#e0517a]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#151515] outline-none placeholder:text-[#a3a3a3] focus:border-[#151515]";

/**
 * Address flow sheet. Shows the saved-address list ("Select Address") and an
 * inline "Add New Address" form, switching between the two modes internally.
 */
export default function AddressSheet({
  open,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (addr: Omit<Address, "id">) => void;
}) {
  const [mode, setMode] = useState<"list" | "add">("list");
  const [form, setForm] = useState<NewAddress>(emptyForm);

  const close = () => {
    setMode("list");
    setForm(emptyForm);
    onClose();
  };

  const canSave = form.fullName.trim() && form.line1.trim() && form.phone.trim();

  const save = () => {
    if (!canSave) return;
    onAdd({
      name: form.fullName.trim(),
      lines: [
        form.line1.trim(),
        form.line2.trim(),
        [form.zip.trim(), form.city.trim()].filter(Boolean).join(" "),
        form.country.trim(),
        form.phone.trim(),
      ].filter(Boolean),
      isDefault: form.isDefault,
    });
    setForm(emptyForm);
    setMode("list");
  };

  /* ---------- Add New Address ---------- */
  if (mode === "add") {
    return (
      <BottomSheet
        open={open}
        onClose={close}
        title="Add New Address"
        footer={
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="h-12 w-full rounded-xl bg-[#151515] text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Save
          </button>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Full Name">
            <input
              className={inputCls}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Address line 1" required>
            <input
              className={inputCls}
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
          </Field>
          <Field label="Address line 2">
            <input
              className={inputCls}
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
          </Field>
          <Field label="Postal/Zip Code" required>
            <input
              className={inputCls}
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </Field>
          <Field label="Phone Number" required>
            <input
              className={inputCls}
              inputMode="tel"
              placeholder="+918090835556"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="City">
            <input
              className={inputCls}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <select
              className={`${inputCls} appearance-none`}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              <option value="">Choose from here</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="UAE">UAE</option>
            </select>
          </Field>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#151515]">Set As Default</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.isDefault}
              onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.isDefault ? "bg-[#151515]" : "bg-[#d4d4d4]"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                  form.isDefault ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMode("list")}
            className="text-sm font-medium text-[#64748b] underline-offset-2 hover:underline"
          >
            Back to saved addresses
          </button>
        </div>
      </BottomSheet>
    );
  }

  /* ---------- Select Address ---------- */
  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="Select Address"
      footer={
        <button
          type="button"
          onClick={() => setMode("add")}
          className="h-12 w-full rounded-xl bg-[#151515] text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Add New Address
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {addresses.map((addr) => {
          const selected = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => {
                onSelect(addr.id);
                close();
              }}
              className={`flex items-start gap-3 rounded-xl p-4 text-left transition-colors ${
                selected ? "bg-[#f6f6f6] ring-1 ring-[#151515]" : "bg-white"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-[#151515]">
                    {addr.name}
                  </p>
                  {selected ? (
                    <span className="rounded bg-[#151515] px-2 py-0.5 text-[10px] font-medium text-white">
                      Selected
                    </span>
                  ) : addr.isDefault ? (
                    <span className="rounded bg-[#e5f6ea] px-2 py-0.5 text-[10px] font-medium text-[#008236]">
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 space-y-0.5 text-sm text-[#707070]">
                  {addr.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              <span className="text-[#707070]">
                <EditIcon />
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
