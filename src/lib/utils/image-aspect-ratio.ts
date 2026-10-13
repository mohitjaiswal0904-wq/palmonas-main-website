export interface ImageIntrinsicDimensions {
  width: number;
  height: number;
}

function toPositiveDimension(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

/** CSS `aspect-ratio` value from pixel dimensions, e.g. `800 / 600`. */
export function formatImageAspectRatio(width: number, height: number): string | undefined {
  if (width <= 0 || height <= 0) {
    return undefined;
  }

  return `${width} / ${height}`;
}

export function getImageDimensionsFromRecord(
  record: Record<string, unknown> | undefined,
): ImageIntrinsicDimensions | undefined {
  if (!record) {
    return undefined;
  }

  const width = toPositiveDimension(
    record.image_width ?? record.imageWidth ?? record.width ?? record.naturalWidth,
  );
  const height = toPositiveDimension(
    record.image_height ?? record.imageHeight ?? record.height ?? record.naturalHeight,
  );

  if (!width || !height) {
    return undefined;
  }

  return { width, height };
}

export function resolveImageAspectRatio(
  dimensions: ImageIntrinsicDimensions | undefined,
): string | undefined {
  if (!dimensions) {
    return undefined;
  }

  return formatImageAspectRatio(dimensions.width, dimensions.height);
}
