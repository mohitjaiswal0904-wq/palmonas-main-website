'use client';

import { useCallback, useId, useRef, useState } from 'react';

import { PincodeInfoIcon } from '@/components/icons/PincodeInfoIcon';
import { ReviewStarFilled30Icon, ReviewStarOutline30Icon } from '@/components/icons/review-icons';
import {
  isProductFeatureEnabled,
  productConfig,
  productMessages,
} from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import {
  isWriteReviewSubmitEnabled,
  validateWriteReviewForm,
  type WriteReviewValidationError,
} from '@/lib/product/write-review';
import type { CreateProductReviewInput, ProductReviewStarRating } from '@/types/product/reviews';

interface WriteReviewFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateProductReviewInput) => Promise<void>;
}

/**
 * Shared write-review form body (rating, body, optional image) + Cancel/Submit.
 */
export function WriteReviewForm({ isSubmitting, onCancel, onSubmit }: WriteReviewFormProps) {
  const writeConfig = productConfig.reviews.write;
  const writeSubmitEnabled = isProductFeatureEnabled('writeProductReview');
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState<ProductReviewStarRating | null>(null);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<WriteReviewValidationError | null>(null);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const resolveValidationMessage = useCallback(
    (error: WriteReviewValidationError): string => {
      switch (error) {
        case 'ratingRequired':
          return productMessages.reviews.validation.ratingRequired;
        case 'bodyTooShort':
          return productMessages.reviews.formatBodyTooShort(writeConfig.minBodyLength);
        case 'bodyTooLong':
          return productMessages.reviews.formatBodyTooLong(writeConfig.maxBodyLength);
        case 'fileType':
          return productMessages.reviews.validation.fileType;
        case 'fileTooLarge':
          return productMessages.reviews.validation.fileTooLarge;
        default:
          return productMessages.reviews.errorToast;
      }
    },
    [writeConfig.maxBodyLength, writeConfig.minBodyLength],
  );

  const handleSubmit = useCallback(async () => {
    // Feature flag off: modal stays open for preview, submit never fires.
    if (!writeSubmitEnabled) {
      return;
    }

    const values = { rating, body, image };
    const error = validateWriteReviewForm(values);

    if (error || rating === null) {
      setValidationError(error ?? 'ratingRequired');
      return;
    }

    setValidationError(null);

    try {
      await onSubmit({
        rating,
        body: body.trim(),
        image: image ?? undefined,
      });
    } catch {
      // Hook surfaces toast; keep form open.
    }
  }, [body, image, onSubmit, rating, writeSubmitEnabled]);

  const submitEnabled =
    writeSubmitEnabled && isWriteReviewSubmitEnabled({ rating, body, image }) && !isSubmitting;

  return (
    <div className="flex flex-col">
      <div className="laptop:px-6 flex flex-col gap-6 px-4 pt-4 pb-6">
        <div>
          <p className="text-sm font-semibold text-[#151515]">
            {productMessages.reviews.ratingLabel}
            <span className="text-[#e0533a]">*</span>
          </p>
          <div
            className="mt-2 flex items-center gap-2"
            role="group"
            aria-label={productMessages.reviews.ratingLabel}
          >
            {([1, 2, 3, 4, 5] as const).map((stars) => {
              const selected = rating !== null && stars <= rating;
              return (
                <button
                  key={stars}
                  type="button"
                  className="inline-flex"
                  aria-label={productMessages.reviews.formatRateStarsLabel(stars)}
                  aria-pressed={rating === stars}
                  onClick={() => {
                    setRating(stars);
                    setValidationError(null);
                  }}
                >
                  {selected ? <ReviewStarFilled30Icon /> : <ReviewStarOutline30Icon />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="write-review-body" className="text-sm font-semibold text-[#151515]">
            {productMessages.reviews.yourReviewLabel}
          </label>
          <textarea
            id="write-review-body"
            value={body}
            maxLength={writeConfig.maxBodyLength}
            onChange={(event) => {
              setBody(event.target.value);
              setValidationError(null);
            }}
            placeholder={productMessages.reviews.reviewPlaceholder}
            className="mt-2 h-[126px] w-full resize-none rounded-lg border border-[#e0e0e0] p-3 text-sm text-[#151515] placeholder:text-[#9a9a9a]"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-[#595959]">
            <span>
              {productMessages.reviews.formatMinCharactersHint(writeConfig.minBodyLength)}
            </span>
            <span>
              {productMessages.reviews.formatCharacterCount(body.length, writeConfig.maxBodyLength)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#151515]">
            {productMessages.reviews.uploadFileLabel}
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#e0e0e0] p-2">
            <label
              htmlFor={fileInputId}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d4d4d4] bg-[#f7f7f7] px-3 py-1.5 text-xs font-medium text-[#404040]"
            >
              {productMessages.reviews.chooseFile}
            </label>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={writeConfig.acceptedExtensions}
              className="sr-only"
              aria-label={productMessages.reviews.a11y.chooseReviewImage}
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setImage(next);
                setValidationError(null);
              }}
            />
            <span className="truncate text-xs text-[#595959]">
              {image?.name ?? productMessages.reviews.noFileChosen}
            </span>
          </div>
          <p className="mt-2 text-xs text-[#595959]">{productMessages.reviews.fileFormatsHint}</p>
        </div>

        {validationError ? (
          <p className="text-sm text-[#d92d20]" role="alert">
            {resolveValidationMessage(validationError)}
          </p>
        ) : null}
      </div>

      <div className="laptop:px-6 flex items-center gap-3 border-t border-[#efefef] px-4 pt-6 pb-6">
        <button
          type="button"
          className="h-11 flex-1 rounded-lg border border-[#151515] text-sm font-medium text-[#151515]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {productMessages.reviews.cancel}
        </button>
        <div className="relative flex flex-1 items-center gap-2">
          {!writeSubmitEnabled ? (
            <div className="group relative shrink-0">
              <button
                type="button"
                className="inline-flex cursor-pointer"
                aria-label={productMessages.reviews.a11y.writeReviewComingSoon}
                aria-expanded={comingSoonOpen}
                onClick={() => setComingSoonOpen((open) => !open)}
              >
                <PincodeInfoIcon />
              </button>
              {/* Desktop: CSS hover tip (no JS). */}
              <div
                className="laptop:group-hover:block pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg p-2.5 shadow-sm"
                style={{ backgroundColor: productTokens.eddTooltipBg }}
                aria-hidden="true"
              >
                <p className="text-xs leading-normal text-[#151515]">
                  {productMessages.reviews.writeReviewComingSoon}
                </p>
              </div>
              {/* Mobile: tap tip. */}
              {comingSoonOpen ? (
                <div
                  className="laptop:hidden absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg p-2.5 shadow-sm"
                  style={{ backgroundColor: productTokens.eddTooltipBg }}
                  role="status"
                >
                  <p className="text-xs leading-normal text-[#151515]">
                    {productMessages.reviews.writeReviewComingSoon}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            className="h-11 min-w-0 flex-1 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: productTokens.ink }}
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!submitEnabled}
            aria-busy={isSubmitting}
          >
            {productMessages.reviews.submitReview}
          </button>
        </div>
      </div>
    </div>
  );
}
