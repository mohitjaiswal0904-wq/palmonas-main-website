import { gokwikAnalyticsEvents } from '@/config/analytics/analytics.config';
import type { AnalyticsEventDetail, AnalyticsPropertyValue } from '@/types/analytics';

/** Parsed GoKwik pixel / checkout event. */
export interface GokwikAnalyticsEvent {
  eventName: string;
  data: Record<string, unknown>;
}

/**
 * Reads a nested object when the value is a plain record.
 *
 * @param value - Unknown payload value.
 * @returns Record when the value is a non-null object.
 */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

/**
 * Reads a non-empty string from a record key.
 *
 * @param record - Source object.
 * @param key - Property name.
 */
function readTrimmedString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

/**
 * Reads a finite number from common price keys.
 *
 * @param record - Order / event payload.
 */
function readAmount(record: Record<string, unknown>): number | undefined {
  const candidates = [
    record.total_price,
    record.totalPrice,
    record.value,
    record.amount,
    record.total,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim()) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

/**
 * Reads the GoKwik / Shopify order id from a payload.
 *
 * @param record - Event data object.
 */
export function readGokwikOrderId(record: Record<string, unknown>): string | undefined {
  return (
    readTrimmedString(record, 'Order Id') ??
    readTrimmedString(record, 'order_id') ??
    readTrimmedString(record, 'orderId') ??
    readTrimmedString(record, 'order_name') ??
    readTrimmedString(record, 'orderNumber') ??
    readTrimmedString(record, 'id')
  );
}

/**
 * Parses Shopify-style `gokwik_events` (`customData.name` + `customData.data.data`).
 *
 * @param raw - CustomEvent detail, postMessage data, or pixel event.
 * @returns Event name + data, or null when the payload is not a GoKwik event.
 */
export function parseGokwikAnalyticsEvent(raw: unknown): GokwikAnalyticsEvent | null {
  const root = asRecord(raw);
  if (!root) {
    return null;
  }

  const customData = asRecord(root.customData);
  const customName = customData ? readTrimmedString(customData, 'name') : undefined;

  if (customData && customName) {
    const customPayload = asRecord(customData.data);
    const nestedData = customPayload ? asRecord(customPayload.data) : null;
    return {
      eventName: customName,
      data: nestedData ?? customPayload ?? {},
    };
  }

  const channel = readTrimmedString(root, 'event') ?? readTrimmedString(root, 'eventName');
  if (channel === gokwikAnalyticsEvents.channel) {
    const payload = asRecord(root.data) ?? asRecord(root.detail);
    return parseGokwikAnalyticsEvent(payload ?? root);
  }

  const analyticsName = readTrimmedString(root, 'analyticsName');
  const eventName =
    readTrimmedString(root, 'eventname') ??
    readTrimmedString(root, 'eventName') ??
    (analyticsName && analyticsName !== 'shopifyAnalytics' && analyticsName !== 'edgeTag'
      ? analyticsName
      : undefined) ??
    (channel && channel !== 'message' ? channel : undefined);

  if (!eventName) {
    return null;
  }

  const data = asRecord(root.data) ?? asRecord(root.detail) ?? asRecord(root.payload) ?? root;

  return { eventName, data };
}

/**
 * Normalises a GoKwik event name so it always ends with `_gk`.
 * Trailing `GK` becomes `_gk` (`Order_Placed_GK` → `Order_Placed_gk`).
 *
 * @param eventName - Raw GoKwik event name.
 * @returns Event name ending in `_gk`.
 */
export function toGokwikTrackedEventName(eventName: string): string {
  const trimmed = eventName.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (trimmed.endsWith('_gk')) {
    return trimmed;
  }
  if (trimmed.endsWith('GK')) {
    return `${trimmed.slice(0, -2).replace(/_$/, '')}_gk`;
  }
  return `${trimmed}_gk`;
}

/**
 * Builds a Mixpanel-ready analytics event from a parsed GoKwik pixel event.
 *
 * @param event - Parsed GoKwik event.
 * @returns Canonical track payload (`Order_Placed_GK` includes value / currency / order_id).
 */
export function buildGokwikMixpanelEvent(event: GokwikAnalyticsEvent): AnalyticsEventDetail {
  const name = toGokwikTrackedEventName(event.eventName);

  if (event.eventName === gokwikAnalyticsEvents.orderPlaced) {
    const orderId = readGokwikOrderId(event.data);
    const value = readAmount(event.data);
    const currency = readTrimmedString(event.data, 'currency') ?? 'INR';
    const properties: Record<string, AnalyticsPropertyValue> = {};
    if (orderId) {
      properties.order_id = orderId;
    }

    return {
      name,
      properties,
      ...(value !== undefined ? { value } : {}),
      currency,
      passthroughEventName: true,
    };
  }

  return {
    name,
    properties: toScalarAnalyticsProperties(event.data),
    passthroughEventName: true,
  };
}

/**
 * Copies scalar GoKwik payload fields onto an analytics properties object.
 *
 * @param data - Parsed GoKwik event data.
 */
function toScalarAnalyticsProperties(
  data: Record<string, unknown>,
): Record<string, AnalyticsPropertyValue> {
  const properties: Record<string, AnalyticsPropertyValue> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      properties[key] = value;
    }
  }
  return properties;
}
