import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PopRedeemablePlanCard } from '@/components/pop/PopRedeemablePlanCard';
import { popPlanCardMessages } from '@/config/pop.config';
import type { PopPlan } from '@/types/pop/subscription-list';

const redeemablePlan: PopPlan = {
  id: 'plan-2',
  razorpaySubscriptionId: 'sub_redeemable456',
  apiStatus: 'completed',
  statusLabel: popPlanCardMessages.statusRedeemable,
  cardKind: 'redeemable',
  planName: 'Saving 5+1 Plan',
  monthlyAmount: 3000,
  paidSoFar: 15000,
  totalValue: 18000,
  bonusAmount: 3000,
  redeemableAmount: 18000,
  paidCount: 5,
  totalCount: 5,
  remainingCount: 0,
};

describe('PopRedeemablePlanCard', () => {
  it('renders congratulations block and redeem CTA', () => {
    render(<PopRedeemablePlanCard plan={redeemablePlan} />);

    expect(screen.getByText(popPlanCardMessages.congratulations)).toBeInTheDocument();
    expect(screen.getByText(popPlanCardMessages.readyToRedeem)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: popPlanCardMessages.redeemAriaLabel })).toBeInTheDocument();
  });

  it('calls onRedeem when redeem is clicked', async () => {
    const user = userEvent.setup();
    const onRedeem = jest.fn();

    render(<PopRedeemablePlanCard plan={redeemablePlan} onRedeem={onRedeem} />);

    await user.click(screen.getByRole('button', { name: popPlanCardMessages.redeemAriaLabel }));

    expect(onRedeem).toHaveBeenCalledWith('plan-2');
  });
});
