import { z } from 'zod';

import { CmsSectionSchema, type CmsSection } from '@/types/cms';

export const CmsPageMetaSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export type CmsPageMeta = z.infer<typeof CmsPageMetaSchema>;

export const CmsPageVersionSchema = z.object({
  id: z.string(),
  version_number: z.number(),
  environment: z.enum(['production', 'testing']),
});

export type CmsPageVersion = z.infer<typeof CmsPageVersionSchema>;

export const CmsChunkManifestEntrySchema = z.object({
  chunk_id: z.number(),
  section_ids: z.array(z.string()),
  section_count: z.number(),
  min_order: z.number(),
});

export const CmsPageShellResponseSchema = z.object({
  page: CmsPageMetaSchema,
  version: CmsPageVersionSchema,
  layouts: z.object({
    announcement_bars: z.array(z.unknown()).optional().default([]),
    header: z.unknown().nullable().optional(),
    footer: z.unknown().nullable().optional(),
    bottom_nav: z.unknown().nullable().optional(),
  }),
  chunks: z.object({
    chunk_ids: z.array(z.number()),
    total_chunks: z.number(),
    total_sections: z.number(),
    manifest: z.array(CmsChunkManifestEntrySchema).optional().default([]),
  }),
});

export type CmsPageShellResponse = z.infer<typeof CmsPageShellResponseSchema>;

/** Chunk payloads include extra page/version fields and may omit version.environment. */
export const CmsPageChunkVersionSchema = z
  .object({
    id: z.string(),
    version_number: z.number(),
    environment: CmsPageVersionSchema.shape.environment.optional(),
  })
  .passthrough();

export const CmsPageChunkResponseSchema = z.object({
  page: CmsPageMetaSchema.passthrough(),
  version: CmsPageChunkVersionSchema,
  environment: CmsPageVersionSchema.shape.environment,
  chunk_ids: z.array(z.number()),
  sections: z.array(CmsSectionSchema),
});

export type CmsPageChunkResponse = z.infer<typeof CmsPageChunkResponseSchema>;

export type { CmsSection };
