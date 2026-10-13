import rawConfig from '@/config/pop/pop-personal-details.config.json';

type PopPersonalDetailsConfigJson = typeof rawConfig;

export const popPersonalDetailsConfig = rawConfig as PopPersonalDetailsConfigJson;

export const popPersonalDetailsMessages = popPersonalDetailsConfig.messages;
