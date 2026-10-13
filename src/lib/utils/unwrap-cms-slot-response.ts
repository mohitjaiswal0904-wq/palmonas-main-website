import {
  CmsSlotApiEnvelopeSchema,
  CmsSlotPayloadSchema,
  type CmsSlotPayload,
} from '@/types/cms-slot';

/**
 * Coerce CMS `null` margin/padding sides to omitted keys.
 * Otherwise FooterConfigSchema fails and the slot union falls through to HeaderConfigSchema,
 * which strips `heading_color` / newsletter fields (white-on-white footer text).
 */
export function sanitizeLayoutSpacingConfig(config: unknown): unknown {
  if (typeof config !== 'object' || config === null) {
    return config;
  }

  const next: Record<string, unknown> = { ...(config as Record<string, unknown>) };

  for (const key of ['margin', 'padding'] as const) {
    const spacing = next[key];
    if (typeof spacing !== 'object' || spacing === null) {
      continue;
    }

    const sides: Record<string, unknown> = { ...(spacing as Record<string, unknown>) };
    for (const side of Object.keys(sides)) {
      if (sides[side] === null) {
        delete sides[side];
      }
    }
    next[key] = sides;
  }

  return next;
}

function sanitizeLayoutRecord(layout: Record<string, unknown>): Record<string, unknown> {
  const next = { ...layout };

  if (next.rows === null) {
    delete next.rows;
  }

  if (next.config !== undefined) {
    next.config = sanitizeLayoutSpacingConfig(next.config);
  }

  return next;
}

/** Normalizes CMS payloads before Zod parse (flat layout shape, rows: null). */
export function normalizeCmsSlotPayload(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const record = input as Record<string, unknown>;
  let payload: Record<string, unknown> = { ...record };

  const hasFlatLayout =
    typeof payload.slot === 'string' &&
    payload.layout === undefined &&
    (payload.config !== undefined || payload.items !== undefined);

  if (hasFlatLayout) {
    const {
      config,
      items,
      layout_id: layoutId,
      name,
      stack_order: stackOrder,
      rows,
      slot,
      ...rest
    } = payload;

    payload = {
      ...rest,
      slot,
      layout: {
        layout_id: layoutId,
        name,
        slot,
        stack_order: stackOrder,
        config,
        items,
        ...(rows != null ? { rows } : {}),
      },
    };
  }

  if (payload.layout && typeof payload.layout === 'object' && payload.layout !== null) {
    payload = {
      ...payload,
      layout: sanitizeLayoutRecord(payload.layout as Record<string, unknown>),
    };
  }

  return payload;
}

export function unwrapCmsSlotResponse(raw: unknown): CmsSlotPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid CMS slot response');
  }

  if ('status' in raw && 'data' in raw) {
    const envelope = CmsSlotApiEnvelopeSchema.parse({
      ...raw,
      data: normalizeCmsSlotPayload((raw as { data: unknown }).data),
    });

    return envelope.data;
  }

  if ('slot' in raw) {
    return CmsSlotPayloadSchema.parse(normalizeCmsSlotPayload(raw));
  }

  if ('data' in raw) {
    return CmsSlotPayloadSchema.parse(normalizeCmsSlotPayload((raw as { data: unknown }).data));
  }

  throw new Error('Invalid CMS slot response shape');
}
