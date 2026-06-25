import type { PaginationMeta } from "./api";

/* ---------- sub-shapes ---------- */

export interface CollectionImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface VariantPrice {
  amount: string;
  currency_code: string;
}

export interface CollectionProductVariant {
  id: string;
  title: string;
  available_for_sale: boolean;
  price: VariantPrice;
  compare_at_price: VariantPrice | null;
  sku: string | null;
  barcode: string | null;
  quantity_available: number;
  image: CollectionImage | null;
  selected_options: SelectedOption[];
  metafields: unknown[];
}

export interface CollectionProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  description_html: string | null;
  vendor: string | null;
  product_type: string | null;
  tags: string[] | null;
  available_for_sale: boolean;
  created_at: string | null;
  updated_at: string | null;
  images: CollectionImage[];
  variants: CollectionProductVariant[];
  price_range: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  metafields: unknown | null;
  cart: { is_in_cart: boolean; quantity: number };
  in_wishlist: boolean;
}

/* ---------- collection detail ---------- */

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  description_html: string;
  image: CollectionImage | null;
  products: CollectionProduct[];
}

export interface CollectionDetailData {
  collection: Collection;
}

/* ---------- collections list ---------- */

export interface CollectionSummary {
  id: string;
  title: string;
  handle: string;
  image: CollectionImage | null;
}

export interface CollectionsListData extends PaginationMeta {
  collections: CollectionSummary[];
}
