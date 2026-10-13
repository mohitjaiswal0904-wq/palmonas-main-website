import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { CareersGeneralApplicationForm } from '@/components/careers/CareersGeneralApplicationForm';
import { AppError } from '@/lib/errors';
import { submitGeneralCareerApplication } from '@/services/careers.service';

jest.mock('@/services/careers.service', () => ({
  submitGeneralCareerApplication: jest.fn().mockResolvedValue(undefined),
  submitJobCareerApplication: jest.fn(),
}));

const mockedSubmit = submitGeneralCareerApplication as jest.MockedFunction<
  typeof submitGeneralCareerApplication
>;

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(<CareersGeneralApplicationForm />, { wrapper });
}

describe('CareersGeneralApplicationForm', () => {
  beforeEach(() => {
    mockedSubmit.mockReset();
    mockedSubmit.mockResolvedValue(undefined);
  });

  it('renders the general application heading and fields', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: /Don't See Your Role/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /Submit general application/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid general application', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
    await user.type(screen.getByLabelText(/^Email/i), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /Submit general application/i }));

    await waitFor(() => expect(mockedSubmit).toHaveBeenCalled());
    expect(await screen.findByRole('status')).toHaveTextContent(/application was submitted/i);
  });

  it('shows an error message when submission fails', async () => {
    mockedSubmit.mockRejectedValueOnce(
      new AppError('NETWORK', 'Network error — check your connection'),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
    await user.type(screen.getByLabelText(/^Email/i), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /Submit general application/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Network error/i);
  });
});
