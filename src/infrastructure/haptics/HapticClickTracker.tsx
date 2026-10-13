'use client';

import { useEffect } from 'react';

import {
  triggerButtonHaptic,
  unlockHapticsAudio,
} from '@/infrastructure/haptics/web-haptics/adapter';
import { findHapticClickTarget } from '@/lib/haptics/find-haptic-click-target';

/**
 * Unlocks audio on the first tap, then vibrates on commerce clicks.
 */
export function HapticClickTracker() {
  // pointerdown unlocks AudioContext in the gesture. click (not pointerdown)
  // is when Chrome grants vibrate / autoplay activation.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      if (event.button > 0) {
        return;
      }

      unlockHapticsAudio();
    };

    const handleClick = (event: MouseEvent): void => {
      if (event.button > 0) {
        return;
      }

      if (!findHapticClickTarget(event.target)) {
        return;
      }

      triggerButtonHaptic();
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return null;
}
