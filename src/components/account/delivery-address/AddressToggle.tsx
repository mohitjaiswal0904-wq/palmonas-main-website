interface AddressToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function AddressToggle({
  checked,
  onChange,
  label = 'Set As Default',
  disabled = false,
}: AddressToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-normal text-[#757575]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={
          checked
            ? 'relative h-7 w-12 rounded-full bg-[#151515] transition-colors disabled:opacity-50'
            : 'relative h-7 w-12 rounded-full bg-[#D6D6D6] transition-colors disabled:opacity-50'
        }
        onClick={() => onChange(!checked)}
      >
        <span
          className={
            checked
              ? 'absolute top-0.5 left-[22px] h-6 w-6 rounded-full bg-white transition-all'
              : 'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-all'
          }
        />
      </button>
    </div>
  );
}
