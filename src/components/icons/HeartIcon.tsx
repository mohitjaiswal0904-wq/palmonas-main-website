interface HeartIconProps {
  filled?: boolean;
  className?: string;
}

export function HeartIcon({ filled = false, className = 'h-6 w-6' }: HeartIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32.6612 10.7098C32.0259 10.0621 31.2716 9.54822 30.4414 9.19765C29.6112 8.84707 28.7213 8.66663 27.8227 8.66663C26.924 8.66663 26.0342 8.84707 25.2039 9.19765C24.3737 9.54822 23.6194 10.0621 22.9841 10.7098L21.6657 12.0535L20.3472 10.7098C19.064 9.40202 17.3235 8.6673 15.5087 8.6673C13.6939 8.6673 11.9534 9.40202 10.6702 10.7098C9.38694 12.0176 8.66602 13.7914 8.66602 15.6409C8.66602 17.4904 9.38694 19.2641 10.6702 20.5719L11.9887 21.9156L21.6657 31.7777L31.3427 21.9156L32.6612 20.5719C33.2968 19.9245 33.801 19.1558 34.145 18.3097C34.489 17.4636 34.666 16.5567 34.666 15.6409C34.666 14.725 34.489 13.8182 34.145 12.9721C33.801 12.126 33.2968 11.3573 32.6612 10.7098V10.7098Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.44444"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
