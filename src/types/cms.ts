import { z } from 'zod';

export const CmsSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().nullable().optional(),
  order: z.number().optional().default(0),
  content: z.record(z.string(), z.unknown()).optional(),
  component_id: z.number().nullable().optional(),
  is_visible: z.boolean().optional().default(true),
  action: z.string().nullable().optional(),
  action_value: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  chunk_id: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  image: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

export type CmsSection = z.infer<typeof CmsSectionSchema>;
