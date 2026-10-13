import Link from 'next/link';

import { deliveryAddressEditPath } from '@/components/account/common/account-routes';
import { AddressEditIcon } from '@/components/account/delivery-address/AddressActionIcons';
import { addressMessages } from '@/config/address/address.config';
import type { UserAddress } from '@/types/user';

interface AddressCardProps {
  address: UserAddress;
}

export function AddressCard({ address }: AddressCardProps) {
  const editLabel = addressMessages.a11y.editAddress.replace('{name}', address.fullName);

  return (
    <article className="relative rounded-2xl bg-[#F3F3F3] p-4">
      <div className="flex items-start gap-2 pr-10">
        <h2 className="text-sm font-bold text-[#151515]">{address.fullName}</h2>
        {address.isDefault ? (
          <span className="rounded-full bg-[#151515] px-2 py-0.5 text-xs font-medium text-white">
            Default
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-1 text-sm font-normal text-[#757575]">
        {address.company ? <p>{address.company}</p> : null}
        <p>{address.addressLine1}</p>
        {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
        <p>
          {address.zip} {address.city}
          {address.province ? `, ${address.province}` : ''}
        </p>
        <p>{address.country}</p>
        {address.phone ? <p>{address.phone}</p> : null}
      </div>

      <Link
        href={deliveryAddressEditPath(address.id)}
        className="absolute top-4 right-4 text-[#151515]"
        aria-label={editLabel}
      >
        <AddressEditIcon />
      </Link>
    </article>
  );
}
