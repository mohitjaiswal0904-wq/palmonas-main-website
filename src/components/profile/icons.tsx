/**
 * Icons used across the account / profile area. Single-colour, inherit
 * `currentColor`, and accept a `className` for sizing/colour overrides.
 */

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function BackArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function HistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export function PlanIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M12 14v4M10 16h4" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

export function WalletIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6" />
      <path d="M16 12h.01" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 3 14h7l-1 8 10-12h-7Z" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

export function ArrowDownReceiveIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

export function ArrowUpPayIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
