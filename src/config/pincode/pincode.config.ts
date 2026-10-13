import rawConfig from '@/config/pincode/pincode.config.json';

type PincodeConfigJson = typeof rawConfig;

export const pincodeConfig = rawConfig as PincodeConfigJson;

export const pincodeMessages = pincodeConfig.messages;

export const DELIVERY_PINCODE_STORAGE_KEY = pincodeConfig.constants.deliveryPincodeStorageKey;

/** India Post pincode lookup API base URL. */
export const POSTAL_PINCODE_API_BASE_URL = pincodeConfig.api.baseUrl;

export const POSTAL_PINCODE_API_TIMEOUT_MS = pincodeConfig.constants.apiTimeoutMs;
