import { z } from 'zod';

export const GoldProductDetailsRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type GoldProductDetailsRow = z.infer<typeof GoldProductDetailsRowSchema>;

export const GoldProductDetailsSectionSchema = z.object({
  title: z.string(),
  rows: z.array(GoldProductDetailsRowSchema),
});

export type GoldProductDetailsSection = z.infer<typeof GoldProductDetailsSectionSchema>;

export const GoldProductDetailsSchema = z.object({
  sections: z.array(GoldProductDetailsSectionSchema),
});

export type GoldProductDetails = z.infer<typeof GoldProductDetailsSchema>;

export const GoldVariantDetailsSchema = z.object({
  metalType: z.string().optional(),
  purity: z.string().optional(),
  colour: z.string().optional(),
  netWeight: z.string().optional(),
  diamondShape: z.string().optional(),
  diamondClarity: z.string().optional(),
  diamondCount: z.string().optional(),
  diamondWeight: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  grossWeight: z.string().optional(),
});

export type GoldVariantDetails = z.infer<typeof GoldVariantDetailsSchema>;
