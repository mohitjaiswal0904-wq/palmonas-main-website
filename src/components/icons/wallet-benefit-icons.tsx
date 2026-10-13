interface WalletBenefitIconProps {
  className?: string;
}

/**
 * Wallet-benefit sheet icons (PDP cashback banner).
 * Each icon ships its own tinted disc, so render them without a background wrapper.
 */

/** Coins with transfer arrow — instant credit row. */
export function WalletInstantCreditIcon({ className = 'h-10 w-10' }: WalletBenefitIconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M0 19.9964C0 8.95271 8.95271 0 19.9964 0C31.0402 0 39.9929 8.95271 39.9929 19.9964C39.9929 31.0402 31.0402 39.9929 19.9964 39.9929C8.95271 39.9929 0 31.0402 0 19.9964Z"
        fill="#FFF4E6"
      />
      <g clipPath="url(#wallet-instant-credit-clip)">
        <path
          d="M16.6596 21.6628C19.4205 21.6628 21.6587 19.4246 21.6587 16.6637C21.6587 13.9028 19.4205 11.6646 16.6596 11.6646C13.8986 11.6646 11.6605 13.9028 11.6605 16.6637C11.6605 19.4246 13.8986 21.6628 16.6596 21.6628Z"
          stroke="#FF9900"
          strokeWidth="1.66637"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.0664 18.6383C25.854 18.932 26.5549 19.4195 27.1041 20.0557C27.6534 20.692 28.0334 21.4565 28.2089 22.2786C28.3845 23.1006 28.3499 23.9536 28.1084 24.7588C27.8669 25.5639 27.4262 26.2951 26.8273 26.8849C26.2283 27.4746 25.4902 27.9037 24.6814 28.1326C23.8726 28.3616 23.0192 28.3828 22.2 28.1945C21.3808 28.0062 20.6223 27.6143 19.9946 27.0552C19.367 26.496 18.8905 25.7876 18.6092 24.9955"
          stroke="#FF9900"
          strokeWidth="1.66637"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.8264 14.9973H16.6596V18.33"
          stroke="#FF9900"
          strokeWidth="1.66637"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.9166 21.5628L24.4998 22.1544L22.1502 24.5039"
          stroke="#FF9900"
          strokeWidth="1.66637"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="wallet-instant-credit-clip">
          <rect
            width="19.9964"
            height="19.9964"
            fill="white"
            transform="translate(9.99409 9.99823)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Rupee glyph — coin-to-rupee conversion rate row. */
export function WalletConversionRateIcon({ className = 'h-10 w-10' }: WalletBenefitIconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M0 19.9964C0 8.95271 8.95271 0 19.9964 0C31.0402 0 39.9929 8.95271 39.9929 19.9964C39.9929 31.0402 31.0402 39.9929 19.9964 39.9929C8.95271 39.9929 0 31.0402 0 19.9964Z"
        fill="#F0F9FF"
      />
      <path
        d="M19.952 24.8753L15.8739 20.8362V19.2347H18.2567C18.9807 19.2347 19.5223 19.0836 19.8817 18.7816C20.2411 18.4795 20.4208 18.0394 20.4208 17.4612V17.4456C20.4208 16.8519 20.2411 16.4092 19.8817 16.1175C19.5223 15.8206 18.9807 15.6722 18.2567 15.6722H15.8739V14.3362H19.0458C19.8062 14.3362 20.4572 14.4586 20.9989 14.7034C21.5406 14.9482 21.9572 15.305 22.2489 15.7737C22.5406 16.2425 22.6864 16.8128 22.6864 17.4847V17.5003C22.6864 18.167 22.5406 18.7477 22.2489 19.2425C21.9572 19.7321 21.5354 20.1149 20.9833 20.3909C20.4364 20.6618 19.7775 20.7972 19.0067 20.7972H17.7958L18.288 20.2816L23.0223 24.8753H19.952ZM15.8739 17.8441V17.0628H24.0536V17.8441H15.8739ZM15.8739 14.93V14.0706H24.0536V14.93H15.8739Z"
        fill="#0066CC"
      />
    </svg>
  );
}

/** Check inside a circle — how to redeem row. */
export function WalletRedeemIcon({ className = 'h-10 w-10' }: WalletBenefitIconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M0 19.9964C0 8.95271 8.95271 0 19.9964 0C31.0402 0 39.9929 8.95271 39.9929 19.9964C39.9929 31.0402 31.0402 39.9929 19.9964 39.9929C8.95271 39.9929 0 31.0402 0 19.9964Z"
        fill="#F0FDF4"
      />
      <path
        d="M17.4927 19.9964L19.1591 21.6628L22.4918 18.3301M27.4909 19.9964C27.4909 20.9812 27.297 21.9563 26.9201 22.866C26.5433 23.7758 25.9909 24.6025 25.2946 25.2988C24.5983 25.9951 23.7717 26.5474 22.8619 26.9243C21.9521 27.3011 20.977 27.4951 19.9923 27.4951C19.0076 27.4951 18.0325 27.3011 17.1227 26.9243C16.2129 26.5474 15.3863 25.9951 14.6899 25.2988C13.9936 24.6025 13.4413 23.7758 13.0644 22.866C12.6876 21.9563 12.4936 20.9812 12.4936 19.9964C12.4936 18.0077 13.2837 16.1003 14.6899 14.6941C16.0962 13.2878 18.0035 12.4978 19.9923 12.4978C21.9811 12.4978 23.8884 13.2878 25.2946 14.6941C26.7009 16.1003 27.4909 18.0077 27.4909 19.9964Z"
        stroke="#008236"
        strokeWidth="1.66637"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wallet card — where the balance reflects row. */
export function WalletReflectsIcon({ className = 'h-10 w-10' }: WalletBenefitIconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M0 19.9964C0 8.95271 8.95271 0 19.9964 0C31.0402 0 39.9929 8.95271 39.9929 19.9964C39.9929 31.0402 31.0402 39.9929 19.9964 39.9929C8.95271 39.9929 0 31.0402 0 19.9964Z"
        fill="#FAF5FF"
      />
      <path
        d="M12.4936 18.3301H27.4909M15.8264 22.496H16.6596M19.9923 22.496H20.8255M14.9932 25.8287H24.9914C25.6543 25.8287 26.2901 25.5654 26.7588 25.0966C27.2276 24.6279 27.4909 23.9921 27.4909 23.3292V16.6637C27.4909 16.0008 27.2276 15.365 26.7588 14.8963C26.2901 14.4275 25.6543 14.1642 24.9914 14.1642H14.9932C14.3303 14.1642 13.6945 14.4275 13.2257 14.8963C12.757 15.365 12.4936 16.0008 12.4936 16.6637V23.3292C12.4936 23.9921 12.757 24.6279 13.2257 25.0966C13.6945 25.5654 14.3303 25.8287 14.9932 25.8287Z"
        stroke="#9333EA"
        strokeWidth="1.66637"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
