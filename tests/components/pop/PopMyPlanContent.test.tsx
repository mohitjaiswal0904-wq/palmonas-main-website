import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { PopMyPlanContent } from '@/components/pop/PopMyPlanContent';
import { popActivePlanMessages } from '@/config/pop.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { listPopSubscriptions } from '@/services/pop.service';

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/services/pop.service', () => ({
  listPopSubscriptions: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockList = listPopSubscriptions as jest.MockedFunction<typeof listPopSubscriptions>;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('PopMyPlanContent', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);
  });

  it('renders active plan cards from API', async () => {
    mockList.mockResolvedValue({
      plans: [
        {
          id: 'plan-1',
          razorpaySubscriptionId: 'sub_active123',
          apiStatus: 'active',
          statusLabel: 'Active',
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
        },
      ],
      total: 1,
    });

    render(<PopMyPlanContent />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Saving 5+1 Plan')).toBeInTheDocument();
    });
  });

  it('renders empty state when no plans returned', async () => {
    mockList.mockResolvedValue({ plans: [], total: 0 });

    render(<PopMyPlanContent />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(popActivePlanMessages.emptyTitle)).toBeInTheDocument();
    });
  });
});
