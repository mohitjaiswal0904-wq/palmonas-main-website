'use client';

import { cartMessages } from '@/config/cart/cart.config';

export interface CartAddress {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  zip: string;
  phone: string;
  country: string;
  isDefault?: boolean;
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.5 2.5l2 2M2 11.5V14h2.5L12.5 6l-2-2L2 11.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AddressListProps {
  addresses: CartAddress[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Figma-styled selectable address cards for picker sheet/modal. */
export function AddressList({ addresses, selectedId, onSelect }: AddressListProps) {
  return (
    <ul className="flex flex-col gap-2.5" data-testid="address-list">
      {addresses.map((address) => {
        const selected = address.id === selectedId;
        return (
          <li key={address.id}>
            <button
              type="button"
              className={`flex w-full gap-1 rounded-lg p-3 text-left ${
                selected ? 'bg-[#f8fafc]' : 'bg-white'
              }`}
              onClick={() => onSelect(address.id)}
              data-testid={selected ? 'address-card-selected' : 'address-card'}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-1">
                  <span className="text-base font-medium text-[#313131]">{address.fullName}</span>
                  {selected ? (
                    <span className="rounded bg-[#151515] px-1 py-0.5 text-[8px] text-white">
                      {cartMessages.selected}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1 text-xs text-[#707070]">
                  {address.line1 ? <span>{address.line1}</span> : null}
                  {address.line2 ? <span>{address.line2}</span> : null}
                  <span>
                    {address.zip} {address.city}
                  </span>
                  <span>{address.country}</span>
                  {address.phone ? <span>{address.phone}</span> : null}
                </div>
              </div>
              <div className="shrink-0 text-[#707070]">
                <EditIcon />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface AddressPickerFooterProps {
  onAddNew: () => void;
}

/** Black CTA to open add-address form. */
export function AddressPickerFooter({ onAddNew }: AddressPickerFooterProps) {
  return (
    <button
      type="button"
      className="bg-palmonas-ink flex h-11 w-full items-center justify-center rounded-lg text-sm text-white"
      onClick={onAddNew}
      data-testid="address-add-new-button"
    >
      {cartMessages.addNewAddress}
    </button>
  );
}
