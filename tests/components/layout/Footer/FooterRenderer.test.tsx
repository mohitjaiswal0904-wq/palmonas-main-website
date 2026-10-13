import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

import { FooterRenderer } from '@/components/layout/Footer/FooterRenderer';
import type { FooterConfig, LayoutItem } from '@/types/layout';

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
    show: jest.fn(),
  }),
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/cms/shared/CmsMedia', () => ({
  CmsMedia: ({
    sources: _sources,
    url,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    sources?: unknown[];
    url: string;
  }) => <img {...props} src={url} />,
}));

jest.mock('@/components/layout/Footer/FooterSocialGraphic', () => ({
  FooterSocialGraphic: ({ className }: { className?: string }) => (
    <span data-testid="social-icon" className={className} />
  ),
}));

const config: FooterConfig = {
  background_color: '#ffffff',
  text_color: '#222222',
  link_color: '#868686',
  border_color: '#e6e6e6',
  show_newsletter: true,
  show_social_row: true,
  show_app_download: true,
  show_trust_badges: true,
  show_popular_searches: true,
  popular_searches_heading: 'Popular Searches',
  annual_returns_text: 'Annual Returns 2023-24',
};

const items: LayoutItem[] = [
  {
    id: 'newsletter',
    item_type: 'newsletter',
    label: 'Subscribe to receive exciting offers!',
    extra_metadata: { placeholder: 'Your email address' },
  },
  {
    id: 'company',
    item_type: 'text_block',
    label: 'Demifine® FASHION PVT LTD',
    extra_metadata: { body: 'Registered Address: Pune, Maharashtra 411036.' },
  },
  {
    id: 'policy',
    item_type: 'footer_column',
    label: 'Policy',
    children: [
      {
        id: 'shipping',
        item_type: 'link',
        label: 'Shipping & Delivery Policy',
        action_value: '/shipping',
        parent_id: 'policy',
      },
    ],
  },
  {
    id: 'facebook',
    item_type: 'social',
    label: 'Facebook',
    action_value: 'https://facebook.com/palmonas',
  },
  {
    id: 'app',
    item_type: 'app_download',
    label: 'Download the PALMONAS App',
    extra_metadata: {
      body: '5L+ Downloads',
      images: [
        {
          alt: 'Google Play',
          image_url: 'https://cdn.example.com/google-play.png',
          action_type: 'external',
          action_value: 'https://play.google.com',
        },
      ],
    },
  },
  {
    id: 'payments',
    item_type: 'image_row',
    extra_metadata: {
      images: [
        { alt: 'Accepted payment methods', image_url: 'https://cdn.example.com/payments.png' },
      ],
    },
  },
  {
    id: 'women',
    item_type: 'link_group',
    label: 'For Women',
    children: [
      {
        id: 'rings',
        item_type: 'link',
        label: 'Rings For Women',
        action_value: '/rings-for-women',
        parent_id: 'women',
      },
      {
        id: 'earrings',
        item_type: 'link',
        label: 'Earrings For Women',
        action_value: '/earrings-for-women',
        parent_id: 'women',
      },
    ],
  },
];

describe('FooterRenderer', () => {
  it('renders backend footer content in the Figma section order', () => {
    render(<FooterRenderer config={config} items={items} />);

    expect(screen.getByText('Subscribe to receive exciting offers!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email address')).toBeInTheDocument();
    expect(screen.getByText('Demifine® FASHION PVT LTD')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument();
    expect(screen.getByText('Download the PALMONAS App')).toHaveClass('text-black');
    expect(screen.getByRole('img', { name: 'Accepted payment methods' })).toBeInTheDocument();
    expect(screen.getByText('Annual Returns 2023-24')).toBeInTheDocument();
    expect(screen.getByText('Popular Searches')).toBeInTheDocument();
  });

  it('provides mobile accordions and desktop columns from the same backend links', () => {
    render(<FooterRenderer config={config} items={items} />);

    expect(screen.getByText('Policy', { selector: 'summary' })).toHaveClass(
      'text-[#222]',
      'laptop:text-[var(--footer-text)]',
    );
    expect(screen.getByText('Policy', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getAllByText('Shipping & Delivery Policy')).toHaveLength(2);
    expect(screen.getByText('Rings For Women')).toBeInTheDocument();
    expect(screen.getByText('Earrings For Women')).toBeInTheDocument();
  });

  it('uses the Figma app and payment spacing on mobile without changing desktop layout', () => {
    render(<FooterRenderer config={config} items={items} />);

    const [desktopAppCopy, mobileAppCopy] = screen.getAllByText('5L+ Downloads');
    expect(desktopAppCopy).toHaveClass('laptop:block', 'hidden');
    expect(mobileAppCopy).toHaveClass('laptop:hidden');
    expect(screen.getByRole('img', { name: 'Google Play' })).toHaveClass(
      'h-[61px]',
      'w-[204px]',
      'laptop:w-auto',
    );
    expect(screen.getByRole('img', { name: 'Accepted payment methods' }).parentElement).toHaveClass(
      'max-w-[220px]',
      'laptop:max-w-none',
      'laptop:pb-4',
    );
  });

  it('keeps the subscription heading visible when CMS text_color matches the white background', () => {
    render(
      <FooterRenderer
        config={{
          ...config,
          background_color: '#FFFFFF',
          text_color: '#FFFFFF',
          heading_color: '#222222',
          newsletter_heading: 'Subscribe to receive exciting offers!',
        }}
        items={items}
      />,
    );

    const heading = screen.getByText('Subscribe to receive exciting offers!');
    expect(heading).toBeInTheDocument();
    expect(heading.closest('footer')).toHaveStyle({
      '--footer-text': '#222222',
      backgroundColor: '#FFFFFF',
    });
  });

  it('handles empty text blocks and body-only text blocks correctly', () => {
    const customItems: LayoutItem[] = [
      {
        id: 'empty-text-block',
        item_type: 'text_block',
        label: '',
        extra_metadata: { body: '' },
      },
      {
        id: 'body-only-text-block',
        item_type: 'text_block',
        label: '',
        extra_metadata: { body: 'Registered Address: Pune' },
      },
    ];

    const { container } = render(
      <FooterRenderer config={{ ...config, show_newsletter: false }} items={customItems} />,
    );

    // The empty text block should not render any element
    // The body-only block should render the body, but not an empty label paragraph
    expect(screen.getByText('Registered Address: Pune')).toBeInTheDocument();
    expect(screen.getByText('Registered Address: Pune')).not.toHaveClass('mt-1');
    expect(container.querySelector('.font-semibold')).not.toBeInTheDocument();
  });
});

