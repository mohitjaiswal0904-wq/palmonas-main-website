import { fireEvent, render, screen } from '@testing-library/react';

import { ProductImageZoomOverlay } from '@/components/product/ProductImageZoomOverlay';
import { productConfig, productMessages } from '@/config/product/product.config';
import { trackPDPMediaInteracted } from '@/lib/analytics/analytics-trackers';

jest.mock('@/lib/analytics/analytics-trackers', () => ({
  trackPDPMediaInteracted: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} />
  ),
}));

const { minScale, maxScale } = productConfig.gallery.zoom;

const images = [
  'https://cdn.example.com/1.jpg',
  'https://cdn.example.com/2.jpg',
  'https://cdn.example.com/3.jpg',
];

function renderOverlay(initialIndex = 0, onClose = jest.fn()) {
  render(
    <ProductImageZoomOverlay
      images={images}
      initialIndex={initialIndex}
      productName="Halo Necklace"
      productHandle="halo"
      onClose={onClose}
    />,
  );

  return onClose;
}

function currentThumbName(): string | null {
  return screen.getByRole('button', { current: true }).getAttribute('aria-label');
}

function frameWidths(): string[] {
  return screen.getAllByTestId('product-image-zoom-frame').map((frame) => frame.style.width);
}

/** Fakes a swipe by moving the pager's scroll offset a whole slide at a time. */
function scrollPagerToSlide(index: number) {
  const pager = screen.getByTestId('product-image-zoom-pager');

  Object.defineProperty(pager, 'clientWidth', { value: 400, configurable: true });
  pager.scrollLeft = index * 400;
  fireEvent.scroll(pager);
}

describe('ProductImageZoomOverlay', () => {
  it('renders every image as a snap-paged slide', () => {
    renderOverlay();

    expect(
      screen.getByRole('dialog', { name: 'Halo Necklace full screen gallery' }),
    ).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('product-image-zoom-dock')).toHaveClass('h-1/4');
    expect(screen.getAllByTestId('product-image-zoom-viewport')).toHaveLength(images.length);
    expect(screen.getByRole('img', { name: 'Halo Necklace - 2' })).toBeInTheDocument();

    expect(screen.queryByLabelText(productMessages.a11y.previousImage)).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-image-zoom-counter')).not.toBeInTheDocument();
    expect(screen.getByLabelText(productMessages.a11y.closeImageFullScreen)).toBeInTheDocument();
  });

  it('opens on the tapped slide and follows the scroll direction', () => {
    renderOverlay(1);

    expect(currentThumbName()).toBe('Halo Necklace - 2');

    scrollPagerToSlide(2);
    expect(currentThumbName()).toBe('Halo Necklace - 3');

    scrollPagerToSlide(0);
    expect(currentThumbName()).toBe('Halo Necklace');
  });

  it('pages from a thumbnail in the bottom dock', () => {
    renderOverlay();

    fireEvent.click(screen.getByRole('button', { name: 'Halo Necklace - 3' }));
    expect(currentThumbName()).toBe('Halo Necklace - 3');
    expect(screen.getByRole('button', { name: 'Halo Necklace - 3' })).toHaveClass('opacity-100');
    expect(screen.getByRole('button', { name: 'Halo Necklace' })).toHaveClass('opacity-40');
    expect(screen.getByRole('button', { name: 'Halo Necklace - 2' })).toHaveClass('opacity-40');
    expect(screen.queryByLabelText(productMessages.a11y.zoomIn)).not.toBeInTheDocument();
  });

  it('pages with the left and right arrow keys', () => {
    renderOverlay();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(currentThumbName()).toBe('Halo Necklace - 2');

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(currentThumbName()).toBe('Halo Necklace');

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(currentThumbName()).toBe('Halo Necklace');
  });

  it('lets the swipe reach the pager until a slide is zoomed', () => {
    renderOverlay();

    // A slide that scrolls at 1x would swallow the swipe instead of paging.
    expect(screen.getAllByTestId('product-image-zoom-viewport')[0]?.className).toContain(
      'overflow-hidden',
    );
    // A flex child only scrolls once its automatic minimum size is removed.
    expect(screen.getByTestId('product-image-zoom-pager').className).toContain('min-h-0');

    fireEvent.wheel(screen.getByTestId('product-image-zoom-overlay'), {
      deltaY: -120,
      clientX: 80,
      clientY: 120,
    });

    const [zoomedSlide] = screen.getAllByTestId('product-image-zoom-viewport');
    expect(zoomedSlide?.className).toContain('overflow-auto');
    expect(zoomedSlide?.className).toContain('overscroll-contain');

    for (const width of frameWidths()) {
      expect(Number.parseFloat(width)).toBeGreaterThan(100);
    }
  });

  it('grows and shrinks the frames with the wheel', () => {
    renderOverlay();

    const overlay = screen.getByTestId('product-image-zoom-overlay');
    fireEvent.wheel(overlay, { deltaY: -120, clientX: 80, clientY: 120 });
    expect(Number.parseFloat(frameWidths()[0] ?? '0')).toBeGreaterThan(minScale * 100);

    fireEvent.wheel(overlay, { deltaY: 120, clientX: 80, clientY: 120 });
    expect(frameWidths()[0]).toBe(`${minScale * 100}%`);
  });

  it('clamps zoom to the configured range', () => {
    renderOverlay();

    const overlay = screen.getByTestId('product-image-zoom-overlay');
    for (let step = 0; step < 40; step += 1) {
      fireEvent.wheel(overlay, { deltaY: -120, clientX: 80, clientY: 120 });
    }

    expect(frameWidths()[0]).toBe(`${maxScale * 100}%`);
  });

  it('zooms toward the pointer on wheel and ignores wheels on controls', () => {
    renderOverlay();

    fireEvent.wheel(screen.getByLabelText(productMessages.a11y.closeImageFullScreen), {
      deltaY: -120,
    });
    expect(frameWidths()[0]).toBe(`${minScale * 100}%`);

    const overlay = screen.getByTestId('product-image-zoom-overlay');
    const viewport = screen.getAllByTestId('product-image-zoom-viewport')[0];
    if (viewport) {
      viewport.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 400,
          bottom: 800,
          width: 400,
          height: 800,
          toJSON: () => ({}),
        }) as DOMRect;
    }

    fireEvent.wheel(overlay, { deltaY: -120, clientX: 80, clientY: 120 });

    expect(Number.parseFloat(frameWidths()[0] ?? '0')).toBeGreaterThan(minScale * 100);
  });

  it('zooms with a two-finger pinch', () => {
    renderOverlay();

    const overlay = screen.getByTestId('product-image-zoom-overlay');
    fireEvent.touchStart(overlay, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 40, clientY: 0 },
      ],
    });
    fireEvent.touchMove(overlay, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 80, clientY: 0 },
      ],
    });

    expect(Number.parseFloat(frameWidths()[0] ?? '0')).toBeGreaterThan(minScale * 100);
  });

  it('closes on the close button and on Escape', () => {
    const onClose = renderOverlay();

    fireEvent.click(screen.getByLabelText(productMessages.a11y.closeImageFullScreen));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('restores page scroll when unmounted', () => {
    const { unmount } = render(
      <ProductImageZoomOverlay
        images={images}
        initialIndex={0}
        productName="Halo"
        onClose={jest.fn()}
      />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('tracks a named swipe when the zoom pager changes slides', () => {
    renderOverlay(0);
    jest.mocked(trackPDPMediaInteracted).mockClear();

    scrollPagerToSlide(2);

    expect(trackPDPMediaInteracted).toHaveBeenCalledWith({
      product_id: 'halo',
      action: 'swipe',
      media_index: 2,
    });
  });
});
