import { fireEvent, render, screen } from '@testing-library/react';

import { DrawerMenuSidebar } from '@/components/layout/drawer/DrawerMenuSidebar';
import type { DrawerBottomItem, DrawerMenuCategory } from '@/types/drawer-menu';

const mockCategories: DrawerMenuCategory[] = [
  {
    id: 'category-1',
    label: 'Category One',
    items: [],
    layoutType: 'grid-3',
  },
  {
    id: 'fine-silver',
    label: 'Fine Silver',
    items: [],
    layoutType: 'grid-2-banner',
    labelBadge: { text: 'Luxe' },
  },
  {
    id: 'category-3',
    label: 'Category Three',
    items: [],
    layoutType: 'grid-3',
    labelBadge: { text: 'New' },
  },
];

const mockBottomItems: DrawerBottomItem[] = [
  {
    id: 'bottom-1',
    label: 'Bottom One',
  },
  {
    id: 'bottom-2',
    label: 'Bottom Two',
    hasExternalIcon: true,
  },
];

describe('DrawerMenuSidebar', () => {
  it('renders all category items and bottom items correctly', () => {
    render(
      <DrawerMenuSidebar
        categories={mockCategories}
        activeCategory="category-1"
        onCategoryPress={jest.fn()}
        bottomItems={mockBottomItems}
        onBottomItemPress={jest.fn()}
      />,
    );

    // Verify categories are rendered
    expect(screen.getByRole('button', { name: /Category One/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fine Silver Luxe/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Category Three New/ })).toBeInTheDocument();

    // Verify active class / aria-current
    const activeBtn = screen.getByRole('button', { name: /Category One/ });
    expect(activeBtn).toHaveAttribute('aria-current', 'true');
    expect(activeBtn).toHaveClass('bg-[#F4F4F4]');

    // Verify inactive class / no aria-current
    const inactiveBtn = screen.getByRole('button', { name: /Fine Silver Luxe/ });
    expect(inactiveBtn).not.toHaveAttribute('aria-current');
    expect(inactiveBtn).toHaveClass('bg-transparent');

    // Verify bottom items are rendered
    expect(screen.getByRole('button', { name: 'Bottom One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bottom Two' })).toBeInTheDocument();
  });

  it('triggers onCategoryPress when a category is clicked', () => {
    const onCategoryPress = jest.fn();
    render(
      <DrawerMenuSidebar
        categories={mockCategories}
        activeCategory={null}
        onCategoryPress={onCategoryPress}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Fine Silver Luxe/ }));
    expect(onCategoryPress).toHaveBeenCalledTimes(1);
    expect(onCategoryPress).toHaveBeenCalledWith('fine-silver');
  });

  it('triggers onBottomItemPress when a bottom item is clicked', () => {
    const onBottomItemPress = jest.fn();
    render(
      <DrawerMenuSidebar
        categories={mockCategories}
        activeCategory={null}
        onCategoryPress={jest.fn()}
        bottomItems={mockBottomItems}
        onBottomItemPress={onBottomItemPress}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bottom One' }));
    expect(onBottomItemPress).toHaveBeenCalledTimes(1);
    expect(onBottomItemPress).toHaveBeenCalledWith('bottom-1');
  });

  it('renders badges for fine-silver category and standard badge categories differently', () => {
    const { container } = render(
      <DrawerMenuSidebar
        categories={mockCategories}
        activeCategory={null}
        onCategoryPress={jest.fn()}
      />,
    );

    // Fine silver badge container should be relative inline-block with pr-6 class and absolute positioned badge container inside
    const fineSilverBtn = screen.getByRole('button', { name: /Fine Silver Luxe/ });
    const fineSilverContainer = fineSilverBtn.querySelector('.relative.inline-block');
    expect(fineSilverContainer).toBeInTheDocument();
    expect(fineSilverContainer).toHaveClass('pr-6');

    // Category three has standard badge render, check if it does NOT have pr-6 class
    const categoryThreeBtn = screen.getByRole('button', { name: /Category Three New/ });
    const categoryThreeContainer = categoryThreeBtn.querySelector('.relative.inline-block');
    expect(categoryThreeContainer).not.toBeInTheDocument();
  });
});
