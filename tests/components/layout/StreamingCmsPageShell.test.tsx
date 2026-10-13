import { render, screen } from '@testing-library/react';

import { StreamingCmsPageShell } from '@/components/layout/StreamingCmsPageShell';
import type { CmsPageShellResponse } from '@/types/cms-page';

jest.mock('@/components/cms/CmsPageChrome', () => ({
  CmsShellHeader: () => <header data-testid="cms-header">CMS Header</header>,
  CmsShellFooter: () => <footer data-testid="cms-footer">CMS Footer</footer>,
}));

const shell: CmsPageShellResponse = {
  page: { id: 'p1', slug: 'home-page', name: 'Home', is_active: true },
  version: { id: 'v1', version_number: 1, environment: 'production' },
  layouts: {
    announcement_bars: [],
    header: null,
    footer: null,
    bottom_nav: null,
  },
  chunks: {
    chunk_ids: [],
    total_chunks: 0,
    total_sections: 0,
    manifest: [],
  },
};

describe('StreamingCmsPageShell', () => {
  it('streams CMS shell chrome around main children', () => {
    render(
      <StreamingCmsPageShell shell={shell}>
        <main>Body</main>
      </StreamingCmsPageShell>,
    );

    expect(screen.getByTestId('cms-header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByTestId('cms-footer')).toBeInTheDocument();
  });

  it('accepts a custom main fallback prop without blocking body when resolved', () => {
    render(
      <StreamingCmsPageShell shell={shell} mainFallback={<div>Main fallback</div>}>
        <main>Body</main>
      </StreamingCmsPageShell>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByText('Main fallback')).not.toBeInTheDocument();
  });
});
