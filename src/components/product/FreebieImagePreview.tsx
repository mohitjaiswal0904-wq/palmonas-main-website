'use client';

import { AuthModalShell } from '@/components/auth/AuthModalShell';
import { productMessages } from '@/config/product/product.config';

interface FreebieImagePreviewProps {
  open: boolean;
  src: string;
  onClose: () => void;
}

/**
 * Full-size freebie image dialog opened from offer thumbs.
 */
export function FreebieImagePreview({ open, src, onClose }: FreebieImagePreviewProps) {
  return (
    <AuthModalShell
      open={open}
      onClose={onClose}
      aria-label={productMessages.a11y.enlargeFreebieImage}
      className="max-w-[min(92vw,28rem)] overflow-hidden p-3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS/CDN freebie URLs */}
      <img
        src={src}
        alt=""
        className="mx-auto max-h-[min(80vh,32rem)] w-full object-contain"
        data-testid="freebie-image-preview"
      />
      <button
        type="button"
        className="mt-3 text-sm underline"
        aria-label={productMessages.a11y.closeFreebieImage}
        onClick={onClose}
      >
        {productMessages.a11y.closeFreebieImage}
      </button>
    </AuthModalShell>
  );
}
