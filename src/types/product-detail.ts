/* ---------- sub-shapes ---------- */

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface PriceAmount {
  amount: string;
  currencyCode: string;
}

export interface ProductOffer {
  key: string;
  name: string;
  description: string;
  code: string;
  type: string;
  discount_value: number | null;
}

export interface ProductTag {
  name: string;
  value: string;
}

export interface ProductDelivery {
  text: string;
  buttonText: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  textColor: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: { amount: string; currency_code: string };
  compare_at_price: { amount: string; currency_code: string } | null;
  available_for_sale: boolean;
  sku: string | null;
  quantity_available: number;
  selected_options: { name: string; value: string }[];
}

/* ---------- product detail ---------- */

export interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
  priceRange: {
    minVariantPrice: PriceAmount;
    maxVariantPrice: PriceAmount;
  };
  offers: ProductOffer[];
  images: ProductImage[];
  specifications: string;
  supplier_info: string;
  return_info: string;
  product_tags: ProductTag[];
  delivery: ProductDelivery;
  cart: { is_in_cart: boolean; quantity: number };
  in_wishlist: boolean;
}

export interface ProductDetailData {
  product: ProductDetail;
  discount_info: ProductOffer[];
  reviews: { avg_rating: string; review_count: string };
  metafields: {
    id: string;
    namespace: string;
    key: string;
    value: string;
    type: string;
    description: string | null;
  }[];
}
