import { AddressForm } from '@/components/account/delivery-address/AddressForm';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Edit Address',
  path: '/account/delivery-address',
  noIndex: true,
});

interface EditDeliveryAddressPageProps {
  params: Promise<{ addressId: string }>;
}

export default async function EditDeliveryAddressPage({ params }: EditDeliveryAddressPageProps) {
  const { addressId } = await params;

  return <AddressForm mode="edit" addressId={addressId} />;
}
