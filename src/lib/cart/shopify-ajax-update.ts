import { extractNumericId, type ShopifyCart, type ShopifyCartLine } from '@/types/cart';

/** Shopify Ajax `/cart/update.js` line that may include a classic `key`. */
type AjaxShopifyCartLine = ShopifyCartLine & { key?: string };

/** Optional Ajax fields the v2 cart may include beyond the Storefront shape. */
type ShopifyCartWithAjaxFields = ShopifyCart & {
  note?: string | null;
  token?: string;
  attributes?: Record<string, unknown> | Array<{ key?: string; value?: unknown }>;
};

/** Quantity delta for a variant in `/cart/update.js` `items_changelog`. */
export interface ShopifyAjaxItemsChangelogEntry {
  variant_id: number;
  quantity: number;
}

/** Line update or remove derived from a Shopify Ajax `updates` map. */
export interface ShopifyAjaxLineMutation {
  id: string;
  quantity: number;
}

/**
 * Parses a Shopify Ajax JSON body into `{ lineKey: quantity }`.
 *
 * @param body - `{ updates: { ... } }` or a bare updates map.
 * @returns Quantity by variant id or `variant:unique` line key.
 * @throws Error when the body is not an object.
 */
export function parseShopifyAjaxUpdatesJson(body: unknown): Record<string, number> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Invalid cart update payload');
  }

  const record = body as Record<string, unknown>;
  const raw =
    record.updates && typeof record.updates === 'object' && !Array.isArray(record.updates)
      ? (record.updates as Record<string, unknown>)
      : record;

  return toQuantityMap(raw);
}

/**
 * Parses Shopify Ajax form fields (`updates[variant:key]=qty`).
 *
 * @param form - Request form data.
 * @returns Quantity by line key.
 */
export function parseShopifyAjaxUpdatesForm(form: FormData): Record<string, number> {
  const raw: Record<string, unknown> = {};
  for (const [name, value] of form.entries()) {
    const match = /^updates\[(.+)\]$/.exec(name);
    if (!match?.[1] || typeof value !== 'string') {
      continue;
    }
    raw[match[1]] = value;
  }
  return toQuantityMap(raw);
}

/**
 * Resolves v2 line mutations from a Shopify Ajax `updates` map.
 *
 * @param lines - Current cart lines.
 * @param updates - Quantity by variant id or classic line key.
 * @returns Positive-qty line updates and zero-qty removes.
 */
export function resolveShopifyAjaxLineMutations(
  lines: ShopifyCartLine[],
  updates: Record<string, number>,
): { updates: ShopifyAjaxLineMutation[]; removes: string[] } {
  const nextUpdates: ShopifyAjaxLineMutation[] = [];
  const removes: string[] = [];
  const seen = new Set<string>();

  for (const [key, quantity] of Object.entries(updates)) {
    const matched = lines.filter((line) => !seen.has(line.id) && lineMatchesAjaxKey(line, key));
    const targets =
      matched.length > 0
        ? matched
        : lines.filter((line) => !seen.has(line.id) && lineMatchesVariantPart(line, key));

    for (const line of targets) {
      seen.add(line.id);
      if (quantity <= 0) {
        removes.push(line.id);
      } else {
        nextUpdates.push({ id: line.id, quantity });
      }
    }
  }

  return { updates: nextUpdates, removes };
}

/**
 * Maps a v2 Shopify cart into the Ajax `/cart.js` JSON shape.
 *
 * @param cart - Raw cart from the Palmonas v2 API.
 * @param options - Previous cart used to build `items_changelog`.
 * @returns Shopify Ajax cart payload.
 */
export function toShopifyAjaxCart(
  cart: ShopifyCart,
  options?: {
    previous?: ShopifyCart;
    requestKeys?: string[];
    attributes?: Record<string, unknown>;
  },
): Record<string, unknown> {
  const ajaxCart = cart as ShopifyCartWithAjaxFields;
  const totalRupees = parseAmount(cart.cost.totalAmount.amount);
  const subtotalRupees = parseAmount(cart.cost.subtotalAmount.amount);

  return {
    token: toShopifyAjaxCartToken(ajaxCart),
    note: ajaxCart.note?.trim() ? ajaxCart.note : '',
    attributes: toShopifyAjaxAttributes({
      ...normalizeCartAttributes(ajaxCart.attributes),
      ...options?.attributes,
    }),
    original_total_price: rupeesToPaise(subtotalRupees),
    total_price: rupeesToPaise(totalRupees),
    total_discount: rupeesToPaise(Math.max(0, subtotalRupees - totalRupees)),
    total_weight: 0,
    item_count: cart.totalQuantity,
    items: cart.lines.map((line) => toShopifyAjaxCartItem(line, options?.requestKeys)),
    items_changelog: toShopifyAjaxItemsChangelog(options?.previous ?? cart, cart),
    requires_shipping: true,
    currency: cart.cost.totalAmount.currencyCode || 'INR',
    items_subtotal_price: rupeesToPaise(subtotalRupees),
    cart_level_discount_applications: [],
    discount_codes: [],
  };
}

/**
 * Reads cart attributes from a Shopify Ajax update body.
 *
 * @param body - JSON `{ attributes: { ... } }` payload.
 * @returns Attribute map, or empty when missing.
 */
export function parseShopifyAjaxAttributes(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {};
  }

  const raw = (body as { attributes?: unknown }).attributes;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  return raw as Record<string, unknown>;
}

/**
 * Returns true when a cart line is the target of a Shopify Ajax update key.
 *
 * @param line - Cart line from the v2 API.
 * @param key - Variant id or `variant:unique` key.
 */
export function lineMatchesAjaxKey(line: ShopifyCartLine, key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) {
    return false;
  }

  const ajaxLine = line as AjaxShopifyCartLine;
  const lineKey = ajaxLine.key?.trim() ?? '';
  if (lineKey === trimmed || line.id === trimmed) {
    return true;
  }
  if (extractNumericId(line.id) === trimmed) {
    return true;
  }

  const colon = trimmed.indexOf(':');
  const variantPart = colon === -1 ? trimmed : trimmed.slice(0, colon);
  const uniquePart = colon === -1 ? '' : trimmed.slice(colon + 1);
  const variantId = extractNumericId(line.merchandise.id);

  if (uniquePart) {
    return lineKey === trimmed || line.id.includes(uniquePart) || lineKey.includes(uniquePart);
  }

  return variantId === variantPart;
}

/**
 * Returns true when the key's variant id matches the line (ignores `:unique` suffix).
 *
 * @param line - Cart line from the v2 API.
 * @param key - Variant id or `variant:unique` key.
 */
function lineMatchesVariantPart(line: ShopifyCartLine, key: string): boolean {
  const variantPart = key.trim().split(':')[0] ?? '';
  return Boolean(variantPart) && extractNumericId(line.merchandise.id) === variantPart;
}

/**
 * Converts a raw updates object into integer quantities, dropping invalid rows.
 *
 * @param raw - Key/value map from JSON or form fields.
 */
function toQuantityMap(raw: Record<string, unknown>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'updates') {
      continue;
    }
    const quantity = typeof value === 'number' ? value : Number(value);
    if (!key.trim() || !Number.isFinite(quantity) || quantity < 0) {
      continue;
    }
    result[key] = Math.floor(quantity);
  }
  return result;
}

/**
 * Builds one Shopify Ajax line item from a v2 cart line.
 *
 * @param line - Raw cart line.
 */
function toShopifyAjaxCartItem(
  line: ShopifyCartLine,
  requestKeys?: string[],
): Record<string, unknown> {
  const unitRupees = parseAmount(
    line.cost?.amountPerQuantity?.amount ?? line.merchandise.priceV2?.amount ?? '0',
  );
  const lineRupees = parseAmount(
    line.cost?.totalAmount.amount ?? String(unitRupees * line.quantity),
  );
  const variantId =
    Number(extractNumericId(line.merchandise.id)) || extractNumericId(line.merchandise.id);
  const productId = Number(extractNumericId(line.merchandise.product.id ?? '')) || 0;
  const handle = line.merchandise.product.handle || '';
  const image = line.merchandise.product.featuredImage?.url ?? '';
  const unitPaise = rupeesToPaise(unitRupees);
  const linePaise = rupeesToPaise(lineRupees);

  return {
    id: variantId,
    properties: {},
    quantity: line.quantity,
    variant_id: variantId,
    key: resolveAjaxLineKey(line, requestKeys),
    title: line.merchandise.product.title || '',
    product_title: line.merchandise.product.title || '',
    variant_title: line.merchandise.title || '',
    handle,
    url: handle ? `/products/${handle}` : '',
    image,
    featured_image: image ? { url: image } : null,
    product_id: productId,
    sku: '',
    vendor: '',
    grams: 0,
    taxable: true,
    gift_card: false,
    requires_shipping: true,
    price: unitPaise,
    original_price: unitPaise,
    discounted_price: unitPaise,
    final_price: unitPaise,
    line_price: linePaise,
    original_line_price: linePaise,
    final_line_price: linePaise,
    total_discount: 0,
    discounts: [],
    line_level_discount_allocations: [],
    line_level_total_discount: 0,
  };
}

/**
 * Returns the classic Ajax line key (`variant:unique`) for later `/cart/update.js` calls.
 *
 * @param line - Raw cart line.
 */
function resolveAjaxLineKey(line: ShopifyCartLine, requestKeys?: string[]): string {
  const matched = requestKeys?.find(
    (key) => lineMatchesAjaxKey(line, key) || lineMatchesVariantPart(line, key),
  );
  if (matched?.trim()) {
    return matched.trim();
  }

  return ajaxLineKey(line);
}

function ajaxLineKey(line: ShopifyCartLine): string {
  const ajaxLine = line as AjaxShopifyCartLine;
  if (ajaxLine.key?.trim()) {
    return ajaxLine.key.trim();
  }
  const variant = extractNumericId(line.merchandise.id);
  const unique = extractNumericId(line.id);
  return `${variant}:${unique}`;
}

/**
 * Builds a classic Shopify Ajax cart token, keeping `?key=`.
 *
 * @param cart - Raw cart that may use a GID id or a `token` field.
 */
function toShopifyAjaxCartToken(cart: ShopifyCartWithAjaxFields): string {
  const raw = cart.token?.trim() || cart.id;
  return raw.replace(/^gid:\/\/shopify\/Cart\//, '');
}

/**
 * Maps cart attributes into an Ajax object and drops GoKwik checkout keys.
 *
 * @param raw - Object map or Storefront `{ key, value }` list.
 */
function toShopifyAjaxAttributes(
  raw: ShopifyCartWithAjaxFields['attributes'],
): Record<string, unknown> {
  const attributes = normalizeCartAttributes(raw);
  return Object.fromEntries(
    Object.entries(attributes).filter(([key]) => !isGokwikCartAttribute(key)),
  );
}

/**
 * Returns true for GoKwik cart attributes (`GoKwik-Cart`, `_gk_*`).
 *
 * @param key - Attribute name.
 */
function isGokwikCartAttribute(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return normalized === 'gokwik-cart' || normalized.startsWith('_gk_');
}

/**
 * Normalises cart attributes to a key/value object.
 *
 * @param raw - Object map or `{ key, value }` list.
 */
function normalizeCartAttributes(
  raw: ShopifyCartWithAjaxFields['attributes'],
): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  if (Array.isArray(raw)) {
    const result: Record<string, unknown> = {};
    for (const entry of raw) {
      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      if (key) {
        result[key] = entry.value;
      }
    }
    return result;
  }

  return raw;
}

/**
 * Diffs line quantities into Shopify Ajax `items_changelog`.
 *
 * @param previous - Cart before the update.
 * @param next - Cart after the update.
 */
function toShopifyAjaxItemsChangelog(
  previous: ShopifyCart,
  next: ShopifyCart,
): { added: ShopifyAjaxItemsChangelogEntry[]; removed: ShopifyAjaxItemsChangelogEntry[] } {
  const previousQty = quantityByVariantId(previous);
  const nextQty = quantityByVariantId(next);
  const added: ShopifyAjaxItemsChangelogEntry[] = [];
  const removed: ShopifyAjaxItemsChangelogEntry[] = [];
  const variantIds = new Set([...previousQty.keys(), ...nextQty.keys()]);

  for (const variantId of variantIds) {
    const delta = (nextQty.get(variantId) ?? 0) - (previousQty.get(variantId) ?? 0);
    if (delta > 0) {
      added.push({ variant_id: variantId, quantity: delta });
    } else if (delta < 0) {
      removed.push({ variant_id: variantId, quantity: -delta });
    }
  }

  return { added, removed };
}

/**
 * Sums line quantities by numeric variant id.
 *
 * @param cart - Raw cart.
 */
function quantityByVariantId(cart: ShopifyCart): Map<number, number> {
  const quantities = new Map<number, number>();
  for (const line of cart.lines) {
    const variantId = Number(extractNumericId(line.merchandise.id));
    if (!Number.isFinite(variantId) || variantId <= 0) {
      continue;
    }
    quantities.set(variantId, (quantities.get(variantId) ?? 0) + line.quantity);
  }
  return quantities;
}

/**
 * Parses a money amount string into rupees.
 *
 * @param amount - API amount string.
 */
function parseAmount(amount: string): number {
  const value = Number.parseFloat(amount);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Converts rupees to Shopify Ajax paise/cents.
 *
 * @param rupees - Amount in rupees.
 */
function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
