'use client';

import { useId } from 'react';

export const GOLD_USP_ICON_CLASS = 'block h-full w-full';

export function useGoldUspIconIds(): { paint0: string; paint1: string } {
  const uid = useId().replace(/:/g, '');

  return {
    paint0: `gold-usp-p0-${uid}`,
    paint1: `gold-usp-p1-${uid}`,
  };
}
