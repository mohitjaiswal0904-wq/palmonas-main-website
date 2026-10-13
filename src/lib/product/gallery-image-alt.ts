/**
 * Builds the alt text for one product gallery slide.
 *
 * @param productName - Product display name.
 * @param index - Zero-based slide index; the first image stands for the product itself.
 * @returns Alt text that stays unique per slide.
 */
export function galleryImageAlt(productName: string, index: number): string {
  return index === 0 ? productName : `${productName} - ${index + 1}`;
}
