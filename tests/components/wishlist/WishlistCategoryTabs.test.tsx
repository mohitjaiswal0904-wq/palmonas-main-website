import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WishlistCategoryTabs } from '@/components/wishlist/WishlistCategoryTabs';

describe('WishlistCategoryTabs', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders category chips in a horizontal scroll row', () => {
    const { container } = render(
      <WishlistCategoryTabs activeFilter="demifine" onFilterChange={jest.fn()} />,
    );

    const scrollContainer = container.firstElementChild;
    expect(scrollContainer).toHaveClass('overflow-x-auto', 'min-w-0', 'w-full');
    expect(screen.getByRole('tablist')).toHaveClass('w-max', 'flex-nowrap');
    expect(screen.getByRole('tab', { name: 'Demifine®' })).toHaveClass('shrink-0');
  });

  it('uses cream fill for the active chip and outlined style for inactive chips', () => {
    render(<WishlistCategoryTabs activeFilter="demifine" onFilterChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Demifine®' })).toHaveClass(
      'h-[30px]',
      'rounded-[23px]',
      'border-[#D3C8CA]',
      'bg-[#ECE2DF]',
      'text-[#151515]',
    );
    expect(screen.getByRole('tab', { name: 'Gold Jewellery' })).toHaveClass(
      'border-[#CAC9C9]',
      'bg-transparent',
      'font-normal',
      'text-[#CAC9C9]',
      'text-[12px]',
      'leading-[18px]',
      'tracking-[0.24px]',
    );
  });

  it('calls onFilterChange when a chip is selected', async () => {
    const onFilterChange = jest.fn();
    const user = userEvent.setup();

    render(<WishlistCategoryTabs activeFilter="demifine" onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole('tab', { name: 'Gold Jewellery' }));

    expect(onFilterChange).toHaveBeenCalledWith('gold');
  });

  it('renders account variant labels', () => {
    render(
      <WishlistCategoryTabs variant="account" activeFilter="all" onFilterChange={jest.fn()} />,
    );

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'All Jewellery' })).not.toBeInTheDocument();
  });

  it('renders demifine, gold, and all pills', () => {
    render(
      <WishlistCategoryTabs
        activeFilter="gold"
        availableFilters={['demifine', 'gold', 'all']}
        onFilterChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Demifine®' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Gold Jewellery' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'All Jewellery' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Silver Jewellery' })).not.toBeInTheDocument();
  });
});
