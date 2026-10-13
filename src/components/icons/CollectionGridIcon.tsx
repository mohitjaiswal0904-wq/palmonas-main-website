import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function CollectionGridIcon({ className = 'h-4 w-4', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true" {...props}>
      <rect
        x="0.75"
        y="0.75"
        width="7.73077"
        height="7.73077"
        rx="2.32692"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.5195"
        y="0.75"
        width="7.73077"
        height="7.73077"
        rx="2.32692"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="0.75"
        y="11.5195"
        width="7.73077"
        height="7.73077"
        rx="2.32692"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.5195"
        y="11.5195"
        width="7.73077"
        height="7.73077"
        rx="2.32692"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
