import { render, screen } from '@testing-library/react';

import { CmsSectionList } from '@/components/cms/CmsSectionList';
import type { CmsSection } from '@/types/cms';

jest.mock('@/components/cms/HeroSection', () => ({
  HeroSection: ({ section }: { section: CmsSection }) => (
    <section data-testid="cms-test-section">{section.title}</section>
  ),
}));

describe('CmsSectionList', () => {
  it('uses the Figma 24px rhythm between homepage sections', () => {
    const { container } = render(
      <CmsSectionList
        sections={[
          { id: 'first', type: 'hero', title: 'First', order: 1, is_visible: true },
          { id: 'second', type: 'hero', title: 'Second', order: 2, is_visible: true },
        ]}
      />,
    );

    expect(container.firstChild).toHaveClass('gap-6');
    expect(container.firstChild).not.toHaveClass('gap-[10vw]', 'tab:gap-[7vh]', 'laptop:gap-[5vh]');
  });

  it('keeps hidden sections out of the shared spacing stack', () => {
    render(
      <CmsSectionList
        sections={[
          { id: 'visible', type: 'hero', title: 'Visible', order: 1, is_visible: true },
          { id: 'hidden', type: 'hero', title: 'Hidden', order: 2, is_visible: false },
        ]}
      />,
    );

    expect(screen.getAllByTestId('cms-test-section')).toHaveLength(1);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
