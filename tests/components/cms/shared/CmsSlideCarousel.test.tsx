import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CmsSlideCarousel } from '@/components/cms/shared/CmsSlideCarousel';
import type { CmsMediaItem } from '@/types/cms-section';

const runActionMock = jest.fn();

jest.mock('@/hooks/useCmsAction', () => ({
  useCmsAction: () => runActionMock,
}));

jest.mock('@/components/cms/shared/CmsMedia', () => ({
  CmsMedia: ({ alt }: { alt?: string }) => <div data-testid="cms-media">{alt}</div>,
}));

const slides: CmsMediaItem[] = [
  {
    mediaId: 'slide-1',
    url: 'https://cdn.example.com/1.jpg',
    alt: 'Hero one',
    action_type: 'navigate',
    action_value: '/collections/rings',
  },
  {
    mediaId: 'slide-2',
    url: 'https://cdn.example.com/2.jpg',
    alt: 'Hero two',
  },
];

describe('CmsSlideCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
  });

  it('renders a single slide without carousel controls', () => {
    render(<CmsSlideCarousel slides={[slides[0]!]} showDots={false} />);

    expect(screen.getByTestId('cms-media')).toHaveTextContent('Hero one');
    expect(screen.queryByRole('region', { name: 'Hero banner carousel' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument();
  });

  it('renders carousel region, arrows, and dots for multiple slides', () => {
    render(<CmsSlideCarousel slides={slides} autoPlay={false} />);

    expect(screen.getByRole('region', { name: 'Hero banner carousel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument();
  });

  it('allows vertical page scroll by not locking touch to pan-x (PW-567)', () => {
    render(<CmsSlideCarousel slides={slides} autoPlay={false} />);

    const carousel = screen.getByRole('region', { name: 'Hero banner carousel' });
    expect(carousel.className).not.toMatch(/touch-pan-x/);
    expect(carousel.className).toMatch(/overflow-x-auto/);
    expect(carousel.className).toMatch(/snap-x/);
  });

  it('runs CMS action when a clickable slide is activated', async () => {
    const user = userEvent.setup();
    render(<CmsSlideCarousel slides={[slides[0]!]} showDots={false} />);

    await user.click(screen.getByRole('button', { name: 'Slide 1' }));

    expect(runActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action_type: 'navigate',
        action_value: '/collections/rings',
      }),
    );
  });

  it('pauses auto-play after the user interacts with the carousel', () => {
    jest.useFakeTimers();
    const scrollTo = jest.fn();
    HTMLElement.prototype.scrollTo = scrollTo;

    render(<CmsSlideCarousel slides={slides} autoPlay interval={1000} />);

    const carousel = screen.getByRole('region', { name: 'Hero banner carousel' });
    carousel.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 200,
        top: 0,
        left: 0,
        right: 400,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    Object.defineProperty(carousel, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(carousel, 'scrollLeft', { configurable: true, writable: true, value: 0 });

    // Mount reset may no-op while clientWidth is 0; clear before asserting autoplay.
    scrollTo.mockClear();

    jest.advanceTimersByTime(1000);
    expect(scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.pointerDown(carousel);
    scrollTo.mockClear();

    jest.advanceTimersByTime(1800);
    expect(scrollTo).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('snaps the track to the first slide on mount so the first indicator stays aligned', () => {
    const scrollTo = jest.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 400,
    });

    const rafCallbacks: FrameRequestCallback[] = [];
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    try {
      render(<CmsSlideCarousel slides={slides} autoPlay={false} />);

      expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'auto' });
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      scrollTo.mockClear();
      rafCallbacks.forEach((cb) => {
        cb(0);
      });
      expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'auto' });
    } finally {
      rafSpy.mockRestore();
    }
  });

  it('remounts with the first indicator pressed and scroll reset to the start', () => {
    const scrollTo = jest.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 400,
    });

    const { unmount } = render(<CmsSlideCarousel slides={slides} autoPlay={false} />);
    const carousel = screen.getByRole('region', { name: 'Hero banner carousel' });
    Object.defineProperty(carousel, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 400,
    });
    fireEvent.scroll(carousel);

    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    unmount();
    scrollTo.mockClear();
    render(<CmsSlideCarousel slides={slides} autoPlay={false} />);

    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'auto' });
  });

  it('does not reset scroll when there is only one slide', () => {
    const scrollTo = jest.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 400,
    });

    render(<CmsSlideCarousel slides={[slides[0]!]} showDots={false} />);

    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: 'Hero banner carousel' })).not.toBeInTheDocument();
  });

  it('skips the mount snap while the track width is still zero', () => {
    const scrollTo = jest.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 0,
    });
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);

    try {
      render(<CmsSlideCarousel slides={slides} autoPlay={false} />);

      expect(scrollTo).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    } finally {
      rafSpy.mockRestore();
    }
  });
});
