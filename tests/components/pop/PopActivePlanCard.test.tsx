import { render, screen } from '@testing-library/react';

import { PopActivePlanCard } from '@/components/pop/PopActivePlanCard';
import { buildPopPlanDetailPath, popPlanCardMessages } from '@/config/pop.config';
import type { PopPlan } from '@/types/pop/subscription-list';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const activePlan: PopPlan = {
  id: 'plan-1',
  razorpaySubscriptionId: 'sub_RaNdOmId123',
  apiStatus: 'active',
  statusLabel: popPlanCardMessages.statusActive,
  cardKind: 'progress',
  planName: 'Saving 5+1 Plan',
  monthlyAmount: 3000,
  paidSoFar: 6000,
  totalValue: 18000,
  bonusAmount: 3000,
  redeemableAmount: 18000,
  paidCount: 2,
  totalCount: 5,
  remainingCount: 3,
};

describe('PopActivePlanCard', () => {
  it('renders plan summary and stats from Figma', () => {
    render(<PopActivePlanCard plan={activePlan} />);

    expect(screen.getByText(popPlanCardMessages.planSummary)).toBeInTheDocument();
    expect(screen.getByText('Saving 5+1 Plan')).toBeInTheDocument();
    expect(screen.getByText(popPlanCardMessages.statusActive)).toBeInTheDocument();
    expect(screen.getByText(popPlanCardMessages.monthly)).toBeInTheDocument();
    expect(screen.getByText('₹3,000')).toBeInTheDocument();
    expect(screen.getByText('₹18,000')).toBeInTheDocument();
  });

  it('links to the plan details page', () => {
    render(<PopActivePlanCard plan={activePlan} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      buildPopPlanDetailPath('sub_RaNdOmId123'),
    );
  });

  it('shows Created badge for created API status', () => {
    render(
      <PopActivePlanCard
        plan={{
          ...activePlan,
          apiStatus: 'created',
          statusLabel: popPlanCardMessages.statusCreated,
        }}
      />,
    );

    expect(screen.getByText(popPlanCardMessages.statusCreated)).toBeInTheDocument();
  });
});
