import rawConfig from '@/config/address/address.config.json';

type AddressConfigJson = typeof rawConfig;

export const addressConfig = rawConfig as AddressConfigJson;

export const addressMessages = addressConfig.messages;

/** Address form country options. */
export const ADDRESS_COUNTRY_OPTIONS = addressConfig.countries;

/** Indian states and union territories for the address form. */
export const ADDRESS_STATE_OPTIONS = addressConfig.states;

/** Default province when not collected in the form (API accepts empty). */
export const ADDRESS_DEFAULT_PROVINCE = '';
