import { AddressForm } from '@/components/account/delivery-address/AddressForm';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Add New Address',
  path: '/account/delivery-address/new',
  noIndex: true,
});

export default function AddDeliveryAddressPage() {
  return <AddressForm mode="create" />;
}
