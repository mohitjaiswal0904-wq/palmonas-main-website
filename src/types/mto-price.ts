import { z } from 'zod';

interface MtoPriceApiResponse {
  base_price?: number;
  diamond_price?: number;
  diamond_weight_carrot?: number;
  flat_discount?: number;
  gold_weight_grams?: number;
  gst?: number;
  last_price_update?: string;
  making_charge?: number;
  making_charge_cut?: number;
  making_charge_show?: number;
  metal?: string;
  no_of_diamonds?: number;
  price_per_gram?: number;
  purity?: string;
  purity_display?: string;
  purity_ratio?: number;
  show_calculation?: boolean;
  show_making_charge_discount?: boolean;
  status?: string;
  subtotal?: number;
  timestamp?: string;
  title?: string;
  total_price?: number;
  total_price_without_making?: number;
}

export const MtoPriceSchema = z.object({
  basePrice: z.number(),
  diamondPrice: z.number(),
  diamondWeightCarat: z.number(),
  flatDiscount: z.number(),
  goldWeightGrams: z.number(),
  gst: z.number(),
  lastPriceUpdate: z.string().optional(),
  makingCharge: z.number(),
  makingChargeCut: z.number(),
  makingChargeShow: z.number(),
  metal: z.string(),
  noOfDiamonds: z.number(),
  pricePerGram: z.number(),
  purity: z.string(),
  purityDisplay: z.string(),
  purityRatio: z.number(),
  showCalculation: z.boolean(),
  showMakingChargeDiscount: z.boolean(),
  status: z.string(),
  subtotal: z.number(),
  timestamp: z.string().optional(),
  title: z.string(),
  totalPrice: z.number(),
  totalPriceWithoutMaking: z.number(),
});

export type MtoPrice = z.infer<typeof MtoPriceSchema>;

export interface MtoPriceParams {
  sku: string;
  purity: string;
}

function toNumber(value: number | undefined): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
}

export function transformMtoPrice(raw: MtoPriceApiResponse): MtoPrice {
  return {
    basePrice: toNumber(raw.base_price),
    diamondPrice: toNumber(raw.diamond_price),
    diamondWeightCarat: toNumber(raw.diamond_weight_carrot),
    flatDiscount: toNumber(raw.flat_discount),
    goldWeightGrams: toNumber(raw.gold_weight_grams),
    gst: toNumber(raw.gst),
    lastPriceUpdate: raw.last_price_update,
    makingCharge: toNumber(raw.making_charge),
    makingChargeCut: toNumber(raw.making_charge_cut),
    makingChargeShow: toNumber(raw.making_charge_show),
    metal: raw.metal ?? '',
    noOfDiamonds: toNumber(raw.no_of_diamonds),
    pricePerGram: toNumber(raw.price_per_gram),
    purity: raw.purity ?? '',
    purityDisplay: raw.purity_display ?? '',
    purityRatio: toNumber(raw.purity_ratio),
    showCalculation: raw.show_calculation ?? false,
    showMakingChargeDiscount: raw.show_making_charge_discount ?? false,
    status: raw.status ?? '',
    subtotal: toNumber(raw.subtotal),
    timestamp: raw.timestamp,
    title: raw.title ?? '',
    totalPrice: toNumber(raw.total_price),
    totalPriceWithoutMaking: toNumber(raw.total_price_without_making),
  };
}
