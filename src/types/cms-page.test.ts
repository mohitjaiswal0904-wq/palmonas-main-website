import { CmsPageChunkResponseSchema } from '@/types/cms-page';

describe('CmsPageChunkResponseSchema', () => {
  it('parses chunk payloads when version.environment is omitted', () => {
    const payload = {
      page: {
        id: 'd5664c6e-1b0f-4c81-9bff-a06ea831828b',
        slug: 'home-page',
        name: 'home',
        description: 'tets',
        meta_title: '',
        meta_description: '',
        is_active: true,
        draft_version_id: 'd8124f4c-99e8-4be5-b6b3-8995deb2ff1f',
        created_at: '2026-07-01T01:05:36.427176Z',
      },
      version: {
        id: 'c6b2bb26-fef1-421e-b5f7-a4b08d0c5e5d',
        version_number: 3,
        sections_count: 1,
      },
      environment: 'production',
      chunk_ids: [1],
      sections: [
        {
          id: '553c7753-fc17-464a-af1b-f74a3b2b9de3',
          type: 'media',
          title: 'padded_image.jpg',
          order: 1,
          content: {
            mediaUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/padded_image.jpg',
            mediaType: 'image',
          },
          is_visible: true,
          chunk_id: 1,
        },
      ],
    };

    const parsed = CmsPageChunkResponseSchema.parse(payload);

    expect(parsed.sections).toHaveLength(1);
    expect(parsed.sections[0]?.type).toBe('media');
    expect(parsed.environment).toBe('production');
  });
});
