import {
  buildJobDescriptionText,
  careerJobOpenings,
  careersStats,
} from '@/config/careers.config';

describe('careers.config', () => {
  it('includes the three about stats from the careers design', () => {
    expect(careersStats).toHaveLength(3);
    expect(careersStats.map((stat) => stat.label)).toEqual([
      'Talented Team',
      'Offline Stores',
      'Customer',
    ]);
  });

  it('builds a job description that includes title sections for open roles', () => {
    const job = careerJobOpenings.find((opening) => opening.id === 'software-developer');
    expect(job).toBeDefined();
    const description = buildJobDescriptionText(job!);
    expect(description).toContain('About the role');
    expect(description).toContain('Responsibilities');
    expect(description).toContain('Requirements');
  });

  it('includes assistant store manager JD from the live careers page', () => {
    const job = careerJobOpenings.find((opening) => opening.id === 'assistant-store-manager');
    expect(job?.isOpen).toBe(true);
    expect(job?.jobId).toBe('2');
    const description = buildJobDescriptionText(job!);
    expect(description).toContain('About the role');
    expect(description).toContain('Store Supervisor');
  });

  it('lists seven open positions matching the careers page', () => {
    expect(careerJobOpenings).toHaveLength(7);
    expect(careerJobOpenings.every((job) => job.title.length > 0)).toBe(true);
  });
});
