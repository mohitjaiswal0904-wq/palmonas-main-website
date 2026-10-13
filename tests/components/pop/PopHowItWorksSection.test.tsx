import { render, screen, within } from '@testing-library/react';

import { PopHowItWorksSection } from '@/components/pop/PopMarketingSections';
import { popHowItWorksSteps } from '@/config/pop.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} {...props} />
  ),
}));

describe('PopHowItWorksSection', () => {
  it('renders the section heading and all desktop step titles', () => {
    render(<PopHowItWorksSection />);

    expect(screen.getByRole('heading', { level: 2, name: 'How It Works' })).toBeInTheDocument();
    expect(screen.getByText('Simple steps to start your savings journey')).toBeInTheDocument();

    for (const step of popHowItWorksSteps) {
      expect(screen.getAllByText(step.title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(step.description).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('exposes a labelled mobile timeline with four steps', () => {
    render(<PopHowItWorksSection />);

    const timeline = screen.getByRole('list', { name: 'How it works steps' });
    expect(timeline).toBeInTheDocument();
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(4);
  });

  it('uses the mobile title for the redeem step when provided', () => {
    render(<PopHowItWorksSection />);

    const redeemStep = popHowItWorksSteps.find((step) => step.title === 'Shop Your Choice');
    expect(redeemStep?.mobileTitle).toBe('Redeem on Any 9KT Jewellery');

    const timeline = screen.getByRole('list', { name: 'How it works steps' });
    expect(within(timeline).getByText(redeemStep!.mobileTitle!)).toBeInTheDocument();
    expect(within(timeline).queryByText('Shop Your Choice')).not.toBeInTheDocument();
  });

  it('keeps desktop copy for the redeem step outside the mobile timeline', () => {
    render(<PopHowItWorksSection />);

    expect(screen.getByText('Shop Your Choice')).toBeInTheDocument();
  });

  it('renders gradient pipeline bars between steps but not after the last redeem step', () => {
    render(<PopHowItWorksSection />);

    const pipelines = screen.getAllByTestId('pop-how-it-works-pipeline');
    expect(pipelines).toHaveLength(popHowItWorksSteps.length - 1);

    const timeline = screen.getByRole('list', { name: 'How it works steps' });
    const items = within(timeline).getAllByRole('listitem');
    expect(within(items[items.length - 1]!).queryByTestId('pop-how-it-works-pipeline')).toBeNull();
  });
});
