interface WalletTransactionIconProps {
  type: 'credit' | 'debit';
}

export function WalletTransactionIcon({ type }: WalletTransactionIconProps) {
  const isCredit = type === 'credit';

  return (
    <span
      className={
        isCredit
          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#2E7D32]'
          : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E0] text-[#E65100]'
      }
      aria-hidden="true"
    >
      {isCredit ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 3v10M8 13l-3.5-3.5M8 13l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 13V3M8 3L4.5 6.5M8 3l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
