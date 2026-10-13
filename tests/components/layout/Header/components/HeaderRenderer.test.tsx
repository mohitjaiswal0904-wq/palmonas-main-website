import { fireEvent, render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { HeaderRenderer } from '@/components/layout/Header/components/HeaderRenderer';
import type { HeaderConfig, HeaderRowShell, LayoutItem } from '@/types/layout';
import type { SearchSuggestions } from '@/types/search-suggestions';

const mockRevealVisibility = jest.fn(() => 1);
const mockIsLaptop = jest.fn(() => true);
const mockUtilityBarProps = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

jest.mock('@/hooks/cart/useCartStats', () => ({
  useCartStats: () => ({
    cartCount: 0,
    cartCountHydrated: true,
    wishlistCount: 0,
    wishlistCountHydrated: true,
  }),
}));

jest.mock('@/hooks/useAfterHydration', () => ({
  useAfterHydration: () => true,
}));

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => mockIsLaptop(),
}));

jest.mock('@/hooks/useRevealOnScrollUp', () => ({
  useRevealOnScrollUp: () => mockRevealVisibility(),
}));

jest.mock('@/components/layout/AnnouncementBar', () => ({
  AnnouncementBar: () => <div data-testid="announcement-bar" />,
}));

jest.mock('@/components/layout/Header/components/HeaderDesktopUtilityBar', () => ({
  HeaderDesktopUtilityBar: (props: { searchChromeVisibility?: number }) => {
    mockUtilityBarProps(props);
    return <div data-testid="header-utility-bar" />;
  },
}));

jest.mock('@/components/layout/drawer', () => ({
  DrawerSidebar: () => null,
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    prefetch: _prefetch,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
    prefetch?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const suggestions: SearchSuggestions = {
  popularTerms: [],
  recentSearchTerms: [],
  headerPopularTerms: [],
  popularCollections: [],
  exploreTerms: [],
};

const navItem: LayoutItem = {
  id: 'rings',
  item_type: 'link',
  label: 'Rings',
  action_type: 'navigate',
  action_value: '/collections/rings',
  sort_order: 10,
};

const dropdownChild: LayoutItem = {
  id: 'gifts-her',
  item_type: 'link',
  label: 'Gifts for Her',
  action_type: 'navigate',
  action_value: '/collections/gifts-for-her',
  sort_order: 1,
};

const miniMenuItem: LayoutItem = {
  id: 'gifting',
  item_type: 'mini_menu',
  label: 'Gifting',
  sort_order: 20,
  children: [dropdownChild],
};

const rows: HeaderRowShell[] = [{ row: 1, items: [navItem] }];
const config: HeaderConfig = { sticky: true };

describe('HeaderRenderer sticky nav', () => {
  beforeEach(() => {
    mockRevealVisibility.mockReturnValue(1);
    mockIsLaptop.mockReturnValue(true);
    mockUtilityBarProps.mockClear();
  });

  it('keeps the header and utility bar pinned while the nav is visible', () => {
    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    expect(screen.getByRole('banner', { name: 'Site header' })).toHaveClass('sticky', 'top-0');
    expect(screen.queryByTestId('header-sticky-spacer')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-utility-bar')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByTestId('header-nav-collapse')).toHaveClass('overflow-visible');
    expect(screen.getByText('Rings')).toBeInTheDocument();
  });

  it('keeps the desktop nav visible while scrolling down', () => {
    mockRevealVisibility.mockReturnValue(0);

    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const collapse = screen.getByTestId('header-nav-collapse');
    expect(collapse).toHaveAttribute('aria-hidden', 'false');
    expect(collapse).toHaveClass('overflow-visible');
    expect(screen.getByTestId('header-utility-bar')).toBeInTheDocument();
    expect(screen.getByText('Rings')).toBeInTheDocument();
  });

  it('keeps the desktop nav visible at partial scroll reveal', () => {
    mockRevealVisibility.mockReturnValue(0.5);

    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const collapse = screen.getByTestId('header-nav-collapse');
    expect(collapse).toHaveAttribute('aria-hidden', 'false');
    expect(collapse).toHaveClass('overflow-visible');
    expect(screen.getByText('Rings')).toBeInTheDocument();
  });

  it('does not pin the header when sticky is disabled', () => {
    render(
      <HeaderRenderer
        config={{ sticky: false }}
        items={[navItem]}
        rows={rows}
        suggestions={suggestions}
      />,
    );

    expect(screen.getByRole('banner', { name: 'Site header' })).not.toHaveClass('fixed', 'sticky');
    expect(screen.queryByTestId('header-sticky-spacer')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-nav-collapse')).toHaveClass('overflow-visible');
  });

  it('renders the announcement bar outside the sticky header', () => {
    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const announcement = screen.getByTestId('announcement-bar');
    const header = screen.getByRole('banner', { name: 'Site header' });
    expect(header).not.toContainElement(announcement);
    expect(screen.getByTestId('header-announcement-region')).toContainElement(announcement);
  });
});

describe('HeaderRenderer nav hover (PW-848)', () => {
  beforeEach(() => {
    mockRevealVisibility.mockReturnValue(1);
    mockIsLaptop.mockReturnValue(true);
  });

  it('applies peach/gold hover classes on top nav link titles', () => {
    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const link = screen.getByRole('link', { name: 'Rings' });
    expect(link.className).toContain('hover:bg-palmonas-headerHover');
    expect(link.className).toContain('hover:text-palmonas-headerHoverText');
    expect(link.className).not.toContain('hover:text-amber-700');
  });

  it('applies peach/gold hover classes on dropdown triggers and child links', async () => {
    render(
      <HeaderRenderer
        config={config}
        items={[miniMenuItem]}
        rows={[{ row: 1, items: [miniMenuItem] }]}
        suggestions={suggestions}
      />,
    );

    const trigger = screen.getByRole('button', { name: /Gifting/i });
    expect(trigger.className).toContain('hover:bg-palmonas-headerHover');
    expect(trigger.className).toContain('hover:text-palmonas-headerHoverText');

    fireEvent.click(trigger);

    const child = await screen.findByRole('link', { name: 'Gifts for Her' });
    expect(child.className).toContain('hover:bg-palmonas-headerHover');
    expect(child.className).toContain('hover:text-palmonas-headerHoverText');
    expect(child.className).toContain('w-full');
    expect(child.className).toMatch(/\bflex\b/);
    expect(child.className).not.toContain('hover:bg-stone-50');
  });
});

describe('HeaderRenderer mobile sticky chrome', () => {
  beforeEach(() => {
    mockRevealVisibility.mockReturnValue(1);
    mockIsLaptop.mockReturnValue(false);
    mockUtilityBarProps.mockClear();
  });

  it('keeps the mobile navbar pinned at the top', () => {
    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const header = screen.getByRole('banner', { name: 'Site header' });
    expect(header).toHaveClass('sticky', 'top-0');
    expect(header).not.toHaveClass('pointer-events-none');
    expect(header).not.toHaveStyle({ transform: 'translate3d(0, -100%, 0)' });
    expect(screen.queryByTestId('header-sticky-spacer')).not.toBeInTheDocument();
  });

  it('does not tuck the whole header off-screen while scrolling down', () => {
    mockRevealVisibility.mockReturnValue(0);

    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const header = screen.getByRole('banner', { name: 'Site header' });
    expect(header).not.toHaveAttribute('aria-hidden', 'true');
    expect(header).not.toHaveClass('pointer-events-none');
    expect(header).not.toHaveStyle({ transform: 'translate3d(0, -100%, 0)' });
    expect(screen.getByTestId('header-utility-bar')).toBeInTheDocument();
    expect(mockUtilityBarProps).toHaveBeenCalledWith(
      expect.objectContaining({ searchChromeVisibility: 0 }),
    );
  });

  it('passes expanded search chrome visibility while scrolling up', () => {
    mockRevealVisibility.mockReturnValue(1);

    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    const header = screen.getByRole('banner', { name: 'Site header' });
    expect(header).not.toHaveAttribute('aria-hidden', 'true');
    expect(header).not.toHaveClass('pointer-events-none');
    expect(mockUtilityBarProps).toHaveBeenCalledWith(
      expect.objectContaining({ searchChromeVisibility: 1 }),
    );
  });

  it('forces full search chrome visibility on laptop', () => {
    mockIsLaptop.mockReturnValue(true);
    mockRevealVisibility.mockReturnValue(0);

    render(
      <HeaderRenderer config={config} items={[navItem]} rows={rows} suggestions={suggestions} />,
    );

    expect(mockUtilityBarProps).toHaveBeenCalledWith(
      expect.objectContaining({ searchChromeVisibility: 1 }),
    );
  });
});
