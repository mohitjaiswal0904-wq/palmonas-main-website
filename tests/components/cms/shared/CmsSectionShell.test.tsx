import { fireEvent, render, screen } from '@testing-library/react';

import {
  CmsSectionHeader,
  CmsSectionShell,
} from '@/components/cms/shared/CmsSectionShell';

const runActionMock = jest.fn();

jest.mock('@/hooks/useCmsAction', () => ({
  useCmsAction: () => runActionMock,
}));

const section = {
  id: 'favourites',
  type: 'collection',
  order: 1,
  is_visible: true,
};

const actionableSection = {
  ...section,
  action: 'collection',
  action_value: 'gold-mangalsutra',
};

describe('CmsSectionHeader', () => {
  it('leaves spacing to the shared section container', () => {
    render(<CmsSectionHeader title="Most Loved" />);

    expect(screen.getByRole('heading', { name: 'Most Loved' })).not.toHaveClass('mb-3');
  });

  it('title-cases ALL CAPS CMS headings', () => {
    render(<CmsSectionHeader title="AMRITA'S FAVOURITE" />);

    expect(screen.getByRole('heading', { name: "Amrita's Favourite" })).toBeInTheDocument();
  });

  it('renders no heading when a title is absent', () => {
    render(<CmsSectionHeader />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('CmsSectionShell', () => {
  beforeEach(() => {
    runActionMock.mockClear();
  });

  it('keeps the heading and all content in one container', () => {
    render(
      <CmsSectionShell section={section}>
        <CmsSectionHeader title="Shraddha's Favourite" />
        <div data-testid="products">Products</div>
        <button type="button">View All</button>
      </CmsSectionShell>,
    );

    const contentContainer = screen.getByTestId('products').parentElement;

    expect(contentContainer).toHaveClass('flex', 'w-full', 'flex-col', 'gap-3');
    expect(contentContainer).toContainElement(
      screen.getByRole('heading', { name: "Shraddha's Favourite" }),
    );
    expect(contentContainer).toContainElement(screen.getByRole('button', { name: 'View All' }));
  });

  it('does not add a second section container when no title is provided', () => {
    const { container } = render(
      <CmsSectionShell section={section}>
        <div>Products</div>
      </CmsSectionShell>,
    );

    expect(container.querySelectorAll('section > div')).toHaveLength(1);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('runs the section action when the chrome is clicked', () => {
    render(
      <CmsSectionShell section={actionableSection}>
        <p>Featured gold</p>
      </CmsSectionShell>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(runActionMock).toHaveBeenCalledWith({
      action_type: 'collection',
      action_value: 'gold-mangalsutra',
    });
  });

  it('does not steal clicks from nested product links', () => {
    render(
      <CmsSectionShell section={actionableSection}>
        <a href="/products/crescent-bond">Crescent Bond</a>
      </CmsSectionShell>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Crescent Bond' }));

    expect(runActionMock).not.toHaveBeenCalled();
  });

  it('does not steal clicks from nested buttons', () => {
    render(
      <CmsSectionShell section={actionableSection}>
        <button type="button">Rings</button>
      </CmsSectionShell>,
    );

    const innerButton = screen.getByText('Rings', { selector: 'button' });
    fireEvent.click(innerButton);

    expect(runActionMock).not.toHaveBeenCalled();
  });

  it('ignores keyboard activation that originated on a nested link', () => {
    render(
      <CmsSectionShell section={actionableSection}>
        <a href="/products/crescent-bond">Crescent Bond</a>
      </CmsSectionShell>,
    );

    fireEvent.keyDown(screen.getByRole('link', { name: 'Crescent Bond' }), { key: 'Enter' });

    expect(runActionMock).not.toHaveBeenCalled();
  });
});
