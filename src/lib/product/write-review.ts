import { productConfig } from '@/config/product/product.config';
import type { ProductReviewStarRating } from '@/types/product/reviews';

const writeConfig = productConfig.reviews.write;

/** Client-side validation error keys for the write-review form. */
export type WriteReviewValidationError =
  | 'ratingRequired'
  | 'bodyTooShort'
  | 'bodyTooLong'
  | 'fileType'
  | 'fileTooLarge';

export interface WriteReviewFormValues {
  rating: ProductReviewStarRating | null;
  body: string;
  image: File | null;
}

/**
 * Validate write-review form values against product config limits.
 *
 * @param values - Current form state.
 * @returns First validation error key, or null when valid.
 */
export function validateWriteReviewForm(
  values: WriteReviewFormValues,
): WriteReviewValidationError | null {
  if (values.rating === null) {
    return 'ratingRequired';
  }

  const trimmed = values.body.trim();

  if (trimmed.length < writeConfig.minBodyLength) {
    return 'bodyTooShort';
  }

  if (trimmed.length > writeConfig.maxBodyLength) {
    return 'bodyTooLong';
  }

  if (values.image) {
    const mime = values.image.type.toLowerCase();
    const allowed = writeConfig.acceptedMimeTypes.map((type) => type.toLowerCase());

    if (!allowed.includes(mime)) {
      return 'fileType';
    }

    if (values.image.size > writeConfig.maxFileBytes) {
      return 'fileTooLarge';
    }
  }

  return null;
}

/**
 * Whether the submit button should be enabled (rating set + body meets min length).
 *
 * @param values - Current form state.
 * @returns True when the form looks ready to submit.
 */
export function isWriteReviewSubmitEnabled(values: WriteReviewFormValues): boolean {
  return values.rating !== null && values.body.trim().length >= writeConfig.minBodyLength;
}
