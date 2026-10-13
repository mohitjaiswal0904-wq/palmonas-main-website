import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HomePageCategoryTabs } from '@/components/home/HomePageCategoryTabs';
import { homePageCategories } from '@/config/home-page-categories.config';

describe('HomePageCategoryTabs', () => {
  it('renders a tablist with one tab per configured category', () => {
    render(<HomePageCategoryTabs activeCategory="demifine" onSelect={jest.fn()} />);

    expect(screen.getByRole('tablist', { name: 'Jewellery categories' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(homePageCategories.length);
  });

  it('marks the active category as selected', () => {
    render(<HomePageCategoryTabs activeCategory="gold" onSelect={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Gold Jewellery' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Demifine® Jewellery' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onSelect with the chosen category id', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<HomePageCategoryTabs activeCategory="demifine" onSelect={onSelect} />);

    await user.click(screen.getByRole('tab', { name: 'Silver Jewellery' }));

    expect(onSelect).toHaveBeenCalledWith('silver');
  });

  it('sizes each tab with Amplify vw min-width and does not force a fixed max width', () => {
    const { container } = render(
      <HomePageCategoryTabs activeCategory="demifine" onSelect={jest.fn()} />,
    );

    expect(container.firstChild).not.toHaveClass('max-w-[1132px]');
    expect(screen.getByRole('tab', { name: 'Demifine® Jewellery' })).toHaveClass('min-w-[15vw]');
    expect(screen.getByRole('tablist')).toHaveClass('min-w-max');
  });

  it('calls onPrefetch on pointer enter', () => {
    const onPrefetch = jest.fn();
    render(
      <HomePageCategoryTabs
        activeCategory="demifine"
        onSelect={jest.fn()}
        onPrefetch={onPrefetch}
      />,
    );

    fireEvent.pointerEnter(screen.getByRole('tab', { name: 'Gold Jewellery' }));
    expect(onPrefetch).toHaveBeenCalledWith('gold');
  });

  it('dims the bar while category navigation is pending', () => {
    const { container } = render(
      <HomePageCategoryTabs activeCategory="demifine" onSelect={jest.fn()} isPending />,
    );

    expect(container.firstChild).toHaveClass('opacity-80');
  });
});
