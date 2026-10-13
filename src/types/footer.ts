import { z } from 'zod';

export const FooterLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export type FooterLink = z.infer<typeof FooterLinkSchema>;

export const FooterColumnSchema = z.object({
  title: z.string(),
  links: z.array(FooterLinkSchema),
});

export type FooterColumn = z.infer<typeof FooterColumnSchema>;

export const FooterDataSchema = z.object({
  columns: z.array(FooterColumnSchema),
  copyright: z.string().optional(),
});

export type FooterData = z.infer<typeof FooterDataSchema>;
