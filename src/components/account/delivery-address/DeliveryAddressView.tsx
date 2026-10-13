'use client';

import Link from 'next/link';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { deliveryAddressNewPath } from '@/components/account/common/account-routes';
import { AddressCard } from '@/components/account/delivery-address/AddressCard';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useUserAddresses } from '@/hooks/user';

export function DeliveryAddressView() {
  const { addresses, isLoading, error } = useUserAddresses();

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  if (error) {
    return (
      <ResourceNotFound
        title="Unable to load addresses"
        description="Please sign in and try again."
        ctaHref="/account"
        ctaLabel="Back to account"
      />
    );
  }

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title="Saved Addresses" />

      {!addresses?.length ? (
        <p className="mt-6 text-sm font-normal text-[#757575]">
          You have not saved any delivery addresses yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4" aria-label="Saved addresses">
          {addresses.map((address) => (
            <li key={address.id}>
              <AddressCard address={address} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href={deliveryAddressNewPath()}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
        aria-label="Add new address"
      >
        Add New Address
      </Link>
    </div>
  );
}
