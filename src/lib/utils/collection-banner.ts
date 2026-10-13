/**
 * True when collection has a non-empty banner URL.
 *
 * @param collection - Collection fields that may include `image`.
 */
export function hasCollectionBannerImage(collection: { image?: string }): boolean {
  return Boolean(collection.image?.trim());
}
