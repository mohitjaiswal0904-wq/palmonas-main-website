import { fireEvent, render, screen } from '@testing-library/react';

import { DrawerTabs } from '@/components/layout/drawer/DrawerTabs';

describe('DrawerTabs', () => {
  it('renders Demifine® and Gold tabs without Silver', () => {
    render(<DrawerTabs activeTab="demifine" onTabChange={jest.fn()} />);

    expect(screen.getByLabelText('Demifine® Jewellery')).toBeInTheDocument();
    expect(screen.getByLabelText('Gold Jewellery')).toBeInTheDocument();
    expect(screen.queryByLabelText('Silver Jewellery')).not.toBeInTheDocument();
  });

  it('marks only the active tab as pressed', () => {
    render(<DrawerTabs activeTab="gold" onTabChange={jest.fn()} />);

    expect(screen.getByLabelText('Gold Jewellery')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Demifine® Jewellery')).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the selected tab id on press', () => {
    const onTabChange = jest.fn();
    render(<DrawerTabs activeTab="demifine" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByLabelText('Gold Jewellery'));
    expect(onTabChange).toHaveBeenCalledWith('gold');
  });

  it('slides the active pill across half the control for Gold', () => {
    const { container } = render(<DrawerTabs activeTab="gold" onTabChange={jest.fn()} />);

    const pill = container.querySelector('[aria-hidden="true"]');

    expect(pill).toHaveClass('w-1/2', 'translate-x-full');
    expect(pill).not.toHaveClass('w-1/3', 'translate-x-0');
  });
});
