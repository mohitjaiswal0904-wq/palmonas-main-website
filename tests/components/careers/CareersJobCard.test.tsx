import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CareersJobCard } from '@/components/careers/CareersJobCard';
import type { CareerJobOpening } from '@/config/careers.config';

const openJob: CareerJobOpening = {
  id: 'software-developer',
  jobId: '1',
  title: 'Software Developer Engineer',
  applicationTitle: 'SOFTWARE DEVELOPMENT ENGINEER',
  department: 'Tech',
  location: 'PUNE, IND',
  employmentType: 'Full-time',
  isOpen: true,
  about: 'About',
  responsibilities: ['Build APIs'],
  requirements: ['Node.js'],
  niceToHave: [],
};

const closedJob: CareerJobOpening = {
  ...openJob,
  id: 'assistant-store-manager',
  title: 'Assistant Store manager/Store manager',
  isOpen: false,
  jobId: '',
};

describe('CareersJobCard', () => {
  it('renders job title, department, and location', () => {
    render(<CareersJobCard job={openJob} onSelect={jest.fn()} />);

    expect(screen.getByText('Software Developer Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('PUNE, IND')).toBeInTheDocument();
  });

  it('calls onSelect when the open job CTA is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<CareersJobCard job={openJob} onSelect={onSelect} />);

    await user.click(
      screen.getByRole('button', { name: /View and apply for Software Developer Engineer/i }),
    );

    expect(onSelect).toHaveBeenCalledWith(openJob);
  });

  it('disables the CTA for closed openings', () => {
    render(<CareersJobCard job={closedJob} onSelect={jest.fn()} />);

    expect(
      screen.getByRole('button', {
        name: /Assistant Store manager\/Store manager application is not available yet/i,
      }),
    ).toBeDisabled();
  });

  it('does not call onSelect for closed openings', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<CareersJobCard job={closedJob} onSelect={onSelect} />);

    await user.click(
      screen.getByRole('button', {
        name: /Assistant Store manager\/Store manager application is not available yet/i,
      }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });
});
