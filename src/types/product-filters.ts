export type ProductFilterApiType = 'PRICE_RANGE' | 'LIST';

export interface ProductFilterPriceInput {
  price: {
    min: number;
    max: number;
  };
}

export interface ProductFilterProductTypeInput {
  productType: string;
}

export interface ProductFilterMetafieldInput {
  productMetafield: {
    namespace: string;
    key: string;
    value: string;
  };
}

export interface ProductFilterVariantOptionInput {
  variantOption: {
    name: string;
    value: string;
  };
}

export type ProductFilterApiInput =
  | ProductFilterPriceInput
  | ProductFilterProductTypeInput
  | ProductFilterMetafieldInput
  | ProductFilterVariantOptionInput;

export interface ProductFilterApiValue {
  id: string;
  label: string;
  count: number;
  input: ProductFilterApiInput;
}

export interface ProductFilterApiGroup {
  id: string;
  label: string;
  type: ProductFilterApiType;
  values: ProductFilterApiValue[];
}

export interface AvailableProductFiltersApiResponse {
  filters: ProductFilterApiGroup[];
}

export interface CollectionProductListApiResponse {
  available_filters?: AvailableProductFiltersApiResponse | ProductFilterApiGroup[];
  current_filters?: Record<string, string[] | number | string>;
  sort_by?: string | null;
}
