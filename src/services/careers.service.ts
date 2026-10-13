import { postToGoogleAppsScript, readFileAsBase64 } from '@/lib/careers/google-apps-script';
import { getCareersGeneralScriptUrl, getCareersJobScriptUrl } from '@/lib/env';
import { AppError, normaliseError } from '@/lib/errors';
import type {
  GeneralCareerApplicationInput,
  JobCareerApplicationInput,
} from '@/types/careers/careers.schemas';

interface SubmitJobApplicationParams {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  application: JobCareerApplicationInput;
}

/**
 * Submits a general careers application to the General Responses Apps Script.
 *
 * @param application - Validated general application fields.
 * @throws {AppError} When honeypot is filled or the submission fails.
 */
export async function submitGeneralCareerApplication(
  application: GeneralCareerApplicationInput,
): Promise<void> {
  try {
    if (application.website) {
      return;
    }

    const fields: Record<string, string> = {
      name: application.name,
      phone: application.phone,
      email: application.email,
      looking_for: application.lookingFor ?? '',
      cover_letter: application.coverLetter ?? '',
    };

    if (application.resume) {
      const { base64, mime } = await readFileAsBase64(application.resume);
      fields.resume_base64 = base64;
      fields.resume_filename = application.resume.name;
      fields.resume_mime = mime;
    }

    await postToGoogleAppsScript(getCareersGeneralScriptUrl(), fields);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Submits a job-specific application (title + description) to the Job Applications Apps Script.
 *
 * @param params - Job metadata and validated applicant fields.
 * @throws {AppError} When honeypot is filled, job metadata is missing, or submission fails.
 */
export async function submitJobCareerApplication(
  params: SubmitJobApplicationParams,
): Promise<void> {
  try {
    const { application, jobId, jobTitle, jobDescription } = params;

    if (application.website) {
      return;
    }

    if (!jobId || !jobTitle) {
      throw new AppError('VALIDATION', 'Job details are missing for this application');
    }

    const fields: Record<string, string> = {
      job_id: jobId,
      job_title: jobTitle,
      job_description: jobDescription,
      name: application.name,
      phone: application.phone,
      email: application.email,
      linkedin: application.linkedin,
    };

    if (application.resume) {
      const { base64, mime } = await readFileAsBase64(application.resume);
      fields.resume_base64 = base64;
      fields.resume_filename = application.resume.name;
      fields.resume_mime = mime;
    }

    await postToGoogleAppsScript(getCareersJobScriptUrl(), fields);
  } catch (err) {
    throw normaliseError(err);
  }
}
