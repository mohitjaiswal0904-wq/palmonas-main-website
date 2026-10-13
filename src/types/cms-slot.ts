import { z } from 'zod';

import {
  FooterConfigSchema,
  HeaderConfigSchema,
  HeaderRowShellSchema,
  LayoutItemSchema,
  type FooterConfig,
  type HeaderConfig,
  type LayoutItem,
} from '@/types/layout';

export const CmsSlotLayoutSchema = z.object({
  layout_id: z.string().optional(),
  name: z.string().optional(),
  slot: z.string().optional(),
  stack_order: z.number().optional(),
  config: z.union([FooterConfigSchema, HeaderConfigSchema]).optional(),
  items: z.array(LayoutItemSchema).optional(),
  rows: z.array(HeaderRowShellSchema).nullish(),
});

export const CmsSlotPayloadSchema = z.object({
  slot: z.string(),
  environment: z.string().optional(),
  page: z.unknown().nullable().optional(),
  version: z.unknown().nullable().optional(),
  layout: CmsSlotLayoutSchema.nullable().optional(),
  layouts: z.array(CmsSlotLayoutSchema).optional(),
});

export type CmsSlotPayload = z.infer<typeof CmsSlotPayloadSchema>;

export const CmsSlotApiEnvelopeSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: CmsSlotPayloadSchema,
  timestamp: z.string().optional(),
});

export type CmsSlotApiEnvelope = z.infer<typeof CmsSlotApiEnvelopeSchema>;

export type CmsSlotLayout = NonNullable<CmsSlotPayload['layout']>;

export type { FooterConfig, HeaderConfig, LayoutItem };
