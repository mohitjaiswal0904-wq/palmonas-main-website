'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import { popPersonalDetailsMessages } from '@/config/pop/pop-personal-details.config';
import { popTermsHref, type PopEnrollmentMethod } from '@/config/pop.config';
import { usePopUserPrefill } from '@/hooks/pop/usePopUserPrefill';
import { useStores } from '@/hooks/useStores';
import {
  validatePopPersonalDetails,
  type PopPersonalDetailsFieldErrors,
} from '@/lib/pop/validate-pop-personal-details';
import { cn } from '@/lib/utils/cn';

export type { PopEnrollmentMethod };

export interface PopPersonalDetails {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  enrollmentMethod: PopEnrollmentMethod;
  storeId: string;
  autopay: boolean;
  acceptedTerms: boolean;
}

interface PopPersonalDetailsFormProps {
  monthlyInstalment: number;
  onSubmit: (details: PopPersonalDetails) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const EMPTY_DETAILS: PopPersonalDetails = {
  name: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  pincode: '',
  enrollmentMethod: 'online',
  storeId: '',
  autopay: true,
  acceptedTerms: false,
};

const POP_STORES_QUERY = { limit: 100, images: false } as const;

const infoBoxClassName =
  'flex gap-[clamp(0.5rem,0.521vw,0.625rem)] rounded-[clamp(0.4rem,0.417vw,0.5rem)] border border-[var(--pop-icon-base)] bg-[#fff8f5] p-[clamp(0.4rem,0.417vw,0.5rem)]';

const formInputClassName =
  'h-[clamp(2.75rem,2.604vw,3.125rem)] w-full rounded-[clamp(0.3rem,0.313vw,0.375rem)] border-[0.6px] border-[#787878] bg-white px-[clamp(0.65rem,0.729vw,0.875rem)] text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[#151515] outline-none focus:border-[#151515]';

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[clamp(0.8rem,0.75vw,0.9rem)] font-normal tracking-[0.02em] text-[#313131]"
    >
      {children}
      <span className="text-[#ff3b30]" aria-hidden="true">
        *
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="text-[clamp(0.875rem,0.833vw,1rem)] text-[#ff3b30]">
      {message}
    </p>
  );
}

function FormFieldSkeleton() {
  return (
    <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
      <div className="h-[clamp(2.75rem,2.604vw,3.125rem)] w-full animate-pulse rounded-[clamp(0.3rem,0.313vw,0.375rem)] bg-stone-100" />
    </div>
  );
}

/** Loading placeholder that mirrors the personal-details form layout. */
function PopPersonalDetailsFormSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-[clamp(1.5rem,1.667vw,2rem)] rounded-[clamp(0.75rem,0.729vw,0.875rem)] bg-white p-[clamp(1.5rem,1.667vw,2rem)] shadow-[0_0.052vw_0.078vw_rgba(0,0,0,0.1),0_0.052vw_0.052vw_rgba(0,0,0,0.1)]"
      role="status"
      aria-label="Loading personal details"
      aria-busy="true"
    >
      <FormFieldSkeleton />
      <FormFieldSkeleton />
      <FormFieldSkeleton />
      <FormFieldSkeleton />
      <FormFieldSkeleton />
      <div className="tab:grid-cols-2 grid grid-cols-1 gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      <div className="h-16 w-full animate-pulse rounded-[clamp(0.4rem,0.417vw,0.5rem)] bg-stone-100" />
      <div className="h-16 w-full animate-pulse rounded-[clamp(0.4rem,0.417vw,0.5rem)] bg-stone-100" />
      <div className="h-[clamp(2.75rem,2.604vw,3.125rem)] w-full animate-pulse rounded-[clamp(0.5rem,0.521vw,0.625rem)] bg-stone-200" />
    </div>
  );
}

interface EnrollmentOptionProps {
  value: PopEnrollmentMethod;
  label: string;
  selected: boolean;
  onSelect: (value: PopEnrollmentMethod) => void;
}

function EnrollmentOption({ value, label, selected, onSelect }: EnrollmentOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-1 items-center gap-[clamp(0.55rem,0.625vw,0.75rem)] rounded-[clamp(0.5rem,0.521vw,0.625rem)] border bg-white px-[clamp(0.85rem,0.885vw,1.0625rem)] py-[clamp(0.75rem,0.833vw,1rem)] text-left text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[#151515] transition-colors',
        selected ? 'border-2 border-[#151515]' : 'border border-[#d1d5dc]',
      )}
    >
      <span
        className={cn(
          'flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-[#151515]' : 'border-[#9ca3af]',
        )}
        aria-hidden="true"
      >
        {selected ? <span className="size-2 rounded-full bg-[#151515]" /> : null}
      </span>
      {label}
    </button>
  );
}

export function PopPersonalDetailsForm({
  monthlyInstalment,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: PopPersonalDetailsFormProps) {
  const { prefill, isLoading } = usePopUserPrefill(true);
  const hasAppliedPrefill = useRef(false);
  const [values, setValues] = useState<PopPersonalDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<PopPersonalDetailsFieldErrors>({});

  const needsStore = values.enrollmentMethod === 'at_store';
  const { stores, isLoading: isStoresLoading, error: storesError } = useStores(POP_STORES_QUERY);

  // Apply API prefill once when it arrives; leave fields editable if the request fails.
  useEffect(() => {
    if (!prefill || hasAppliedPrefill.current) {
      return;
    }

    hasAppliedPrefill.current = true;
    setValues((current) => ({
      ...current,
      name: prefill.name || current.name,
      phone: prefill.phone || current.phone,
      email: prefill.email || current.email,
      addressLine1: prefill.addressLine1 || current.addressLine1,
      addressLine2: prefill.addressLine2 || current.addressLine2,
      city: prefill.city || current.city,
      pincode: prefill.pincode || current.pincode,
    }));
  }, [prefill]);

  function updateField<K extends keyof PopPersonalDetails>(key: K, value: PopPersonalDetails[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) {
        return current;
      }

      const next = { ...current };
      delete next[key as keyof PopPersonalDetailsFieldErrors];
      return next;
    });
  }

  function handleEnrollmentSelect(method: PopEnrollmentMethod) {
    setValues((current) => ({
      ...current,
      enrollmentMethod: method,
      storeId: method === 'online' ? '' : current.storeId,
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.enrollmentMethod;
      if (method === 'online') {
        delete next.storeId;
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePopPersonalDetails(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
    } catch {
      // Parent surfaces API failures via submitError / toast; keep form editable.
    }
  }

  if (isLoading) {
    return <PopPersonalDetailsFormSkeleton />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[clamp(1.5rem,1.667vw,2rem)] rounded-[clamp(0.75rem,0.729vw,0.875rem)] bg-white p-[clamp(1.5rem,1.667vw,2rem)] shadow-[0_0.052vw_0.078vw_rgba(0,0,0,0.1),0_0.052vw_0.052vw_rgba(0,0,0,0.1)]"
      noValidate
      aria-label="POP personal details"
    >
      <p className="sr-only">Monthly instalment selected: {monthlyInstalment}</p>

      <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <RequiredLabel htmlFor="pop-name">Name</RequiredLabel>
        <input
          id="pop-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'pop-name-error' : undefined}
          className={formInputClassName}
        />
        {errors.name ? <FieldError id="pop-name-error" message={errors.name} /> : null}
      </div>

      <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <RequiredLabel htmlFor="pop-phone">Phone Number</RequiredLabel>
        <input
          id="pop-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) =>
            updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))
          }
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'pop-phone-error' : undefined}
          className={formInputClassName}
        />
        {errors.phone ? <FieldError id="pop-phone-error" message={errors.phone} /> : null}
      </div>

      <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <RequiredLabel htmlFor="pop-email">Email</RequiredLabel>
        <input
          id="pop-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'pop-email-error' : undefined}
          className={formInputClassName}
        />
        {errors.email ? <FieldError id="pop-email-error" message={errors.email} /> : null}
      </div>

      <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <RequiredLabel htmlFor="pop-address-1">Address line 1</RequiredLabel>
        <input
          id="pop-address-1"
          name="addressLine1"
          autoComplete="address-line1"
          value={values.addressLine1}
          onChange={(event) => updateField('addressLine1', event.target.value)}
          aria-invalid={Boolean(errors.addressLine1)}
          aria-describedby={errors.addressLine1 ? 'pop-address-1-error' : undefined}
          className={formInputClassName}
        />
        {errors.addressLine1 ? (
          <FieldError id="pop-address-1-error" message={errors.addressLine1} />
        ) : null}
      </div>

      <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <label
          htmlFor="pop-address-2"
          className="text-[clamp(0.8rem,0.75vw,0.9rem)] font-normal tracking-[0.02em] text-[#313131]"
        >
          Address line 2
        </label>
        <input
          id="pop-address-2"
          name="addressLine2"
          autoComplete="address-line2"
          value={values.addressLine2}
          onChange={(event) => updateField('addressLine2', event.target.value)}
          className={formInputClassName}
        />
      </div>

      <div className="tab:grid-cols-2 grid grid-cols-1 gap-[clamp(0.35rem,0.417vw,0.5rem)]">
        <div className="flex flex-col gap-[clamp(0.25rem,0.313vw,0.375rem)]">
          <RequiredLabel htmlFor="pop-city">City</RequiredLabel>
          <input
            id="pop-city"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => updateField('city', event.target.value)}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? 'pop-city-error' : undefined}
            className={formInputClassName}
          />
          {errors.city ? <FieldError id="pop-city-error" message={errors.city} /> : null}
        </div>
        <div className="flex flex-col gap-[clamp(0.25rem,0.313vw,0.375rem)]">
          <RequiredLabel htmlFor="pop-pincode">Pincode</RequiredLabel>
          <input
            id="pop-pincode"
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            value={values.pincode}
            onChange={(event) =>
              updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            aria-invalid={Boolean(errors.pincode)}
            aria-describedby={errors.pincode ? 'pop-pincode-error' : undefined}
            className={formInputClassName}
          />
          {errors.pincode ? <FieldError id="pop-pincode-error" message={errors.pincode} /> : null}
        </div>
      </div>

      <fieldset className="flex flex-col gap-[clamp(0.55rem,0.625vw,0.75rem)] border-0 p-0">
        <legend className="text-[clamp(0.8rem,0.75vw,0.9rem)] font-normal tracking-[0.02em] text-[#313131]">
          How do you want to enroll
          <span className="text-[#ff3b30]" aria-hidden="true">
            *
          </span>
        </legend>
        <div
          className="mobile:flex-row flex flex-col gap-[clamp(0.55rem,0.625vw,0.75rem)]"
          role="radiogroup"
          aria-label="Enrollment method"
        >
          <EnrollmentOption
            value="online"
            label="Online"
            selected={values.enrollmentMethod === 'online'}
            onSelect={handleEnrollmentSelect}
          />
          <EnrollmentOption
            value="at_store"
            label="At Store"
            selected={values.enrollmentMethod === 'at_store'}
            onSelect={handleEnrollmentSelect}
          />
        </div>
        {errors.enrollmentMethod ? (
          <FieldError id="pop-enrollment-error" message={errors.enrollmentMethod} />
        ) : null}
      </fieldset>

      {needsStore ? (
        <div className="flex flex-col gap-[clamp(0.35rem,0.417vw,0.5rem)]">
          <RequiredLabel htmlFor="pop-store">Select Store</RequiredLabel>
          <div className="relative">
            <select
              id="pop-store"
              name="storeId"
              value={values.storeId}
              onChange={(event) => updateField('storeId', event.target.value)}
              aria-invalid={Boolean(errors.storeId)}
              aria-describedby={errors.storeId ? 'pop-store-error' : undefined}
              disabled={isStoresLoading || Boolean(storesError)}
              className={cn(formInputClassName, 'appearance-none pr-10')}
            >
              <option value="">
                {isStoresLoading
                  ? 'Loading stores...'
                  : storesError
                    ? 'Unable to load stores'
                    : 'Select Store'}
              </option>
              {stores.map((store) => (
                <option key={store.id} value={String(store.id)}>
                  {store.name}
                  {store.city ? ` — ${store.city}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#99a1af]"
              aria-hidden="true"
            />
          </div>
          {errors.storeId ? <FieldError id="pop-store-error" message={errors.storeId} /> : null}
          {storesError ? (
            <p className="text-[clamp(0.75rem,0.729vw,0.875rem)] text-[var(--pop-text-secondary)]">
              Stores could not be loaded. You can still submit after switching to Online, or try
              again later.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={infoBoxClassName}>
        <input
          id="pop-autopay"
          type="checkbox"
          checked={values.autopay}
          onChange={(event) => updateField('autopay', event.target.checked)}
          className="mt-1 size-[clamp(0.8rem,0.781vw,0.9375rem)] shrink-0 accent-[var(--pop-brand-tint)]"
          aria-label="Enable Autopay"
          aria-describedby="pop-autopay-help"
        />
        <p
          id="pop-autopay-help"
          className="text-[clamp(0.75rem,0.729vw,0.875rem)] leading-[1.36] font-normal text-[var(--pop-brand-tint)]"
        >
          When Autopay is on, we use the standard subscription setup. When off, you will receive a
          one-time payment link for manual billing (first invoice) instead.
        </p>
      </div>

      <div className={cn(infoBoxClassName, errors.acceptedTerms && 'border-[#ff3b30]')}>
        <input
          id="pop-terms"
          type="checkbox"
          checked={values.acceptedTerms}
          onChange={(event) => updateField('acceptedTerms', event.target.checked)}
          className="mt-1 size-[clamp(0.8rem,0.781vw,0.9375rem)] shrink-0 accent-[var(--pop-slider)]"
          aria-label={popPersonalDetailsMessages.a11y.termsCheckbox}
          aria-describedby={errors.acceptedTerms ? 'pop-terms-error' : 'pop-terms-help'}
        />
        <p
          id="pop-terms-help"
          className="text-[clamp(0.75rem,0.729vw,0.875rem)] leading-[1.36] font-normal text-[var(--pop-brand-tint)]"
        >
          By checking this box, I confirm that I have read, understood, and accept the{' '}
          <Link
            href={popTermsHref}
            className="font-bold text-[#151515] underline underline-offset-2"
          >
            terms & conditions
          </Link>{' '}
          of the scheme. I acknowledge the 1-month instalment discount and agree that this plan is
          non-refundable.
        </p>
      </div>
      {errors.acceptedTerms ? (
        <p
          id="pop-terms-error"
          className="-mt-4 text-[clamp(0.875rem,0.833vw,1rem)] text-[#ff3b30]"
        >
          {errors.acceptedTerms}
        </p>
      ) : null}

      {submitError ? (
        <p className="text-[clamp(0.875rem,0.833vw,1rem)] text-[#ff3b30]" role="alert">
          {submitError}
        </p>
      ) : null}

      <PopPrimaryButton
        type="submit"
        disabled={isSubmitting}
        ariaLabel={isSubmitting ? 'Creating payment setup' : 'Proceed to payment setup'}
      >
        {isSubmitting ? 'Setting up payment…' : 'Proceed to Payment Setup'}
      </PopPrimaryButton>
    </form>
  );
}
