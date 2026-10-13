import { render, screen } from '@testing-library/react';

import { CmsButtonRow } from '@/components/cms/shared/CmsEmbeddedExtras';

jest.mock('@/components/cms/shared/CmsButton', () => ({
  CmsButton: ({ button }: { button: { text?: string } }) => (
    <button type="button">{button.text}</button>
  ),
}));

describe('CmsButtonRow', () => {
  it('removes mobile inline baseline spacing around category cards', () => {
    render(
      <CmsButtonRow
        buttons={[
          { id: 'rings', text: 'Rings' },
          { id: 'bracelets', text: 'Bracelets' },
        ]}
        spacingCss="gap: 8px"
        columns={2}
      />,
    );

    expect(screen.getByRole('button', { name: 'Rings' }).parentElement).toHaveClass('flex');
    expect(screen.getByRole('button', { name: 'Bracelets' }).parentElement).toHaveClass('flex');
    expect(screen.getByRole('button', { name: 'Rings' }).parentElement?.parentElement).toHaveClass(
      '[&::-webkit-scrollbar]:hidden',
    );
  });

  it('restores the original block wrapper at the desktop breakpoint', () => {
    render(
      <CmsButtonRow
        buttons={[{ id: 'rings', text: 'Rings' }]}
        spacingCss="gap: 8px"
        columns={2}
      />,
    );

    expect(screen.getByRole('button', { name: 'Rings' }).parentElement).toHaveClass(
      'tab:block',
      'tab:shrink-0',
    );
  });
});
