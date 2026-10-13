'use client';

import { useState } from 'react';

import { productTheme, sizeGuideContent } from '@/config/product/product.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';

type SizeGuideMode = 'ring' | 'finger';

/** Static ring size guide body for gold + demifine PDP sheets. */
export function SizeGuideContent() {
  const [mode, setMode] = useState<SizeGuideMode>('ring');
  const instructions =
    mode === 'ring' ? sizeGuideContent.instructionsRing : sizeGuideContent.instructionsFinger;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex gap-3">
        <button
          type="button"
          className={cn(
            'flex-1 rounded-md border px-2 py-2 text-center text-sm font-semibold',
            mode === 'ring' ? 'text-white' : '',
          )}
          style={
            mode === 'ring'
              ? {
                  backgroundColor: productTheme.ink,
                  borderColor: productTheme.ink,
                }
              : {
                  backgroundColor: productTheme.stickyBarBg,
                  borderColor: productTheme.chipBorderIdle,
                  color: productTheme.ink,
                }
          }
          aria-pressed={mode === 'ring'}
          onClick={() => setMode('ring')}
        >
          {sizeGuideContent.measureRing}
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 rounded-md border px-2 py-2 text-center text-sm font-semibold',
            mode === 'finger' ? 'text-white' : '',
          )}
          style={
            mode === 'finger'
              ? {
                  backgroundColor: productTheme.ink,
                  borderColor: productTheme.ink,
                }
              : {
                  backgroundColor: productTheme.stickyBarBg,
                  borderColor: productTheme.chipBorderIdle,
                  color: productTheme.ink,
                }
          }
          aria-pressed={mode === 'finger'}
          onClick={() => setMode('finger')}
        >
          {sizeGuideContent.measureFinger}
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold" style={{ color: productTheme.titleMuted }}>
          {sizeGuideContent.instructionsLabel}
        </p>
        <ol
          className="mt-1 list-decimal space-y-1 pl-4 text-sm"
          style={{ color: productTheme.titleMuted }}
        >
          {instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm font-semibold" style={{ color: productTheme.titleMuted }}>
          {sizeGuideContent.chartHint}
        </p>
      </div>

      <div className={cn('overflow-x-auto', HORIZONTAL_SCROLL_PASS_VERTICAL)}>
        <table className="w-full min-w-[300px] border-collapse text-center text-sm">
          <caption className="sr-only">{sizeGuideContent.title}</caption>
          <thead>
            <tr>
              {sizeGuideContent.columns.map((column) => (
                <th
                  key={column}
                  className="border px-1 py-2 text-xs font-semibold"
                  style={{
                    backgroundColor: productTheme.stickyBarBg,
                    borderColor: productTheme.chipBorderIdle,
                    color: productTheme.titleMuted,
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeGuideContent.rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell) => (
                  <td
                    key={`${row[0]}-${cell}`}
                    className="border px-1 py-2"
                    style={{
                      borderColor: productTheme.chipBorderIdle,
                      color: productTheme.titleMuted,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
