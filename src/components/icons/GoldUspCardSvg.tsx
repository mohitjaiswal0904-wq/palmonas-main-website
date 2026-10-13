'use client';

import type { ReactNode } from 'react';

import { GOLD_USP_ICON_CLASS, useGoldUspIconIds } from '@/hooks/useGoldUspIconIds';

interface GoldUspCardSvgProps {
  className?: string;
  children: ReactNode;
}

export function GoldUspCardSvg({ className = GOLD_USP_ICON_CLASS, children }: GoldUspCardSvgProps) {
  const { paint0, paint1 } = useGoldUspIconIds();

  return (
    <svg
      className={className}
      viewBox="0 0 125 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="124.583" height="94.3242" rx="11.5556" fill="#FFBEA2" fillOpacity="0.1" />
      <rect
        width="124.583"
        height="94.3242"
        rx="11.5556"
        fill={`url(#${paint0})`}
        fillOpacity="0.1"
      />
      <rect
        x="0.361111"
        y="0.361111"
        width="123.861"
        height="93.602"
        rx="11.1944"
        stroke={`url(#${paint1})`}
        strokeOpacity="0.2"
        strokeWidth="0.722222"
      />
      {children}
      <defs>
        <linearGradient
          id={paint0}
          x1="0"
          y1="47.1621"
          x2="94.7967"
          y2="46.7862"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DB5014" />
          <stop offset="0.576923" stopColor="#C1B7FF" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id={paint1}
          x1="-9.83553"
          y1="77.8406"
          x2="142.012"
          y2="32.3613"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF4C00" />
          <stop offset="1" stopColor="#2200FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
