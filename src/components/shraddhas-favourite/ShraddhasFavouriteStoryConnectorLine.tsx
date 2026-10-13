import { SHRADDHAS_FAVOURITE_STORY_CONNECTOR_STROKE } from '@/components/shraddhas-favourite/shraddhas-favourite-constants';

interface ConnectorPathProps {
  d: string;
  wrapperClassName: string;
  viewBox: string;
}

/**
 * Stretch a decorative path to the wrapper size.
 * SVG is replaced-content and will not honor top/bottom alone — the wrapper provides height.
 */
function ConnectorPath({ d, wrapperClassName, viewBox }: ConnectorPathProps) {
  return (
    <div className={wrapperClassName} aria-hidden="true">
      <svg className="h-full w-full" viewBox={viewBox} preserveAspectRatio="none">
        <path
          d={d}
          fill="none"
          stroke={SHRADDHAS_FAVOURITE_STORY_CONNECTOR_STROKE}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Decorative connector behind milestone cards — scales to the full milestone stack height. */
export function ShraddhasFavouriteStoryConnectorLine() {
  return (
    <>
      <ConnectorPath
        wrapperClassName="tab:hidden pointer-events-none absolute inset-y-0 left-1/2 z-0 w-12 -translate-x-1/2"
        viewBox="0 0 48 1000"
        d="M 24 0 C 36 70 12 150 24 250 S 12 400 24 500 S 36 620 24 750 S 12 880 24 1000"
      />
      <ConnectorPath
        wrapperClassName="tab:block laptop:hidden pointer-events-none absolute inset-x-0 inset-y-0 z-0 hidden"
        viewBox="0 0 400 400"
        d="M 90 45 C 150 85, 210 25, 310 50 S 340 175, 90 195 S 220 315, 310 305"
      />
      <ConnectorPath
        wrapperClassName="laptop:block pointer-events-none absolute inset-x-0 top-[56px] z-0 hidden h-[200px]"
        viewBox="0 0 1200 200"
        d="M 40 75 C 180 125, 280 35, 420 90 S 700 145, 860 60 S 1040 30, 1160 80"
      />
    </>
  );
}
