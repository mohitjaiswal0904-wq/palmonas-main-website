import { act, render, screen } from '@testing-library/react';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import {
  announcementBarItems,
  announcementBarRotationIntervalMs,
} from '@/config/layout/announcement-bar.config';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AnnouncementBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the first announcement linked to bestsellers', () => {
    render(<AnnouncementBar />);

    const link = screen.getByRole('link', { name: announcementBarItems[0]?.text });
    expect(link).toHaveAttribute('href', announcementBarItems[0]?.route);
  });

  it('rotates to the next announcement after the configured interval', () => {
    render(<AnnouncementBar />);

    expect(screen.getByRole('link', { name: announcementBarItems[0]?.text })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(announcementBarRotationIntervalMs);
    });

    expect(screen.getByRole('link', { name: announcementBarItems[1]?.text })).toBeInTheDocument();
  });

  it('exposes an accessible region label', () => {
    render(<AnnouncementBar />);

    expect(screen.getByRole('region', { name: 'Promotional announcements' })).toBeInTheDocument();
  });

  it('slides the track horizontally when advancing announcements', () => {
    const { container } = render(<AnnouncementBar />);

    const track = container.querySelector('.flex.transition-transform');
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });

    act(() => {
      jest.advanceTimersByTime(announcementBarRotationIntervalMs);
    });

    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
  });
});
