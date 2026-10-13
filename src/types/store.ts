export interface StoreImage {
  id: number;
  image_url: string;
  display_order: number;
}

export interface Store {
  id: number;
  name: string;
  code: string;
  type: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mapLink?: string;
  timing?: string;
  images: StoreImage[];
}

export interface StoresResponse {
  stores: Store[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
}

export interface StoreListParams {
  images?: boolean;
  limit: number;
  page: number;
  search?: string;
}

export type StoreListQueryParams = Omit<StoreListParams, 'page'>;

export interface StoreApiResponse {
  id: number;
  store_name: string;
  store_code: string;
  store_type: string;
  contact_phone?: string;
  contact_email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  map_link?: string;
  timing?: string;
  images?: StoreImage[];
  is_active: boolean;
}

export interface StoresApiResponse {
  stores: StoreApiResponse[];
  total: number;
  page: number;
  total_pages: number;
  has_next: boolean;
}

export function transformStore(store: StoreApiResponse): Store {
  return {
    id: store.id,
    name: store.store_name,
    code: store.store_code,
    type: store.store_type,
    phone: store.contact_phone,
    email: store.contact_email,
    address: store.address,
    city: store.city.trim(),
    state: store.state,
    country: store.country,
    pincode: store.pincode,
    mapLink: store.map_link || undefined,
    timing: store.timing,
    images: (store.images ?? [])
      .filter((image) => Boolean(image.image_url))
      .sort((firstImage, secondImage) => firstImage.display_order - secondImage.display_order),
  };
}

export function transformStoresResponse(response: StoresApiResponse): StoresResponse {
  return {
    stores: response.stores.filter((store) => store.is_active).map(transformStore),
    total: response.total,
    page: response.page,
    totalPages: response.total_pages,
    hasNext: response.has_next,
  };
}
