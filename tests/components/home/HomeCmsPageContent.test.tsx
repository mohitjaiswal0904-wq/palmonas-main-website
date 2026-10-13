import { fireEvent, render, screen } from '@testing-library/react';

import { HomeCmsPageContent } from '@/components/home/HomeCmsPageContent';
import type { HomePageCategoryId } from '@/config/home-page-categories.config';

const mockHandleSelect = jest.fn();
const mockPrefetchCategory = jest.fn();
let mockIsPending = false;
let mockActiveCategory: HomePageCategoryId = 'demifine';

jest.mock('@/hooks/home/useHomePageCategoryNavigation', () => ({
  useHomePageCategoryNavigation: () => ({
    activeCategory: mockActiveCategory,
    handleSelect: mockHandleSelect,
    prefetchCategory: mockPrefetchCategory,
    isPending: mockIsPending,
  }),
}));

describe('HomeCmsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    mockActiveCategory = 'demifine';
  });

  it('keeps category tabs visible while showing body skeleton when pending', () => {
    mockIsPending = true;
    mockActiveCategory = 'gold';

    render(
      <HomeCmsPageContent activeCategory="demifine">
        <div data-testid="cms-body">cms</div>
      </HomeCmsPageContent>,
    );

    expect(screen.getByRole('tablist', { name: 'Jewellery categories' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Gold Jewellery' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('home-page-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('cms-body')).not.toBeInTheDocument();
  });

  it('renders children when not pending', () => {
    render(
      <HomeCmsPageContent activeCategory="demifine">
        <div data-testid="cms-body">cms</div>
      </HomeCmsPageContent>,
    );

    expect(screen.getByTestId('cms-body')).toBeInTheDocument();
    expect(screen.queryByTestId('home-page-skeleton')).not.toBeInTheDocument();
  });

  it('forwards tab clicks to handleSelect', () => {
    render(
      <HomeCmsPageContent activeCategory="demifine">
        <div>cms</div>
      </HomeCmsPageContent>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Silver Jewellery' }));
    expect(mockHandleSelect).toHaveBeenCalledWith('silver');
  });

  it('forwards tab hover to prefetchCategory', () => {
    render(
      <HomeCmsPageContent activeCategory="demifine">
        <div>cms</div>
      </HomeCmsPageContent>,
    );

    fireEvent.pointerEnter(screen.getByRole('tab', { name: 'Gold Jewellery' }));
    expect(mockPrefetchCategory).toHaveBeenCalledWith('gold');
  });

  it('reserves tab spacing only where the tabs are visible', () => {
    const { container } = render(
      <HomeCmsPageContent activeCategory="demifine">
        <div>cms</div>
      </HomeCmsPageContent>,
    );

    const spacer = container.querySelector('.flex.justify-center');
    expect(spacer).toHaveClass('tab:mt-4', 'tab:mb-5');
    expect(spacer).not.toHaveClass('mt-4', 'mb-5');
  });

  it('dims tabs when pending', () => {
    mockIsPending = true;
    const { container } = render(
      <HomeCmsPageContent activeCategory="demifine">
        <div>cms</div>
      </HomeCmsPageContent>,
    );

    expect(container.querySelector('.opacity-80')).toBeInTheDocument();
  });
});
