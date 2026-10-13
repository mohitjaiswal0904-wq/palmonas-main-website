/** True when running a production Next.js server (`next build` / `next start`). */
export function isNextProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}
