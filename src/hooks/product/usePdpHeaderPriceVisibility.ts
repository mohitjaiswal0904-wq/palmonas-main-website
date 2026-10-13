'use client';

import { useEffect, useState } from 'react';

import { productTheme } from '@/config/product/product.config';
import {
  PRODUCT_PDP_PRICE_ID,
  readPdpHeaderPriceFromElement,
  type PdpHeaderPriceReading,
} from '@/lib/product/pdp-header-price';

interface PdpHeaderPriceVisibility extends PdpHeaderPriceReading {
  isHeaderPriceVisible: boolean;
}

/**
 * Tracks whether the PDP header price is in view and mirrors its current amounts.
 *
 * @returns Visibility plus the selling / compare-at values from the header node.
 */
export function usePdpHeaderPriceVisibility(): PdpHeaderPriceVisibility {
  const [isHeaderPriceVisible, setIsHeaderPriceVisible] = useState(true);
  const [reading, setReading] = useState<PdpHeaderPriceReading>({
    price: null,
    compareAtPrice: null,
  });

  useEffect(() => {
    const element = document.getElementById(PRODUCT_PDP_PRICE_ID);

    if (!element || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const syncReading = (): void => {
      setReading(readPdpHeaderPriceFromElement(element));
    };

    syncReading();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        setIsHeaderPriceVisible(entry.isIntersecting);
        syncReading();
      },
      {
        root: null,
        threshold: 0,
        rootMargin: productTheme.pdpRhythm.stickyBarPriceRootMargin,
      },
    );

    intersectionObserver.observe(element);

    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(syncReading);

    mutationObserver?.observe(element, {
      attributes: true,
      attributeFilter: ['data-selling-price', 'data-compare-at-price'],
    });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  return {
    isHeaderPriceVisible,
    price: reading.price,
    compareAtPrice: reading.compareAtPrice,
  };
}
