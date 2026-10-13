'use client';

import { useEffect, useState } from 'react';

import { AddToCartFlyChip } from '@/components/cart/AddToCartFlyChip';
import { cartTheme } from '@/config/cart/cart.config';
import { subscribeAddToCartFlight, type AddToCartFlight } from '@/lib/cart/add-to-cart-flight';

/**
 * Overlay that draws collection add-to-cart fly chips.
 */
export function AddToCartFlyLayer() {
  const [flights, setFlights] = useState<AddToCartFlight[]>([]);

  useEffect(() => {
    return subscribeAddToCartFlight((flight) => {
      if (flight.reducedMotion) {
        return;
      }

      setFlights((current) => [...current, flight]);
      window.setTimeout(() => {
        setFlights((current) => current.filter((item) => item.id !== flight.id));
      }, cartTheme.addToCartFlight.durationMs);
    });
  }, []);

  if (flights.length === 0) {
    return null;
  }

  return (
    <div
      className={cartTheme.addToCartFlight.layerClass}
      aria-hidden="true"
      data-testid="add-to-cart-fly-layer"
    >
      {flights.map((flight) => (
        <AddToCartFlyChip key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
