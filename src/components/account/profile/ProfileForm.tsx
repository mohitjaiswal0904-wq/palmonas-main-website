'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { useUpdateUserProfile, useUserProfile, useUserWallet } from '@/hooks/user';
import {
  hasProfileFormErrors,
  validateProfileForm,
  type ProfileFormFieldErrors,
} from '@/lib/account/validate-profile-form';
import { cn } from '@/lib/utils/cn';
import { normalizeIndianPhoneDigits, sanitizeIndianPhoneInput } from '@/lib/validators';
import { useAccountShellNav } from '@/providers/account/AccountShellNavProvider';

interface ProfileFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

function ProfileField({ label, error, children, className }: ProfileFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
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

interface ProfileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

function ProfileSelect({
  className,
  placeholder,
  children,
  disabled,
  ...props
}: ProfileSelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-md border border-[#D6D6D6] bg-white px-3 py-2.5 text-sm font-normal text-[#151515] outline-none focus:border-[#151515] disabled:cursor-not-allowed disabled:bg-[#EFEFEF]',
          !props.value && 'text-[#757575]',
          className,
        )}
        disabled={disabled}
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

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, index) =>
  String(new Date().getFullYear() - index),
);
const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'];

const inputClassName =
  'rounded-md border-[#D6D6D6] px-3 py-2.5 text-sm text-[#151515] focus:border-[#151515] disabled:bg-[#EFEFEF]';

function parseBirthdate(value: string): { day: string; month: string; year: string } {
  if (!value) {
    return { day: '', month: '', year: '' };
  }

  const [year, month, day] = value.split('-');
  const monthIndex = Number(month) - 1;
  const monthLabel = MONTH_OPTIONS[monthIndex] ?? '';

  return {
    day: day ? String(Number(day)) : '',
    month: monthLabel,
    year: year ?? '',
  };
}

export function ProfileForm() {
  const { profile, isLoading, error } = useUserProfile();
  const { wallet } = useUserWallet();
  const { updateProfile, isPending } = useUpdateUserProfile();
  const shellNav = useAccountShellNav();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProfileFormFieldErrors>({});

  const birthdateParts = useMemo(
    () => parseBirthdate(wallet?.birthdate ?? ''),
    [wallet?.birthdate],
  );

  const resetDraftFromProfile = () => {
    if (!profile) {
      return;
    }

    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(normalizeIndianPhoneDigits(profile.phone));
    setDay(birthdateParts.day);
    setMonth(birthdateParts.month);
    setYear(birthdateParts.year);
    setGender(wallet?.gender ?? '');
    setFieldErrors({});
  };

  const handleFieldChange = (field: keyof ProfileFormFieldErrors, value: string) => {
    if (field === 'firstName') {
      setFirstName(value);
    } else if (field === 'lastName') {
      setLastName(value);
    } else {
      setPhone(value);
    }

    setFieldErrors((current) => {
      if (!(field in current)) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    const errors = validateProfileForm({ firstName, lastName, phone });

    if (hasProfileFormErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizeIndianPhoneDigits(phone.trim()),
    });
    setIsEditing(false);
    shellNav?.closeToHub();
  };

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  if (error || !profile) {
    return (
      <ResourceNotFound
        title="Unable to load profile"
        description="Please sign in and try again."
        ctaHref="/account"
        ctaLabel="Back to account"
      />
    );
  }

  const fieldDisabled = !isEditing;
  const displayFirstName = isEditing ? firstName : profile.firstName;
  const displayLastName = isEditing ? lastName : profile.lastName;
  const displayPhone = isEditing ? phone : profile.phone;
  const displayDay = isEditing ? day : birthdateParts.day;
  const displayMonth = isEditing ? month : birthdateParts.month;
  const displayYear = isEditing ? year : birthdateParts.year;
  const displayGender = isEditing ? gender : (wallet?.gender ?? '');

  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title="Profile" />

      <form className="mt-6 space-y-5" aria-label="Profile form">
        <ProfileField label="First Name" error={fieldErrors.firstName}>
          <Input
            type="text"
            value={displayFirstName}
            disabled={fieldDisabled}
            aria-label="First name"
            aria-invalid={fieldErrors.firstName ? true : undefined}
            className={cn(inputClassName, fieldErrors.firstName && 'border-red-600')}
            onChange={(event) => handleFieldChange('firstName', event.target.value)}
          />
        </ProfileField>

        <ProfileField label="Last Name" error={fieldErrors.lastName}>
          <Input
            type="text"
            value={displayLastName}
            disabled={fieldDisabled}
            aria-label="Last name"
            aria-invalid={fieldErrors.lastName ? true : undefined}
            className={cn(inputClassName, fieldErrors.lastName && 'border-red-600')}
            onChange={(event) => handleFieldChange('lastName', event.target.value)}
          />
        </ProfileField>

        <ProfileField label="Phone Number" error={fieldErrors.phone}>
          <Input
            type="tel"
            inputMode="tel"
            value={displayPhone}
            disabled={fieldDisabled}
            aria-label="Phone number"
            aria-invalid={fieldErrors.phone ? true : undefined}
            className={cn(inputClassName, fieldErrors.phone && 'border-red-600')}
            onChange={(event) =>
              handleFieldChange('phone', sanitizeIndianPhoneInput(event.target.value))
            }
          />
        </ProfileField>

        <ProfileField label="Email Address">
          <Input
            type="email"
            value={profile.email}
            disabled
            aria-label="Email address"
            className="cursor-not-allowed rounded-md border-[#D6D6D6] bg-[#EFEFEF] px-3 py-2.5 text-sm text-[#151515]"
          />
        </ProfileField>

        <ProfileField label="DOB">
          <div className="grid grid-cols-3 gap-3">
            <ProfileSelect
              value={displayDay}
              disabled={fieldDisabled}
              aria-label="Day of birth"
              placeholder="Day"
              onChange={(event) => setDay(event.target.value)}
            >
              {DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </ProfileSelect>
            <ProfileSelect
              value={displayMonth}
              disabled={fieldDisabled}
              aria-label="Month of birth"
              placeholder="Month"
              onChange={(event) => setMonth(event.target.value)}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </ProfileSelect>
            <ProfileSelect
              value={displayYear}
              disabled={fieldDisabled}
              aria-label="Year of birth"
              placeholder="Year"
              onChange={(event) => setYear(event.target.value)}
            >
              {YEAR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </ProfileSelect>
          </div>
        </ProfileField>

        <ProfileField label="Gender">
          <ProfileSelect
            value={displayGender}
            disabled={fieldDisabled}
            aria-label="Gender"
            placeholder="Choose from here"
            onChange={(event) => setGender(event.target.value)}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </ProfileSelect>
        </ProfileField>

        <Button
          type="button"
          isLoading={isPending}
          className="mt-2 h-11 w-full rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
          aria-label={isEditing ? 'Save profile' : 'Edit profile'}
          onClick={() => {
            if (isEditing) {
              void handleSave();
              return;
            }

            resetDraftFromProfile();
            setFieldErrors({});
            setIsEditing(true);
          }}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </form>
    </div>
  );
}
