import { productMessages, productTheme } from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';

/** Mobile ribbon path (Figma 963:61942) — flat, no rotate. */
const RIBBON_PATH_MOBILE =
  'M3.35802 24.0454L-6.7732e-05 5.37714e-05L90.1823 3.68326e-05L96.6515 8.68079L90.1823 17.5L9.00056 17.5L9.00056 34.5L3.35802 24.0454Z';

/** Desktop ribbon path (Figma 960:33505) — flat, no rotate. */
const RIBBON_PATH_DESKTOP =
  'M4.85009 34.7322L-0.000477356 3.57337e-05L130.263 1.42024e-05L139.607 12.5389L130.263 25.2778L13.0004 25.2778L13.0004 49.8333L4.85009 34.7322Z';

/** PW-621: render ~85% of Figma chrome so bar + ribbon stay proportional. */
const RIBBON_DISPLAY_SCALE = 0.85;

/**
 * foldX / bandY / width / height = display px after {@link RIBBON_DISPLAY_SCALE}.
 * viewWidth / viewHeight = Figma path viewBox (unscaled).
 */
export const LIMITED_OFFER_RIBBON_GEOMETRY = {
  mobile: {
    viewWidth: 97,
    viewHeight: 35,
    foldX: 9 * RIBBON_DISPLAY_SCALE,
    bandY: 17.5 * RIBBON_DISPLAY_SCALE,
    width: 97 * RIBBON_DISPLAY_SCALE,
    height: 35 * RIBBON_DISPLAY_SCALE,
  },
  desktop: {
    viewWidth: 140,
    viewHeight: 50,
    foldX: 13 * RIBBON_DISPLAY_SCALE,
    bandY: 25.28 * RIBBON_DISPLAY_SCALE,
    width: 140 * RIBBON_DISPLAY_SCALE,
    height: 50 * RIBBON_DISPLAY_SCALE,
  },
} as const;

interface LimitedOfferRibbonProps {
  className?: string;
}

/**
 * Flat Figma ribbon with label inside SVG.
 * Left-aligned to the offer shell (same as price/title). Parent insets the cream
 * bar by {@link LIMITED_OFFER_RIBBON_GEOMETRY} foldX so the fold wall hits the
 * bar corner.
 */
export function LimitedOfferRibbon({ className }: LimitedOfferRibbonProps) {
  const fill = productTheme.limitedOffer.ribbon;
  const label = productMessages.limitedTimeOffer;
  const { mobile, desktop } = LIMITED_OFFER_RIBBON_GEOMETRY;

  return (
    <>
      {/* Mobile — Figma 963:61942 · left edge = content column */}
      <div
        className={cn('laptop:hidden pointer-events-none absolute top-0 left-0 z-[2]', className)}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${mobile.viewWidth} ${mobile.viewHeight}`}
          width={mobile.width}
          height={mobile.height}
          fill="none"
        >
          <path d={RIBBON_PATH_MOBILE} fill={fill} />
          <text
            x="14"
            y="9.5"
            fill="#FFFFFF"
            fontSize="9"
            fontFamily="inherit"
            dominantBaseline="middle"
          >
            {label}
          </text>
        </svg>
      </div>

      {/* Desktop — Figma 960:33505 · left edge = content column */}
      <div
        className={cn(
          'laptop:block pointer-events-none absolute top-0 left-0 z-[2] hidden',
          className,
        )}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${desktop.viewWidth} ${desktop.viewHeight}`}
          width={desktop.width}
          height={desktop.height}
          fill="none"
        >
          <path d={RIBBON_PATH_DESKTOP} fill={fill} />
          <text
            x="20"
            y="13.5"
            fill="#FFFFFF"
            fontSize="12"
            fontFamily="inherit"
            dominantBaseline="middle"
          >
            {label}
          </text>
        </svg>
      </div>
    </>
  );
}
