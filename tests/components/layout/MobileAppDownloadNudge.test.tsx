import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MobileAppDownloadNudge } from '@/components/layout/MobileAppDownloadNudge';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { mobileAppNudgeMessages, mobileAppNudgeStoreUrls } from '@/config/layout/mobile-app-nudge.config';
import { mobileAppNudgeDismissStorageKey } from '@/config/layout/mobile-app-nudge.config';

const mockUseMobileAppStoreUrl = jest.fn((): string | null => null);

jest.mock('@/hooks/layout/useMobileAppStoreUrl', () => ({
  useMobileAppStoreUrl: () => mockUseMobileAppStoreUrl(),
}));

describe('MobileAppDownloadNudge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseMobileAppStoreUrl.mockReturnValue(null);
  });

  it('does not render on desktop when no store URL is available', () => {
    render(<MobileAppDownloadNudge />);

    expect(screen.queryByTestId('mobile-app-download-nudge')).not.toBeInTheDocument();
  });

  it('renders the nudge with store CTA on mobile Android', async () => {
    mockUseMobileAppStoreUrl.mockReturnValue(mobileAppNudgeStoreUrls.androidUrl);

    render(<MobileAppDownloadNudge />);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-app-download-nudge')).toBeInTheDocument();
    });

    expect(screen.getByText(mobileAppNudgeMessages.labels.title)).toBeInTheDocument();
    expect(screen.getByText(mobileAppNudgeMessages.labels.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: mobileAppNudgeMessages.a11y.openInApp })).toHaveAttribute(
      'href',
      mobileAppNudgeStoreUrls.androidUrl,
    );
    expect(screen.getByRole('link', { name: mobileAppNudgeMessages.a11y.openInApp })).toHaveAttribute(
      'data-analytics-event',
      analyticsCanonicalEvents.openInAppClicked,
    );
  });

  it('hides the nudge after the close button is pressed', async () => {
    mockUseMobileAppStoreUrl.mockReturnValue(mobileAppNudgeStoreUrls.androidUrl);

    render(<MobileAppDownloadNudge />);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-app-download-nudge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: mobileAppNudgeMessages.a11y.close }));

    expect(screen.queryByTestId('mobile-app-download-nudge')).not.toBeInTheDocument();
    expect(localStorage.getItem(mobileAppNudgeDismissStorageKey)).toBe('1');
  });

  it('stays hidden when previously dismissed in localStorage', async () => {
    localStorage.setItem(mobileAppNudgeDismissStorageKey, '1');
    mockUseMobileAppStoreUrl.mockReturnValue(mobileAppNudgeStoreUrls.androidUrl);

    render(<MobileAppDownloadNudge />);

    await waitFor(() => {
      expect(screen.queryByTestId('mobile-app-download-nudge')).not.toBeInTheDocument();
    });
  });
});
