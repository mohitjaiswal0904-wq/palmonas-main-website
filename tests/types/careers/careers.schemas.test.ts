import {
  generalCareerApplicationSchema,
  jobCareerApplicationSchema,
} from '@/types/careers/careers.schemas';

function makeResume(name = 'resume.pdf', size = 1024): File {
  return new File(['resume-content'], name, { type: 'application/pdf' });
}

describe('careers.schemas', () => {
  it('accepts a valid general application', () => {
    const result = generalCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'ada@example.com',
      lookingFor: 'Product design',
      coverLetter: 'I love jewellery.',
      resume: makeResume(),
      website: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a general application with an invalid email', () => {
    const result = generalCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'not-an-email',
      lookingFor: '',
      coverLetter: '',
      website: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects oversized resume files', () => {
    const huge = new File([new Uint8Array(6 * 1024 * 1024)], 'huge.pdf', {
      type: 'application/pdf',
    });

    const result = generalCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'ada@example.com',
      resume: huge,
      website: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/5MB/i);
    }
  });

  it('accepts a valid job application with LinkedIn URL', () => {
    const result = jobCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'ada@example.com',
      linkedin: 'https://www.linkedin.com/in/ada',
      resume: makeResume(),
      website: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a job application without LinkedIn', () => {
    const result = jobCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'ada@example.com',
      linkedin: '',
      website: '',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes LinkedIn URLs missing a protocol', () => {
    const result = jobCareerApplicationSchema.safeParse({
      name: 'Ada Lovelace',
      phone: '+91 98765 43210',
      email: 'ada@example.com',
      linkedin: 'linkedin.com/in/ada',
      website: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linkedin).toBe('https://linkedin.com/in/ada');
    }
  });
});
