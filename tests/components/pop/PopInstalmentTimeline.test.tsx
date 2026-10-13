import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PopInstalmentTimeline } from '@/components/pop/PopInstalmentTimeline';
import { popPlanDetailMessages } from '@/config/pop.config';
import type { PopInstalment } from '@/types/pop/subscription-detail';

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

const paidInstalment: PopInstalment = {
  id: '1',
  kind: 'paid',
  sequence: 1,
  title: 'Instalment 1',
  subtitle: 'Paid on 5 Mar 2026',
  amountLabel: '₹3,000',
  statusLabel: popPlanDetailMessages.paidStatus,
  paymentMethod: 'UPI',
};

const upcomingInstalment: PopInstalment = {
  id: '2',
  kind: 'upcoming',
  sequence: 2,
  title: 'Instalment 2',
  subtitle: 'Due on 5 May 2026',
  amountLabel: '₹3,000',
  statusLabel: '4 days left',
};

describe('PopInstalmentTimeline', () => {
  it('renders paid and upcoming instalment rows', () => {
    render(<PopInstalmentTimeline instalments={[paidInstalment, upcomingInstalment]} />);

    expect(screen.getByText('Instalment 1')).toBeInTheDocument();
    expect(screen.getByText(popPlanDetailMessages.paidStatus)).toBeInTheDocument();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('4 days left')).toBeInTheDocument();
  });

  it('opens receipt link when view receipt is clicked', async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <PopInstalmentTimeline
        instalments={[
          {
            ...paidInstalment,
            receiptUrl: 'https://receipt.example/1',
          },
        ]}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: popPlanDetailMessages.viewReceiptAriaLabel.replace('{title}', 'Instalment 1'),
      }),
    );

    expect(openSpy).toHaveBeenCalledWith('https://receipt.example/1', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
