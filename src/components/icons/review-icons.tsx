import { forwardRef } from 'react';

interface ReviewIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/** Figma 20px gold filled star for review summary. */
export const ReviewStarFilled20Icon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewStarFilled20Icon({ className = 'h-5 w-5 shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M10 1.66667L12.4167 6.88333L17.9167 7.66667L13.9583 11.5333L14.9167 17.5L10 14.3917L5.08333 17.5L6.04167 11.5333L2.08333 7.66667L7.58333 6.88333L10 1.66667Z"
          fill="#F5B301"
        />
      </svg>
    );
  },
);

/** Figma 12px gold filled star for distribution rows. */
export const ReviewStarFilled12Icon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewStarFilled12Icon({ className = 'h-3 w-3 shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M6 1L7.45 4.13L10.75 4.6L8.375 6.92L8.95 10.5L6 8.635L3.05 10.5L3.625 6.92L1.25 4.6L4.55 4.13L6 1Z"
          fill="#F5B301"
        />
      </svg>
    );
  },
);

/** Figma 13px gold filled star for review card rows. */
export const ReviewStarFilled13Icon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewStarFilled13Icon({ className = 'h-[13px] w-[13px] shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M6.5 1.08333L8.07083 4.47417L11.6458 4.98333L9.07292 7.49667L9.69583 11.375L6.5 9.35458L3.30417 11.375L3.92708 7.49667L1.35417 4.98333L4.92917 4.47417L6.5 1.08333Z"
          fill="#F5B301"
        />
      </svg>
    );
  },
);

/** Figma sort dropdown chevron for reviews header. */
export const ReviewSortChevronIcon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewSortChevronIcon({ className = 'h-4 w-4 shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="#151515"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);

/** Outline star for write-review rating input (Figma empty state). */
export const ReviewStarOutline30Icon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewStarOutline30Icon({ className = 'h-[30px] w-[30px] shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M15 2.5L18.09 10.26L26.5 11.27L20.25 16.97L21.18 25.5L15 21.27L8.82 25.5L9.75 16.97L3.5 11.27L11.91 10.26L15 2.5Z"
          stroke="#C4C4C4"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);

/** Filled 30px gold star for write-review selected rating. */
export const ReviewStarFilled30Icon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewStarFilled30Icon({ className = 'h-[30px] w-[30px] shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M15 2.5L18.09 10.26L26.5 11.27L20.25 16.97L21.18 25.5L15 21.27L8.82 25.5L9.75 16.97L3.5 11.27L11.91 10.26L15 2.5Z"
          fill="#F5B301"
        />
      </svg>
    );
  },
);

/** Figma thumbs up icon; rotate 180° for not-helpful. */
export const ReviewThumbsIcon = forwardRef<SVGSVGElement, ReviewIconProps>(
  function ReviewThumbsIcon({ className = 'h-4 w-4 shrink-0', ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M4.66667 6.66667V14"
          stroke="#8A8A8A"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.8 2.2L9.33333 4C9.2 4.46667 9.33333 5 9.6 5.4C9.86667 5.8 10.3333 6 10.8 6H13.3333C13.5266 5.99781 13.718 6.03767 13.8944 6.11681C14.0707 6.19595 14.2277 6.31249 14.3546 6.45834C14.4814 6.6042 14.575 6.77588 14.6289 6.9615C14.6828 7.14712 14.6957 7.34224 14.6667 7.53333L13.7333 11.5333C14.0604 11.7101 14.3039 12.0097 14.4102 12.366C14.5164 12.7223 14.4768 13.1062 14.3 13.4333C14.1232 13.7604 13.8237 14.0039 13.4674 14.1102C13.111 14.2164 12.7271 14.1768 12.4 14H4.66667V6.66667L6.73333 2.06667C6.75101 1.66 6.92952 1.27702 7.22958 1.00196C7.52963 0.726909 7.92667 0.582319 8.33333 0.6C8.74 0.617681 9.12298 0.796185 9.39804 1.09624C9.67309 1.3963 9.81768 1.79333 9.8 2.2Z"
          stroke="#8A8A8A"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);
