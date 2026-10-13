'use client';

import { useEffect, useState } from 'react';

import { minWidthQuery, type Breakpoint } from '@/config/breakpoints';

export function useMediaQuery(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = minWidthQuery(breakpoint);
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return matches;
}
