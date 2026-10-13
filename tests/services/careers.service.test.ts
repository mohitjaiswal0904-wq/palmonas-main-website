import {
  postToGoogleAppsScript,
  readFileAsBase64,
} from '@/lib/careers/google-apps-script';
import { getCareersGeneralScriptUrl, getCareersJobScriptUrl } from '@/lib/env';
import { AppError } from '@/lib/errors';
import {
  submitGeneralCareerApplication,
  submitJobCareerApplication,
} from '@/services/careers.service';

jest.mock('@/lib/careers/google-apps-script', () => ({
  postToGoogleAppsScript: jest.fn().mockResolvedValue(undefined),
  readFileAsBase64: jest.fn().mockResolvedValue({
    base64: 'YmFzZTY0',
    mime: 'application/pdf',
  }),
}));

const mockedPost = postToGoogleAppsScript as jest.MockedFunction<typeof postToGoogleAppsScript>;
const mockedRead = readFileAsBase64 as jest.MockedFunction<typeof readFileAsBase64>;

describe('careers.service', () => {
  beforeEach(() => {
    mockedPost.mockClear();
    mockedRead.mockClear();
  });

  it('posts general application fields to the general endpoint', async () => {
    await submitGeneralCareerApplication({
      name: 'Ada',
      phone: '9876543210',
      email: 'ada@example.com',
      lookingFor: 'Design',
      coverLetter: 'Hello',
      website: '',
    });

    expect(mockedPost).toHaveBeenCalledWith(
      getCareersGeneralScriptUrl(),
      expect.objectContaining({
        name: 'Ada',
        phone: '9876543210',
        email: 'ada@example.com',
        looking_for: 'Design',
        cover_letter: 'Hello',
      }),
    );
  });

  it('silently ignores honeypot-filled general submissions', async () => {
    await submitGeneralCareerApplication({
      name: 'Bot',
      phone: '9876543210',
      email: 'bot@example.com',
      lookingFor: '',
      coverLetter: '',
      website: 'http://spam.test',
    });

    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('includes resume base64 fields when a resume is provided', async () => {
    const resume = new File(['pdf'], 'cv.pdf', { type: 'application/pdf' });

    await submitGeneralCareerApplication({
      name: 'Ada',
      phone: '9876543210',
      email: 'ada@example.com',
      lookingFor: '',
      coverLetter: '',
      resume,
      website: '',
    });

    expect(mockedRead).toHaveBeenCalledWith(resume);
    expect(mockedPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        resume_base64: 'YmFzZTY0',
        resume_filename: 'cv.pdf',
        resume_mime: 'application/pdf',
      }),
    );
  });

  it('posts job applications with title and description', async () => {
    await submitJobCareerApplication({
      jobId: '1',
      jobTitle: 'SOFTWARE DEVELOPMENT ENGINEER',
      jobDescription: 'About the role\nBuild APIs',
      application: {
        name: 'Ada',
        phone: '9876543210',
        email: 'ada@example.com',
        linkedin: 'https://linkedin.com/in/ada',
        website: '',
      },
    });

    expect(mockedPost).toHaveBeenCalledWith(
      getCareersJobScriptUrl(),
      expect.objectContaining({
        job_id: '1',
        job_title: 'SOFTWARE DEVELOPMENT ENGINEER',
        job_description: 'About the role\nBuild APIs',
        linkedin: 'https://linkedin.com/in/ada',
      }),
    );
  });

  it('throws when job metadata is missing', async () => {
    await expect(
      submitJobCareerApplication({
        jobId: '',
        jobTitle: '',
        jobDescription: '',
        application: {
          name: 'Ada',
          phone: '9876543210',
          email: 'ada@example.com',
          linkedin: 'https://linkedin.com/in/ada',
          website: '',
        },
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('normalises unexpected errors from the Apps Script helper', async () => {
    mockedPost.mockRejectedValueOnce(new Error('network down'));

    await expect(
      submitGeneralCareerApplication({
        name: 'Ada',
        phone: '9876543210',
        email: 'ada@example.com',
        lookingFor: '',
        coverLetter: '',
        website: '',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
