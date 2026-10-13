/**
 * Clone a value into JSON-safe props for Client Components.
 *
 * Production Flight serialization rejects some `undefined` object fields that
 * `next dev` accepts. `unstable_cache` already JSON-clones on cache hit, so a
 * cache miss (or an uncached PDP fetch) must match that shape.
 *
 * @param value - Server data passed into a Client Component.
 * @returns Deep clone with `undefined` keys omitted and `null` preserved.
 */
export function toClientProps<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
