'use client';

import { useEffect } from 'react';

import { logPalmonasConsoleArt } from '@/lib/console/palmonas-console-art';

const CONSOLE_ART_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Periodically logs Palmonas ASCII art in the browser console (all environments).
 */
export function PalmonasConsoleArtLogger() {
  // Surface brand art in devtools on load and every five minutes.
  useEffect(() => {
    logPalmonasConsoleArt();

    const timer = window.setInterval(logPalmonasConsoleArt, CONSOLE_ART_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
