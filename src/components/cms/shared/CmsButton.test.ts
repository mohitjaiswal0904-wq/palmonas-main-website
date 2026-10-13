import { shouldUseCategoryTileButton } from '@/components/cms/shared/CmsButton';
import type { CmsSectionButton } from '@/types/cms-section';

describe('shouldUseCategoryTileButton', () => {
  it('uses category tiles only for the explicit variant', () => {
    const button: CmsSectionButton = {
      text: 'Necklaces',
      image_url: 'https://cdn.example.com/necklaces.webp',
      variant: 'category-tile',
    };

    expect(shouldUseCategoryTileButton(button)).toBe(true);
  });

  it('keeps image pill buttons as standard buttons', () => {
    const button: CmsSectionButton = {
      text: 'Necklaces',
      image_url: 'https://cdn.example.com/necklaces.webp',
      variant: 'pill',
    };

    expect(shouldUseCategoryTileButton(button)).toBe(false);
  });
});
