import { render, screen } from '@testing-library/react';

import { StoreCard } from '@/components/stores/StoreCard';
import type { Store } from '@/types/store';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...rest }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...rest} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

const store: Store = {
  id: 1,
  name: 'Palmonas Bandra',
  code: 'BAN',
  type: 'retail',
  phone: '+91 98765 43210',
  address: 'Linking Road, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  pincode: '400050',
  mapLink: 'https://maps.example.com/bandra',
  timing: '11:00 AM - 9:00 PM',
  images: [{ id: 1, image_url: 'https://cdn.example.com/store.jpg', display_order: 1 }],
};

describe('StoreCard', () => {
  it('renders store name, city, and address', () => {
    render(<StoreCard store={store} />);

    expect(screen.getByRole('heading', { name: 'Palmonas Bandra' })).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Linking Road, Bandra West')).toBeInTheDocument();
  });

  it('exposes accessible call and directions actions', () => {
    render(<StoreCard store={store} />);

    expect(screen.getByRole('link', { name: 'Call Palmonas Bandra' })).toHaveAttribute(
      'href',
      'tel:919876543210',
    );
    expect(screen.getByRole('link', { name: 'Call Palmonas Bandra' })).toHaveAttribute(
      'data-analytics-event',
      'call_store_clicked',
    );
    expect(
      screen.getByRole('link', { name: 'Get directions to Palmonas Bandra' }),
    ).toHaveAttribute('href', 'https://maps.example.com/bandra');
    expect(
      screen.getByRole('link', { name: 'Get directions to Palmonas Bandra' }),
    ).toHaveAttribute('data-analytics-event', 'visit_store_clicked');
  });

  it('does not reserve empty phone or timing rows when missing', () => {
    render(
      <StoreCard
        store={{
          ...store,
          phone: undefined,
          timing: undefined,
        }}
      />,
    );

    expect(screen.queryByText(store.timing!)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Call Palmonas Bandra at/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get directions to Palmonas Bandra' })).toBeInTheDocument();
  });

  it('builds a maps search URL when mapLink is absent', () => {
    render(<StoreCard store={{ ...store, mapLink: undefined }} />);

    const directions = screen.getByRole('link', { name: 'Get directions to Palmonas Bandra' });
    expect(directions.getAttribute('href')).toContain('google.com/maps/search');
    expect(directions.getAttribute('href')).toContain(encodeURIComponent('Palmonas Bandra'));
  });

  it('keeps details spacing compact without forced min-heights', () => {
    const { container } = render(<StoreCard store={store} />);
    const details = container.querySelector('h2')?.nextElementSibling;

    expect(details).toHaveClass('gap-1');
    expect(details?.className).not.toMatch(/min-h-/);
  });

  it('pins action buttons to the card footer for equal-height grids', () => {
    const { container } = render(<StoreCard store={store} />);
    const actions = container.querySelector('.mt-auto');

    expect(actions).toBeInTheDocument();
    expect(actions).toHaveClass('grid', 'grid-cols-2');
  });
});
