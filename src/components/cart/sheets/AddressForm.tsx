'use client';

import { useState } from 'react';

import type { CartAddress } from '@/components/cart/sheets/AddressList';
import { cartMessages } from '@/config/cart/cart.config';

export type AddressFormValues = Omit<CartAddress, 'id'>;

interface AddressFormProps {
  onSave: (values: AddressFormValues) => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs tracking-wide text-[#313131]">
      {children}
      {required ? <span className="text-[#ff3b30]"> *</span> : null}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[42px] w-full rounded-[5px] border border-[#787878] px-3 text-xs text-[#313131]"
    />
  );
}

/** Add-new-address form — shared between mobile sheet and desktop modal. */
export function AddressForm({ onSave }: AddressFormProps) {
  const [fullName, setFullName] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!line1.trim() || !zip.trim() || !phone.trim()) return;
    onSave({
      fullName: fullName.trim() || 'Name',
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim() || 'City',
      zip: zip.trim(),
      phone: phone.trim(),
      country: country.trim() || 'India',
      isDefault,
    });
  };

  return (
    <div className="flex flex-col gap-2.5" data-testid="address-form">
      <div className="flex flex-col gap-1">
        <FieldLabel>{cartMessages.fullName}</FieldLabel>
        <TextInput value={fullName} onChange={setFullName} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel required>{cartMessages.addressLine1}</FieldLabel>
        <TextInput value={line1} onChange={setLine1} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel>{cartMessages.addressLine2}</FieldLabel>
        <TextInput value={line2} onChange={setLine2} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel required>{cartMessages.postalZip}</FieldLabel>
        <TextInput value={zip} onChange={setZip} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel required>{cartMessages.phoneNumber}</FieldLabel>
        <TextInput value={phone} onChange={setPhone} placeholder="+91" />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel>{cartMessages.city}</FieldLabel>
        <TextInput value={city} onChange={setCity} />
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel>{cartMessages.country}</FieldLabel>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-[42px] w-full rounded-[5px] border border-[#787878] px-3 text-xs text-[#787878]"
        >
          <option value="India">India</option>
          <option value="">{cartMessages.chooseCountry}</option>
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-xs text-[#313131]">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="accent-palmonas-ink h-4 w-4"
        />
        {cartMessages.setAsDefault}
      </label>
      <button
        type="button"
        className="bg-palmonas-ink mt-2 flex h-11 w-full items-center justify-center rounded-lg text-sm text-white"
        onClick={handleSave}
        data-testid="address-save-button"
      >
        {cartMessages.saveAddress}
      </button>
    </div>
  );
}
