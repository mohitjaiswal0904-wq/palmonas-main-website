interface BestsellerBoltIconProps {
  className?: string;
}

const BESTSELLER_BOLT_GRADIENT_ID = 'bestseller-bolt-gradient';

export function BestsellerBoltIcon({ className }: BestsellerBoltIconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={BESTSELLER_BOLT_GRADIENT_ID} x1="4" x2="14" y1="1" y2="17">
          <stop stopColor="#fff2a8" />
          <stop offset="0.42" stopColor="#f8c545" />
          <stop offset="1" stopColor="#e58a12" />
        </linearGradient>
      </defs>
      <path
        d="M10.7 1.1 4.4 9.9h4.2l-1.2 7 6.2-9.8H9.8l.9-6Z"
        fill={`url(#${BESTSELLER_BOLT_GRADIENT_ID})`}
      />
      <path
        d="M8.8 3.4 5.8 8h2.6"
        fill="none"
        stroke="#fff8c9"
        strokeLinecap="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}
