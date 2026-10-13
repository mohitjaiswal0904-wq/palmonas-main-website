/** Client-only — calls Palmonas MTO pricing utils API via @/lib/mto-api. */
import { normaliseError } from '@/lib/errors';
import { mtoApi } from '@/lib/mto-api';
import { transformMtoPrice, type MtoPrice, type MtoPriceParams } from '@/types/mto-price';

export async function getMtoPrice(params: MtoPriceParams): Promise<MtoPrice> {
  try {
    const { data } = await mtoApi.get('/api/mto/price', {
      params: {
        sku: params.sku,
        purity: params.purity,
      },
    });

    return transformMtoPrice(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
