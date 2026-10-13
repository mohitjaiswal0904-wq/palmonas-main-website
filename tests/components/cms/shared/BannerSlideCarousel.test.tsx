import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BannerSlideCarousel } from '@/components/cms/shared/BannerSlideCarousel';
import type { CmsBannerSlide } from '@/lib/utils/cms-banner-slides';

const runActionMock = jest.fn();

jest.mock('@/hooks/useCmsAction', () => ({
  useCmsAction: () => runActionMock,
}));

jest.mock('@/components/cms/shared/CmsMedia', () => ({
  CmsMedia: ({ alt }: { alt?: string }) => <div data-testid="cms-media">{alt}</div>,
}));

const slides: CmsBannerSlide[] = [
  {
    id: 'slide-1',
    mediaUrl: 'https://cdn.example.com/1.jpg',
    sources: [],
    title: 'Banner one',
    subtitle: 'Subtitle one',
    cta: { text: 'Shop now', link: '/collections/test' },
    action: null,
  },
  {
    id: 'slide-2',
    mediaUrl: 'https://cdn.example.com/2.jpg',
    sources: [],
    title: 'Banner two',
    subtitle: '',
    cta: null,
    action: null,
  },
];

describe('BannerSlideCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a single banner without carousel controls', () => {
    render(<BannerSlideCarousel slides={[slides[0]!]} />);

    expect(screen.getByRole('heading', { name: 'Banner one' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous banner' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next banner' })).not.toBeInTheDocument();
  });

  it('renders carousel region and navigation for multiple slides', () => {
    render(<BannerSlideCarousel slides={slides} />);

    expect(screen.getByRole('region', { name: 'Banner carousel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous banner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next banner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Banner one' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Banner two' })).toBeInTheDocument();
  });

  it('allows vertical page scroll by not locking touch to pan-x (PW-567)', () => {
    render(<BannerSlideCarousel slides={slides} />);

    const carousel = screen.getByRole('region', { name: 'Banner carousel' });
    expect(carousel.className).not.toMatch(/touch-pan-x/);
    expect(carousel.className).toMatch(/overflow-x-auto/);
    expect(carousel.className).toMatch(/snap-x/);
  });

  it('fires CTA navigation through CMS action handler', async () => {
    const user = userEvent.setup();
    render(<BannerSlideCarousel slides={[slides[0]!]} />);

    await user.click(screen.getByRole('button', { name: 'Shop now' }));

    expect(runActionMock).toHaveBeenCalledWith({
      action_type: 'navigate',
      action_value: '/collections/test',
    });
  });
});
