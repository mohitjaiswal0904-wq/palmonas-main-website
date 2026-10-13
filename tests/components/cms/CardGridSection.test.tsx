import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { CardGridSection } from '@/components/cms/CardGridSection';
import type { CmsSection } from '@/types/cms';

jest.mock('@/components/cms/shared/CmsEmbeddedExtras', () => ({
  CmsCardGrid: ({ desktopVariant }: { desktopVariant?: string }) => (
    <div data-testid="card-grid" data-desktop-variant={desktopVariant} />
  ),
}));

jest.mock('@/components/cms/shared/CmsSectionShell', () => ({
  CmsSectionShell: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  CmsSectionHeader: ({ title }: { title?: string }) => <h2>{title}</h2>,
}));

const section: CmsSection = {
  id: 'metal-grid',
  type: 'card_grid',
  order: 1,
  is_visible: true,
  content: {
    cards: [{ id: 'gold', image_url: 'https://cdn.example.com/gold.jpg', is_visible: true }],
  },
};

describe('CardGridSection desktop variants', () => {
  it('enables the Crafted in Every Metal desktop layout for its CMS slug', () => {
    render(<CardGridSection section={{ ...section, slug: 'Metal Banners' }} />);

    expect(screen.getByTestId('card-grid')).toHaveAttribute(
      'data-desktop-variant',
      'crafted-metals',
    );
  });

  it('keeps regular card grids on their existing responsive layout', () => {
    render(<CardGridSection section={{ ...section, slug: 'Other Banners' }} />);

    expect(screen.getByTestId('card-grid')).not.toHaveAttribute('data-desktop-variant');
  });
});
