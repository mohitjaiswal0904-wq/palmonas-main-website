/**
 * Strips unsafe characters from a Spotify pixel id before script embedding.
 *
 * @param pixelId - Raw Spotify pixel id from env.
 * @returns Sanitized pixel id.
 */
export function sanitizeSpotifyPixelId(pixelId: string): string {
  return pixelId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Builds the Spotify Ads pixel base inline script.
 *
 * @param pixelId - Spotify pixel id from Ads Manager.
 * @returns Inline script body for Next.js Script.
 * @see https://adshelp.spotify.com/HelpCenter/s/article/Install-and-Verify-the-Spotify-Pixel-US
 */
export function buildSpotifyBootstrapScript(pixelId: string): string {
  const safePixelId = sanitizeSpotifyPixelId(pixelId);

  if (!safePixelId) {
    return '';
  }

  return `
(function(s,p,o,t,i,f,y){s['SpotifyPixelObject']=i;s[i]=s[i]||function(){(s[i].q=s[i].q||[]).push(arguments)};s[i].l=1*new Date();f=p.createElement(o);y=p.getElementsByTagName(o)[0];f.async=1;f.src=t;y.parentNode.insertBefore(f,y)})(window,document,'script','https://pixel.spotify.com/v1/pixel.js','spotify');
spotify('init','${safePixelId}');
spotify('track','PageView');
`.trim();
}

/** DOM id for the Spotify pixel bootstrap script tag. */
export const spotifyBootstrapScriptId = 'palmonas-analytics-spotify-pixel';
