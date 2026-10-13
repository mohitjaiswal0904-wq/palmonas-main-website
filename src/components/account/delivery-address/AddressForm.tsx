'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { AddressToggle } from '@/components/account/delivery-address/AddressToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import {
  ADDRESS_COUNTRY_OPTIONS,
  ADDRESS_STATE_OPTIONS,
  addressMessages,
} from '@/config/address/address.config';
import { pincodeMessages } from '@/config/pincode/pincode.config';
import { usePincode } from '@/hooks/usePincode';
import { useToast } from '@/hooks/useToast';
import {
  useCreateUserAddress,
  useSetDefaultAddress,
  useUpdateUserAddress,
  useUserAddress,
} from '@/hooks/user';
import {
  hasAddressFormErrors,
  sanitizeNumericAddressInput,
  validateAddressForm,
  type AddressFormFieldErrors,
} from '@/lib/address/validate-address-form';
import { cn } from '@/lib/utils/cn';
import { sanitizeIndianPhoneInput, normalizeIndianPhoneDigits } from '@/lib/validators';
import type { UserAddress } from '@/types/user';

interface AddressFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function AddressField({ label, error, children }: AddressFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-normal text-[#757575]">{label}</label>
      {children}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface AddressSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  error?: string;
}

function AddressSelect({ className, placeholder, error, children, ...props }: AddressSelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-md border border-[#D6D6D6] bg-white px-3 py-2.5 text-sm font-normal text-[#151515] outline-none focus:border-[#151515]',
          !props.value && 'text-[#757575]',
          error && 'border-red-600',
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <span
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#757575]"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}

const inputClassName =
  'rounded-md border-[#D6D6D6] px-3 py-2.5 text-sm text-[#151515] focus:border-[#151515]';

interface AddressFormState {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  company: string;
  zip: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  isDefault: boolean;
}

function toFormState(address?: UserAddress): AddressFormState {
  return {
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
    addressLine1: address?.addressLine1 ?? '',
    addressLine2: address?.addressLine2 ?? '',
    company: address?.company ?? '',
    zip: address?.zip ?? '',
    phone: address?.phone ?? '',
    city: address?.city ?? '',
    province: address?.province ?? '',
    country: address?.country ?? 'India',
    isDefault: address?.isDefault ?? false,
  };
}

interface AddressFormProps {
  mode: 'create' | 'edit';
  addressId?: string;
}

interface AddressFormFieldsProps {
  mode: 'create' | 'edit';
  addressId?: string;
  initialForm: AddressFormState;
}

export function AddressFormFields({ mode, addressId, initialForm }: AddressFormFieldsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const isEditMode = mode === 'edit';
  const { createAddress, isPending: isCreating } = useCreateUserAddress();
  const { updateAddress, isPending: isUpdating } = useUpdateUserAddress();
  const { setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();
  const { validatePincode, isValidating: isValidatingPincode } = usePincode();
  const [form, setForm] = useState<AddressFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<AddressFormFieldErrors>({});

  const isPending = isCreating || isUpdating || isSettingDefault || isValidatingPincode;
  const isIndia = form.country === 'India';

  const handleChange = (field: keyof AddressFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!(field in current)) {
        return current;
      }

      const next = { ...current };
      delete next[field as keyof AddressFormFieldErrors];
      return next;
    });
  };

  const handleSubmit = async () => {
    const validationInput = {
      firstName: form.firstName,
      lastName: form.lastName,
      addressLine1: form.addressLine1,
      city: form.city,
      province: form.province,
      country: form.country,
      zip: form.zip,
      phone: form.phone,
    };

    const errors = validateAddressForm(validationInput);

    if (hasAddressFormErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    if (form.country === 'India') {
      try {
        const pincodeResult = await validatePincode(form.zip.trim());

        if (!pincodeResult.valid) {
          setFieldErrors({ zip: pincodeMessages.invalidPincode });
          return;
        }
      } catch {
        setFieldErrors({ zip: pincodeMessages.validationFailed });
        return;
      }
    }

    setFieldErrors({});

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        company: form.company.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        province: form.province.trim(),
        country: form.country,
        zip: form.zip.trim(),
        phone: normalizeIndianPhoneDigits(form.phone.trim()),
        isDefault: form.isDefault,
      };

      if (isEditMode && addressId) {
        const updated = await updateAddress(addressId, payload);
        if (form.isDefault && !updated.isDefault) {
          await setDefaultAddress(addressId);
        }
        showSuccess(addressMessages.toasts.updated);
      } else {
        const created = await createAddress(payload);
        if (form.isDefault && !created.isDefault) {
          await setDefaultAddress(created.id);
        }
        showSuccess(addressMessages.toasts.saved);
      }

      router.push(ACCOUNT_ROUTES.deliveryAddress);
    } catch {
      showError(addressMessages.toasts.saveFailed);
    }
  };

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader
        title={isEditMode ? 'Edit Address' : 'Add New Address'}
        backHref={ACCOUNT_ROUTES.deliveryAddress}
      />

      <form
        className="mt-6 space-y-5"
        aria-label={isEditMode ? 'Edit address form' : 'Add new address form'}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <AddressField label="First Name" error={fieldErrors.firstName}>
          <Input
            value={form.firstName}
            aria-label="First name"
            aria-invalid={fieldErrors.firstName ? true : undefined}
            className={cn(inputClassName, fieldErrors.firstName && 'border-red-600')}
            onChange={(event) => handleChange('firstName', event.target.value)}
          />
        </AddressField>

        <AddressField label="Last Name" error={fieldErrors.lastName}>
          <Input
            value={form.lastName}
            aria-label="Last name"
            aria-invalid={fieldErrors.lastName ? true : undefined}
            className={cn(inputClassName, fieldErrors.lastName && 'border-red-600')}
            onChange={(event) => handleChange('lastName', event.target.value)}
          />
        </AddressField>

        <AddressField label="Address line 1" error={fieldErrors.addressLine1}>
          <Input
            value={form.addressLine1}
            aria-label="Address line 1"
            aria-invalid={fieldErrors.addressLine1 ? true : undefined}
            className={cn(inputClassName, fieldErrors.addressLine1 && 'border-red-600')}
            onChange={(event) => handleChange('addressLine1', event.target.value)}
          />
        </AddressField>

        <AddressField label="Address line 2">
          <Input
            value={form.addressLine2}
            aria-label="Address line 2"
            className={inputClassName}
            onChange={(event) => handleChange('addressLine2', event.target.value)}
          />
        </AddressField>

        <AddressField label="Company Name">
          <Input
            value={form.company}
            aria-label="Company name"
            className={inputClassName}
            onChange={(event) => handleChange('company', event.target.value)}
          />
        </AddressField>

        <AddressField label="Postal/Zip Code" error={fieldErrors.zip}>
          <Input
            value={form.zip}
            inputMode="numeric"
            maxLength={6}
            aria-label="Postal or zip code"
            aria-invalid={fieldErrors.zip ? true : undefined}
            className={cn(inputClassName, fieldErrors.zip && 'border-red-600')}
            onChange={(event) =>
              handleChange('zip', sanitizeNumericAddressInput(event.target.value, 6))
            }
          />
        </AddressField>

        <AddressField label="Phone Number" error={fieldErrors.phone}>
          <Input
            type="tel"
            value={form.phone}
            inputMode="tel"
            aria-label="Phone number"
            aria-invalid={fieldErrors.phone ? true : undefined}
            className={cn(inputClassName, fieldErrors.phone && 'border-red-600')}
            onChange={(event) =>
              handleChange('phone', sanitizeIndianPhoneInput(event.target.value))
            }
          />
        </AddressField>

        <AddressField label="City" error={fieldErrors.city}>
          <Input
            value={form.city}
            aria-label="City"
            aria-invalid={fieldErrors.city ? true : undefined}
            className={cn(inputClassName, fieldErrors.city && 'border-red-600')}
            onChange={(event) => handleChange('city', event.target.value)}
          />
        </AddressField>

        <AddressField label={addressMessages.labels.state} error={fieldErrors.province}>
          {isIndia ? (
            <AddressSelect
              value={form.province}
              aria-label={addressMessages.labels.state}
              placeholder={addressMessages.labels.statePlaceholder}
              error={fieldErrors.province}
              onChange={(event) => handleChange('province', event.target.value)}
            >
              {ADDRESS_STATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AddressSelect>
          ) : (
            <Input
              value={form.province}
              aria-label={addressMessages.labels.state}
              aria-invalid={fieldErrors.province ? true : undefined}
              className={cn(inputClassName, fieldErrors.province && 'border-red-600')}
              onChange={(event) => handleChange('province', event.target.value)}
            />
          )}
        </AddressField>

        <AddressField label="Country" error={fieldErrors.country}>
          <AddressSelect
            value={form.country}
            aria-label="Country"
            placeholder="Choose from here"
            error={fieldErrors.country}
            onChange={(event) => {
              const nextCountry = event.target.value;
              setForm((current) => ({
                ...current,
                country: nextCountry,
                province: nextCountry === current.country ? current.province : '',
              }));
              setFieldErrors((current) => {
                const next = { ...current };
                delete next.country;
                delete next.province;
                return next;
              });
            }}
          >
            {ADDRESS_COUNTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AddressSelect>
        </AddressField>

        <AddressToggle
          checked={form.isDefault}
          onChange={(checked) => handleChange('isDefault', checked)}
        />

        <Button
          type="submit"
          isLoading={isPending}
          className="mt-2 h-11 w-full rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
          aria-label="Save address"
        >
          {isValidatingPincode ? pincodeMessages.validating : 'Save'}
        </Button>
      </form>
    </div>
  );
}

export function AddressForm({ mode, addressId }: AddressFormProps) {
  const isEditMode = mode === 'edit';
  const { address, isLoading, error } = useUserAddress(addressId ?? '');

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isEditMode && (error || !address)) {
    return (
      <ResourceNotFound
        title="Address not found"
        description="This address could not be loaded."
        ctaHref={ACCOUNT_ROUTES.deliveryAddress}
        ctaLabel="Back to saved addresses"
      />
    );
  }

  return (
    <AddressFormFields
      key={isEditMode ? address!.id : 'create'}
      mode={mode}
      addressId={addressId}
      initialForm={toFormState(isEditMode ? address : undefined)}
    />
  );
}
