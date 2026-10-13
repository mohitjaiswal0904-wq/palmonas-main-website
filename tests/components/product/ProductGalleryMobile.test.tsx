import { fireEvent, render, screen, within } from '@testing-library/react';

import { ProductGalleryMobile } from '@/components/product/ProductGalleryMobile';
import { productMessages } from '@/config/product/product.config';
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

const images = [
  'https://cdn.example.com/1.jpg',
  'https://cdn.example.com/2.jpg',
  'https://cdn.example.com/3.jpg',
];

describe('ProductGalleryMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes a gallery region with product name', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    expect(screen.getByLabelText('Halo Necklace image gallery')).toBeInTheDocument();
  });

  it('renders share control for mobile overlay', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    expect(screen.getByLabelText(productMessages.a11y.shareProduct)).toBeInTheDocument();
  });

  it('renders pagination dots when multiple images exist', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    fireEvent.click(screen.getByLabelText('View image 2 of 3'));
    expect(screen.getByRole('button', { current: true })).toHaveAttribute(
      'aria-label',
      'View image 2 of 3',
    );
  });

  it('places pagination dots below the image, not overlaid (Figma 963:75550)', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);
    const gallery = screen.getByLabelText('Halo Necklace image gallery');
    const dots = screen.getByRole('tablist', { name: 'Carousel pagination' });

    expect(dots.className).toContain('mt-3');
    expect(dots.className).toContain('mb-2');
    expect(dots.className).not.toContain('absolute');
    expect(gallery.compareDocumentPosition(dots) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('opens the full-screen carousel on the clicked image', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    fireEvent.click(
      screen.getByLabelText(
        productMessages.a11y.formatOpenImageFullScreen('Halo Necklace - 2'),
      ),
    );

    const dialog = screen.getByRole('dialog', { name: 'Halo Necklace full screen gallery' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { current: true })).toHaveAttribute(
      'aria-label',
      'Halo Necklace - 2',
    );
  });

  it('closes the full-screen viewer again', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    fireEvent.click(
      screen.getByLabelText(productMessages.a11y.formatOpenImageFullScreen('Halo Necklace')),
    );
    fireEvent.click(screen.getByLabelText(productMessages.a11y.closeImageFullScreen));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders one media frame per image', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('leaves height capping to the gallery scroll box (PW-643)', () => {
    const { container } = render(
      <ProductGalleryMobile images={images} productName="Halo Necklace" />,
    );
    const shell = container.firstElementChild;

    expect(shell?.className).not.toContain('max-h');
    expect(shell?.className).not.toContain('overflow-y');
  });

  it('fits desktop gallery images inside the square frame without cropping (PW-643)', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);

    for (const image of screen.getAllByRole('img')) {
      expect(image.className).toContain('laptop:object-contain');
    }
  });

  it('uses Figma 20px gaps between desktop gallery images', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);
    const gallery = screen.getByLabelText('Halo Necklace image gallery');

    expect(gallery.className).toContain('laptop:gap-5');
  });

  it('uses square aspect ratio on gallery image frames (PW-619)', () => {
    render(<ProductGalleryMobile images={images} productName="Halo Necklace" />);
    const gallery = screen.getByLabelText('Halo Necklace image gallery');
    const frames = Array.from(gallery.children);

    expect(frames).toHaveLength(3);
    for (const frame of frames) {
      expect(frame.className).toContain('aspect-square');
      expect(frame.className).not.toContain('aspect-[4/5]');
    }
  });

  it('tracks a named swipe when the active gallery image changes', () => {
    render(
      <ProductGalleryMobile images={images} productName="Halo Necklace" productHandle="halo" />,
    );

    fireEvent.click(screen.getByLabelText('View image 2 of 3'));

    expect(trackPDPMediaInteracted).toHaveBeenCalledWith({
      product_id: 'halo',
      action: 'swipe',
      media_index: 1,
    });
  });

  it('does not track a swipe on the initial gallery image', () => {
    render(
      <ProductGalleryMobile images={images} productName="Halo Necklace" productHandle="halo" />,
    );

    expect(trackPDPMediaInteracted).not.toHaveBeenCalled();
  });
});
