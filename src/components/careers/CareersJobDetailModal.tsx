'use client';

import { Send, Upload, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  buildJobDescriptionText,
  CAREERS_RESUME_ACCEPT,
  type CareerJobOpening,
} from '@/config/careers.config';
import { useJobCareerApplication } from '@/hooks/useCareerApplication';
import { cn } from '@/lib/utils/cn';
import { jobCareerApplicationSchema } from '@/types/careers/careers.schemas';

interface CareersJobDetailModalProps {
  job: CareerJobOpening;
  onClose: () => void;
}

type ModalView = 'details' | 'apply' | 'success';

/**
 * Job detail drawer/modal with apply form for a specific opening.
 *
 * Remount with `key={job.id}` from the parent so form state resets per opening.
 *
 * @param job - Selected opening.
 * @param onClose - Closes the modal and clears selection.
 */
export function CareersJobDetailModal({ job, onClose }: CareersJobDetailModalProps) {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submit, isSubmitting, error, reset } = useJobCareerApplication();
  const [view, setView] = useState<ModalView>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [resume, setResume] = useState<File | undefined>();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Lock body scroll and close on Escape while the job modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  const nameId = `${formId}-name`;
  const phoneId = `${formId}-phone`;
  const emailId = `${formId}-email`;
  const linkedinId = `${formId}-linkedin`;
  const resumeId = `${formId}-resume`;
  const displayError = validationError ?? error?.message ?? null;

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setResume(event.target.files?.[0]);
    setValidationError(null);
  };

  const handleApplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    reset();

    const parsed = jobCareerApplicationSchema.safeParse({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      linkedin: linkedin.trim(),
      resume,
      website,
    });

    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Please complete all required fields.');
      return;
    }

    try {
      await submit({
        jobId: job.jobId,
        jobTitle: job.applicationTitle,
        jobDescription: buildJobDescriptionText(job),
        application: parsed.data,
      });
      setView('success');
    } catch {
      /* error surfaced via hook */
    }
  };

  return createPortal(
    <div className="z-modal-backdrop tab:items-center tab:p-4 fixed inset-0 flex items-end justify-center p-0">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close job details"
        onClick={onClose}
      />

      <Modal
        className="z-modal tab:rounded-2xl relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl p-0"
        aria-labelledby="careers-job-modal-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e8e8] bg-white px-5 py-4">
          <h2
            id="careers-job-modal-title"
            className="font-nunito-sans pr-4 text-lg leading-normal font-[510] tracking-[-0.898px] text-[#101828]"
          >
            {view === 'success'
              ? 'Application Submitted Successfully'
              : view === 'apply'
                ? `Apply for ${job.applicationTitle}`
                : job.title}
          </h2>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md text-[#3d2c24] transition-colors hover:bg-[#f5f0ed]"
            aria-label="Close job details"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {view === 'details' ? (
          <div className="space-y-4 px-5 py-4">
            <div className="flex flex-wrap gap-2 text-sm text-[#6b5b52]">
              <span className="rounded-full bg-[#ece2df] px-3 py-1">{job.department}</span>
              <span className="rounded-full bg-[#ece2df] px-3 py-1">{job.location}</span>
              <span className="rounded-full bg-[#ece2df] px-3 py-1">{job.employmentType}</span>
            </div>

            {job.about ? (
              <section>
                <h3 className="font-nunito-sans mb-2 text-lg font-bold text-[#101828]">
                  About the role
                </h3>
                <p className="font-nunito-sans text-sm leading-relaxed text-[#4a5565]">
                  {job.about}
                </p>
              </section>
            ) : null}

            {job.responsibilities.length > 0 ? (
              <section>
                <h3 className="font-nunito-sans mb-2 text-lg font-bold text-[#101828]">
                  Responsibilities
                </h3>
                <ul className="font-nunito-sans list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#4a5565]">
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {job.requirements.length > 0 ? (
              <section>
                <h3 className="font-nunito-sans mb-2 text-lg font-bold text-[#101828]">
                  Requirements
                </h3>
                <ul className="font-nunito-sans list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#4a5565]">
                  {job.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {job.niceToHave.length > 0 ? (
              <section>
                <h3 className="font-nunito-sans mb-2 text-lg font-bold text-[#101828]">
                  Nice to Have
                </h3>
                <ul className="font-nunito-sans list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#4a5565]">
                  {job.niceToHave.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <Button
              type="button"
              className="h-auto w-full rounded-lg bg-black px-5 py-4 text-base font-semibold text-white hover:bg-black/90"
              aria-label={`Apply for ${job.title}`}
              onClick={() => setView('apply')}
            >
              Apply for this Position
            </Button>
          </div>
        ) : null}

        {view === 'apply' ? (
          <form className="flex flex-col gap-3 px-5 py-4" onSubmit={handleApplySubmit} noValidate>
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
              <label
                htmlFor={nameId}
                className="font-nunito-sans text-sm font-medium text-[#101828]"
              >
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
                className="h-12 rounded-lg border-[#e8e8e8] px-4 text-sm"
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
                className="h-12 rounded-lg border-[#e8e8e8] px-4 text-sm"
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
                className="h-12 rounded-lg border-[#e8e8e8] px-4 text-sm"
                aria-required="true"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={linkedinId}
                className="font-nunito-sans text-sm font-medium text-[#101828]"
              >
                LinkedIn Profile<span className="text-[#5c2c2c]">*</span>
              </label>
              <Input
                id={linkedinId}
                name="linkedin"
                type="url"
                autoComplete="url"
                required
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                className="h-12 rounded-lg border-[#e8e8e8] px-4 text-sm"
                aria-required="true"
                placeholder="https://linkedin.com/in/..."
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

            {displayError ? (
              <p className="font-nunito-sans text-sm text-red-600" role="alert">
                {displayError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-auto w-full gap-3 rounded-lg bg-black px-5 py-4 text-base font-semibold text-white hover:bg-black/90"
              aria-label={
                isSubmitting
                  ? `Submitting application for ${job.title}`
                  : `Submit application for ${job.title}`
              }
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span
                  className="size-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <Send className="size-5" aria-hidden="true" />
              )}
              {isSubmitting ? 'Submitting…' : 'Submit Application'}
            </Button>
          </form>
        ) : null}

        {view === 'success' ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <p className="font-nunito-sans text-sm leading-relaxed text-[#4a5565]">
              You have successfully applied for the {job.applicationTitle} position. Our team will
              review your resume and update you accordingly.
            </p>
            <Button
              type="button"
              className="h-auto rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90"
              aria-label="Close success message"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>,
    document.body,
  );
}
