"use client";

import { useState } from "react";
import { COUNTRIES, INITIAL_ADDRESSES, type Address } from "@/data/profile";
import { EditIcon, TrashIcon } from "../icons";
import { ConfirmModal, Field, PanelHeader, PrimaryButton, SelectField } from "../ui";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#151515]" : "bg-[#d4d4d4]"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  company: "",
  postalCode: "",
  phone: "",
  city: "",
  country: "",
  isDefault: false,
};

type FormState = typeof EMPTY_FORM;

function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Address;
  onCancel: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          firstName: initial.name,
          lastName: "",
          line1: initial.line1,
          line2: initial.line2,
          company: initial.company,
          postalCode: initial.postalCode,
          phone: initial.phone,
          city: initial.city,
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : EMPTY_FORM,
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-[530px]">
      <PanelHeader title={initial ? "Edit Address" : "Add New Address"} onBack={onCancel} />
      <div className="space-y-5">
        <Field label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)} />
        <Field label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)} />
        <Field label="Address line 1" value={form.line1} onChange={(v) => set("line1", v)} />
        <Field label="Address line 2" value={form.line2} onChange={(v) => set("line2", v)} />
        <Field label="Company Name" value={form.company} onChange={(v) => set("company", v)} />
        <Field label="Postal/Zip Code" value={form.postalCode} onChange={(v) => set("postalCode", v)} />
        <Field
          label="Phone Number"
          value={form.phone}
          onChange={(v) => set("phone", v)}
          placeholder="+918090835556"
        />
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
        <SelectField
          label="Country"
          value={form.country}
          onChange={(v) => set("country", v)}
          options={COUNTRIES}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#404040]">Set As Default</span>
          <Toggle checked={form.isDefault} onChange={(v) => set("isDefault", v)} />
        </div>
        <PrimaryButton onClick={() => onSave(form)}>Save</PrimaryButton>
      </div>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative rounded-xl bg-[#f6f6f6] p-5">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#151515]">{address.name}</span>
        {address.isDefault ? (
          <span className="rounded bg-[#151515] px-2 py-0.5 text-[10px] font-medium text-white">
            Default
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit address"
        className="absolute right-4 top-4 text-[#151515] transition-opacity hover:opacity-60"
      >
        <EditIcon />
      </button>
      <div className="mt-2 space-y-0.5 text-[13px] text-[#62748e]">
        {address.company ? <p>{address.company}</p> : null}
        <p>{address.line1}</p>
        {address.line2 ? <p>{address.line2}</p> : null}
        <p>
          {address.postalCode} {address.city}
        </p>
        <p>{address.country}</p>
        <p>{address.phone}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete address"
        className="absolute bottom-4 right-4 text-[#151515] transition-colors hover:text-[#e7000b]"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function Addresses({ onExit }: { onExit: () => void }) {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Address | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleSave = (form: FormState) => {
    const normalised: Address = {
      id: editing?.id ?? `a-${Date.now()}`,
      name: form.firstName || "Name",
      isDefault: form.isDefault,
      company: form.company,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country || "India",
      phone: form.phone,
    };
    setAddresses((prev) => {
      const next = editing
        ? prev.map((a) => (a.id === editing.id ? normalised : a))
        : [...prev, normalised];
      return normalised.isDefault
        ? next.map((a) => ({ ...a, isDefault: a.id === normalised.id }))
        : next;
    });
    setEditing(null);
    setMode("list");
  };

  const confirmDelete = () => {
    setAddresses((prev) => prev.filter((a) => a.id !== pendingDelete));
    setPendingDelete(null);
  };

  if (mode === "form") {
    return (
      <AddressForm
        initial={editing ?? undefined}
        onCancel={() => {
          setEditing(null);
          setMode("list");
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="max-w-[530px]">
      <PanelHeader title="Saved Addresses" onBack={onExit} />
      <div className="space-y-4">
        {addresses.map((a) => (
          <AddressCard
            key={a.id}
            address={a}
            onEdit={() => {
              setEditing(a);
              setMode("form");
            }}
            onDelete={() => setPendingDelete(a.id)}
          />
        ))}
      </div>
      <div className="mt-5">
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setMode("form");
          }}
        >
          Add New Address
        </PrimaryButton>
      </div>

      {pendingDelete ? (
        <ConfirmModal
          icon={<TrashIcon />}
          message="Do you really want to delete this address?"
          onYes={confirmDelete}
          onNo={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}
