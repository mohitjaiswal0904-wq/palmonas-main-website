import { z } from 'zod';

import { CAREERS_RESUME_MAX_BYTES } from '@/config/careers.config';
import { emailValidator, nonEmptyStringValidator } from '@/lib/validators';

const phoneValidator = z
  .string()
  .trim()
  .min(8, 'Enter a valid phone number')
  .max(20, 'Enter a valid phone number')
  .regex(/^[\d+\-\s()]+$/, 'Enter a valid phone number');

const optionalText = z.string().trim().optional().default('');

const resumeFileSchema = z
  .custom<File>((value) => typeof File !== 'undefined' && value instanceof File, {
    message: 'Upload a resume file',
  })
  .refine((file) => file.size <= CAREERS_RESUME_MAX_BYTES, {
    message: 'Resume must be 5MB or smaller',
  })
  .refine(
    (file) => {
      const name = file.name.toLowerCase();
      return name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx');
    },
    { message: 'Resume must be a PDF, DOC, or DOCX file' },
  );

export const generalCareerApplicationSchema = z.object({
  name: nonEmptyStringValidator,
  phone: phoneValidator,
  email: emailValidator,
  lookingFor: optionalText,
  coverLetter: optionalText,
  resume: resumeFileSchema.optional(),
  /** Honeypot — ignored by the service when non-empty. */
  website: z.string().optional().default(''),
});

const linkedinValidator = z
  .string()
  .trim()
  .min(1, 'Enter a valid LinkedIn URL')
  .transform((value) => (value.startsWith('http') ? value : `https://${value}`))
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.hostname.includes('linkedin.com');
    } catch {
      return false;
    }
  }, 'Enter a valid LinkedIn URL');

export const jobCareerApplicationSchema = z.object({
  name: nonEmptyStringValidator,
  phone: phoneValidator,
  email: emailValidator,
  linkedin: linkedinValidator,
  resume: resumeFileSchema.optional(),
  /** Honeypot — ignored by the service when non-empty. */
  website: z.string().optional().default(''),
});

export type GeneralCareerApplicationInput = z.infer<typeof generalCareerApplicationSchema>;
export type JobCareerApplicationInput = z.infer<typeof jobCareerApplicationSchema>;

export interface CareerResumeAttachment {
  resumeBase64: string;
  resumeFilename: string;
  resumeMime: string;
}

export interface GeneralCareerApplicationPayload extends CareerResumeAttachment {
  name: string;
  phone: string;
  email: string;
  lookingFor: string;
  coverLetter: string;
}

export interface JobCareerApplicationPayload extends CareerResumeAttachment {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}
