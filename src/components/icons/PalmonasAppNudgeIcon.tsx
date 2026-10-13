import { cn } from '@/lib/utils/cn';

interface PalmonasAppNudgeIconProps {
  className?: string;
}

/** Palmonas app mark for the mobile download nudge (white glyph on black circle). */
export function PalmonasAppNudgeIcon({ className }: PalmonasAppNudgeIconProps) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-black p-1.5',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 331 303"
        fill="none"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M156.874 0V86.1977L139.974 113.599C133.964 123.357 135.166 122.155 125.16 127.741L81.5307 152.207L124.771 176.709C135.448 182.755 134.07 181.659 140.434 192.159C145.914 201.14 151.394 210.12 156.874 219.136V303C69.4743 298.899 0 232.606 0 151.5C0 70.3936 69.4743 4.10128 156.874 0Z"
          fill="white"
        />
        <path
          d="M331.002 151.5C331.002 232.606 261.528 298.863 174.163 303V218.605L190.781 191.594C197.463 180.739 196.544 182.26 207.681 176.037L249.471 152.596L205.701 127.812C195.907 122.261 197.074 123.392 191.24 113.775L174.163 85.7027V0C261.528 4.10128 331.002 70.3936 331.002 151.5Z"
          fill="white"
        />
      </svg>
    </span>
  );
}
