import { render, screen } from '@testing-library/react';

import { CmsPageBody } from '@/components/cms/CmsPageBody';
import type { CmsSection } from '@/types/cms';
import type { CmsPageShellResponse } from '@/types/cms-page';

const mockUseCmsPageChunks = jest.fn();

jest.mock('@/hooks/useCmsPageChunks', () => ({
  useCmsPageChunks: (...args: unknown[]) => mockUseCmsPageChunks(...args),
}));

jest.mock('@/components/cms/CmsSectionList', () => ({
  CmsSectionList: ({ sections }: { sections: CmsSection[] }) => (
    <div data-testid="cms-section-list">{sections.length} sections</div>
  ),
}));

const shell = {
  chunks: { chunk_ids: [1, 2] },
} as CmsPageShellResponse;

describe('CmsPageBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loaded sections without a chunk skeleton', () => {
    mockUseCmsPageChunks.mockReturnValue({
      sections: [{ id: 'a' } as CmsSection],
      isLoadingChunks: false,
    });

    render(
      <CmsPageBody slug="home" shell={shell} initialChunkId={1} initialSections={[]} />,
    );

    expect(screen.getByTestId('cms-section-list')).toHaveTextContent('1 sections');
    expect(screen.queryByTestId('cms-sections-loading-skeleton')).not.toBeInTheDocument();
  });

  it('shows section skeletons while more chunks load', () => {
    mockUseCmsPageChunks.mockReturnValue({
      sections: [{ id: 'a' } as CmsSection],
      isLoadingChunks: true,
    });

    render(
      <CmsPageBody slug="home" shell={shell} initialChunkId={1} initialSections={[]} />,
    );

    expect(screen.getByTestId('cms-section-list')).toBeInTheDocument();
    expect(screen.getByTestId('cms-sections-loading-skeleton')).toBeInTheDocument();
  });

  it('returns null when there are no sections and nothing is loading', () => {
    mockUseCmsPageChunks.mockReturnValue({ sections: [], isLoadingChunks: false });

    const { container } = render(
      <CmsPageBody slug="home" shell={shell} initialSections={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows skeletons when sections are empty but chunks are still loading', () => {
    mockUseCmsPageChunks.mockReturnValue({ sections: [], isLoadingChunks: true });

    render(<CmsPageBody slug="home" shell={shell} initialSections={[]} />);

    expect(screen.getByTestId('cms-sections-loading-skeleton')).toBeInTheDocument();
  });
});
