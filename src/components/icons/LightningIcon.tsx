'use client';

import { useId } from 'react';

interface LightningIconProps {
  className?: string;
}

export function LightningIcon({ className = 'h-4 w-3 shrink-0' }: LightningIconProps) {
  const uid = useId().replace(/:/g, '');
  const fillId = `lightning-fill-${uid}`;
  const shineId = `lightning-shine-${uid}`;

  return (
    <svg viewBox="0 0 12 16" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="45%" stopColor="#F5B942" />
          <stop offset="100%" stopColor="#C98B1F" />
        </linearGradient>
        <linearGradient id={shineId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#F5B942" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path fill={`url(#${fillId})`} d="M7.2 0 3.5 9h2.8L4.8 16 8.5 7H5.7L7.2 0Z" />
      <path fill={`url(#${shineId})`} d="M7.2 0 3.5 9h2.8L4.8 16 8.5 7H5.7L7.2 0Z" opacity="0.55" />
    </svg>
  );
}
