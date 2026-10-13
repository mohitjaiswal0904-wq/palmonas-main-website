import { render, screen } from '@testing-library/react';

import { CmsAnnouncementBars } from '@/components/cms/CmsAnnouncementBars';
import type { CmsAnnouncementBarViewModel } from '@/lib/utils/cms-page-layouts';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const cmsBar: CmsAnnouncementBarViewModel = {
  id: 'cms-bar-1',
  config: {
    background_color: '#111111',
    text_color: '#ffffff',
  },
  items: [
    {
      id: 'cms-item-1',
      item_type: 'link',
      label: 'CMS promo message',
      action_type: 'internal_link',
      action_value: '/collections/sale',
    },
  ],
};

describe('CmsAnnouncementBars', () => {
  it('renders CMS announcement content', () => {
    render(<CmsAnnouncementBars bars={[cmsBar]} />);

    expect(screen.getByRole('link', { name: 'CMS promo message' })).toHaveAttribute(
      'href',
      '/collections/sale',
    );
  });
});
