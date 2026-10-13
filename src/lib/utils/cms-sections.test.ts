import { getVisibleOrderedSections, mergeChunkSections } from '@/lib/utils/cms-sections';
import type { CmsSection } from '@/types/cms';

describe('getVisibleOrderedSections', () => {
  it('filters hidden sections and sorts by order', () => {
    const sections: CmsSection[] = [
      { id: '2', type: 'banner', order: 2, is_visible: true, content: {} },
      { id: '1', type: 'hero-banner', order: 1, is_visible: true, content: {} },
      { id: '3', type: 'paragraph', order: 3, is_visible: false, content: {} },
    ];

    expect(getVisibleOrderedSections(sections).map((section) => section.id)).toEqual(['1', '2']);
  });
});

describe('mergeChunkSections', () => {
  it('merges chunk sections in manifest order', () => {
    const sectionsByChunk = {
      1: [{ id: 'a', type: 'hero-banner', order: 1, is_visible: true, content: {} }],
      2: [{ id: 'b', type: 'collection', order: 2, is_visible: true, content: {} }],
    };

    expect(mergeChunkSections([1, 2], sectionsByChunk).map((section) => section.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
