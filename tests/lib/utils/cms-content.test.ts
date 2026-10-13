import { getSectionDisplayTitle, toCmsSectionTitleCase } from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

describe('toCmsSectionTitleCase', () => {
  it('uppercases only the first letter of each word', () => {
    expect(toCmsSectionTitleCase("SHRADDHA'S FAVOURITE")).toBe("Shraddha's Favourite");
    expect(toCmsSectionTitleCase("AMRITA'S FAVOURITE")).toBe("Amrita's Favourite");
  });

  it('normalizes mixed and lower-case CMS headings', () => {
    expect(toCmsSectionTitleCase('the gifting edit')).toBe('The Gifting Edit');
    expect(toCmsSectionTitleCase('Most LOVED')).toBe('Most Loved');
  });
});

describe('getSectionDisplayTitle', () => {
  it('title-cases the section title for display', () => {
    const section = {
      id: 'favourites',
      type: 'collection',
      order: 1,
      is_visible: true,
      title: "SHRADDHA'S FAVOURITE",
    } satisfies CmsSection;

    expect(getSectionDisplayTitle(section)).toBe("Shraddha's Favourite");
  });

  it('falls back to an empty string when no title exists', () => {
    const section = {
      id: 'favourites',
      type: 'collection',
      order: 1,
      is_visible: true,
    } satisfies CmsSection;

    expect(getSectionDisplayTitle(section)).toBe('');
  });
});
