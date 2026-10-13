import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ButtonGridSection } from '@/components/cms/ButtonGridSection';
import type { CmsSection } from '@/types/cms';

jest.mock('@/components/cms/shared/CmsSectionShell', () => ({
  CmsSectionShell: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <section className={className} data-testid="section-shell">
      {children}
    </section>
  ),
  CmsSectionHeader: ({ title }: { title?: string }) => <h2>{title}</h2>,
}));

jest.mock('@/components/cms/shared/CmsEmbeddedExtras', () => ({
  CmsEmbeddedExtras: ({
    buttonRowClassName,
    content,
  }: {
    buttonRowClassName?: string;
    content: Record<string, unknown>;
  }) => (
    <div
      data-testid="button-grid"
      className={buttonRowClassName}
      data-content={JSON.stringify(content)}
    />
  ),
}));

function createSection(content: CmsSection['content']): CmsSection {
  return {
    id: 'categories',
    type: 'button_grid',
    title: 'Categories',
    order: 1,
    is_visible: true,
    content,
  };
}

describe('ButtonGridSection', () => {
  it('uses equal 8px mobile padding without changing desktop horizontal spacing', () => {
    render(
      <ButtonGridSection
        section={createSection({ buttons: [{ id: 'rings', text: 'Rings' }] })}
      />,
    );

    expect(screen.getByTestId('section-shell')).toHaveClass('p-2', 'tab:px-0');
  });

  it('removes the extra mobile row inset', () => {
    render(
      <ButtonGridSection
        section={createSection({ buttons: [{ id: 'rings', text: 'Rings' }] })}
      />,
    );

    expect(screen.getByTestId('button-grid')).toHaveClass('mx-0');
  });

  it('renames the gold Gifting section and removes its black card backgrounds', () => {
    render(
      <ButtonGridSection
        section={{
          ...createSection({
            buttons: [
              {
                id: 'under-10k',
                text: '',
                action_value: '/collections/gold-less-than-10k',
                background_color: '#000000',
              },
            ],
          }),
          title: 'Gifting',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Shop By Price' })).toBeInTheDocument();
    expect(screen.getByTestId('button-grid')).toHaveAttribute(
      'data-content',
      expect.stringContaining('"background_color":"transparent"'),
    );
  });

  it('preserves non-gold Gifting sections and their configured backgrounds', () => {
    render(
      <ButtonGridSection
        section={{
          ...createSection({
            buttons: [
              {
                id: 'gift',
                text: 'Gift',
                action_value: '/collections/gifts',
                background_color: '#000000',
              },
            ],
          }),
          title: 'Gifting',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Gifting' })).toBeInTheDocument();
    expect(screen.getByTestId('button-grid')).toHaveAttribute(
      'data-content',
      expect.stringContaining('"background_color":"#000000"'),
    );
  });

  it('renders no section when button data is missing', () => {
    const { container } = render(<ButtonGridSection section={createSection({})} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders no section when every button is hidden', () => {
    const { container } = render(
      <ButtonGridSection
        section={createSection({
          buttons: [{ id: 'rings', text: 'Rings', is_visible: false }],
        })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
