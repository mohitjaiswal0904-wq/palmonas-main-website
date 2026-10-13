'use client';

import { useLayoutEffect, useRef } from 'react';

import { cartTheme } from '@/config/cart/cart.config';
import type { AddToCartFlight } from '@/lib/cart/add-to-cart-flight';
import { runCardFlightAnimation } from '@/lib/cart/run-card-flight';
import { cn } from '@/lib/utils/cn';

interface AddToCartFlyChipProps {
  flight: AddToCartFlight;
}

/**
 * One product-card clone that eases into the bag on a single continuous curve.
 */
export function AddToCartFlyChip({ flight }: AddToCartFlyChipProps) {
  const chipRef = useRef<HTMLSpanElement>(null);

  // Drive transform from rAF so the path does not hitch on CSS keyframe stops.
  useLayoutEffect(() => {
    const chip = chipRef.current;
    if (!chip) {
      return undefined;
    }

    return runCardFlightAnimation(chip, flight, cartTheme.addToCartFlight.durationMs);
  }, [flight]);

  return (
    <span
      ref={chipRef}
      className={cn(cartTheme.addToCartFlight.chipClass)}
      data-testid="add-to-cart-fly-chip"
      style={{
        left: flight.fromLeft,
        top: flight.fromTop,
        width: flight.fromWidth,
        height: flight.fromHeight,
        backgroundImage: flight.imageUrl ? `url(${flight.imageUrl})` : undefined,
        backgroundColor: flight.imageUrl ? undefined : cartTheme.checkoutCta,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
