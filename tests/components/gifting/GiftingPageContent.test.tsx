import { render, screen } from '@testing-library/react';

import { GiftingHeroSection } from '@/components/gifting/GiftingHeroSection';
import { GiftingPageContent } from '@/components/gifting/GiftingPageContent';
import { GiftingPillCta } from '@/components/gifting/GiftingPillCta';
import { GiftingRelationshipsSection } from '@/components/gifting/GiftingRelationshipsSection';
import { GIFTING_CATEGORY_COLLECTION_HANDLE } from '@/config/gifting/gifting.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: () => null,
}));

function renderGiftingPage() {
  return render(
    <GiftingPageContent
      categoryCollectionHandle={GIFTING_CATEGORY_COLLECTION_HANDLE}
      categoryProductsInitialPage={null}
      bestsellersInitialPage={null}
    />,
  );
}

describe('GiftingPillCta', () => {
  it('renders an accessible link with the CTA label', () => {
    render(<GiftingPillCta href="/collections/all" label="Shop Now" />);

    expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
  });

  it('shows an arrow when requested', () => {
    render(<GiftingPillCta href="/collections/all" label="Shop Now" showArrow />);

    expect(screen.getByText('→')).toBeInTheDocument();
  });
});

describe('GiftingHeroSection', () => {
  it('renders mobile and desktop hero banners as a CTA link', () => {
    const { container } = render(<GiftingHeroSection />);

    expect(screen.getByRole('link', { name: 'Find the Perfect Gift' })).toHaveAttribute(
      'href',
      '/collections/all',
    );

    const images = container.querySelectorAll('img');
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('First_Banner.jpg'));
    expect(images[1]).toHaveAttribute('src', expect.stringContaining('First_Hero_Banner.png'));
  });

  it('exposes the gifting offer region', () => {
    render(<GiftingHeroSection />);

    expect(screen.getByRole('region', { name: 'Gifting offer' })).toBeInTheDocument();
  });
});

describe('GiftingRelationshipsSection', () => {
  it('renders recipient cards with shop links', () => {
    render(<GiftingRelationshipsSection />);

    expect(screen.getByRole('link', { name: 'Shop For Her' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
    expect(screen.getByRole('link', { name: 'Shop For Him' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
    expect(screen.getByRole('link', { name: 'Shop For Friend' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
  });

  it('highlights the relationships phrase in the heading', () => {
    render(<GiftingRelationshipsSection />);

    expect(screen.getByText('Your Relationships')).toBeInTheDocument();
    expect(screen.getByText('Made In Gold, Given With Love')).toBeInTheDocument();
  });
});

describe('GiftingPageContent', () => {
  it('renders key section headings from the mockups', () => {
    renderGiftingPage();

    expect(screen.getByRole('heading', { name: 'Palmonas Gifts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shop By Occasion' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Palmonas Top Styles' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Free gifts and gift cards' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gifts By Price' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Demifine Bestsellers' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop Palmonas Jewellery' })).toHaveAttribute(
      'href',
      '/collections/all',
    );
  });

  it('renders price band tiles and gift card CTA', () => {
    renderGiftingPage();

    expect(screen.getByRole('link', { name: 'Shop gifts Under 2k' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop gifts Premium Gifts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Gift Cards' })).toHaveAttribute(
      'href',
      '/cart/gift-cards',
    );
  });
});
