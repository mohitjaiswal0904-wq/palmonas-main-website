'use client';

import { Send, Upload } from 'lucide-react';
import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import {
  CareersSectionHeader,
  CareersSectionShell,
} from '@/components/careers/CareersSectionHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CAREERS_RESUME_ACCEPT, careersGeneralForm } from '@/config/careers.config';
import { useGeneralCareerApplication } from '@/hooks/useCareerApplication';
import { cn } from '@/lib/utils/cn';
import { generalCareerApplicationSchema } from '@/types/careers/careers.schemas';

/** General application form posted to the General Responses Apps Script. */
export function CareersGeneralApplicationForm() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submit, isSubmitting, isSuccess, error, reset } = useGeneralCareerApplication();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [website, setWebsite] = useState('');
  const [resume, setResume] = useState<File | undefined>();
  const [validationError, setValidationError] = useState<string | null>(null);

  const nameId = `${formId}-name`;
  const phoneId = `${formId}-phone`;
  const emailId = `${formId}-email`;
  const lookingId = `${formId}-looking`;
  const coverId = `${formId}-cover`;
  const resumeId = `${formId}-resume`;

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setResume(file);
    setValidationError(null);
    reset();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    reset();

    const parsed = generalCareerApplicationSchema.safeParse({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      lookingFor: lookingFor.trim(),
      coverLetter: coverLetter.trim(),
      resume,
      website,
    });

    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Please fill in all required fields.');
      return;
    }

    try {
      await submit(parsed.data);
      setName('');
      setPhone('');
      setEmail('');
      setLookingFor('');
      setCoverLetter('');
      setWebsite('');
      setResume(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      /* error surfaced via hook */
    }
  };

  const displayError = validationError ?? error?.message ?? null;

  return (
    <CareersSectionShell aria-labelledby="careers-general-heading">
      <div className="mx-auto w-full max-w-[640px]">
        <CareersSectionHeader
          badge={careersGeneralForm.badge}
          heading={careersGeneralForm.heading}
          description={careersGeneralForm.description}
          headingId="careers-general-heading"
          descriptionClassName="mb-4"
        />

        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />

          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className="font-nunito-sans text-sm font-medium text-[#101828]">
              Name<span className="text-[#5c2c2c]">*</span>
            </label>
            <Input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 rounded-lg border-[#e8e8e8] bg-white px-4 text-sm"
              aria-required="true"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={phoneId}
              className="font-nunito-sans text-sm font-medium text-[#101828]"
            >
              Phone Number<span className="text-[#5c2c2c]">*</span>
            </label>
            <Input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-12 rounded-lg border-[#e8e8e8] bg-white px-4 text-sm"
              aria-required="true"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={emailId}
              className="font-nunito-sans text-sm font-medium text-[#101828]"
            >
              Email<span className="text-[#5c2c2c]">*</span>
            </label>
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-lg border-[#e8e8e8] bg-white px-4 text-sm"
              aria-required="true"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={lookingId}
              className="font-nunito-sans text-sm font-medium text-[#101828]"
            >
              What Are You Looking For?
            </label>
            <Textarea
              id={lookingId}
              name="looking_for"
              rows={4}
              value={lookingFor}
              onChange={(event) => setLookingFor(event.target.value)}
              className="min-h-[120px] rounded-lg border-[#e8e8e8] bg-white px-4 py-3 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={coverId}
              className="font-nunito-sans text-sm font-medium text-[#101828]"
            >
              Cover Letter
            </label>
            <Textarea
              id={coverId}
              name="cover_letter"
              rows={4}
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              className="min-h-[120px] rounded-lg border-[#e8e8e8] bg-white px-4 py-3 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="font-nunito-sans text-sm font-medium text-[#101828]"
              id={`${resumeId}-label`}
            >
              Resume
            </span>
            <label
              htmlFor={resumeId}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#d4c8c2] bg-[#faf7f5] px-4 py-5 text-center transition-colors hover:bg-[#f5f0ed]',
              )}
            >
              <Upload className="size-8 text-[#8a7a72]" aria-hidden="true" />
              <span className="font-nunito-sans text-sm font-medium text-[#101828]">
                Click to upload resume
              </span>
              <span className="font-nunito-sans text-xs text-[#6b7280]">
                PDF, DOC, DOCX (Max 5MB)
              </span>
              {resume ? (
                <span className="font-nunito-sans text-xs font-medium text-[#5c2c2c]">
                  {resume.name}
                </span>
              ) : null}
              <input
                ref={fileInputRef}
                id={resumeId}
                name="resume"
                type="file"
                accept={CAREERS_RESUME_ACCEPT}
                className="sr-only"
                aria-labelledby={`${resumeId}-label`}
                onChange={handleResumeChange}
              />
            </label>
          </div>

          {isSuccess ? (
            <p className="font-nunito-sans text-sm text-green-700" role="status">
              {careersGeneralForm.successMessage}
            </p>
          ) : null}

          {displayError ? (
            <p className="font-nunito-sans text-sm text-red-600" role="alert">
              {displayError}
            </p>
          ) : null}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="mt-2 h-auto w-full gap-3 rounded-lg bg-black px-5 py-4 text-base font-semibold text-white hover:bg-black/90"
            aria-label="Submit general application"
          >
            <Send className="size-5" aria-hidden="true" />
            Submit Application
          </Button>
        </form>
      </div>
    </CareersSectionShell>
  );
}
