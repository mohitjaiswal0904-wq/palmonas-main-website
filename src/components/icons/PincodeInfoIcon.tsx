interface PincodeInfoIconProps {
  className?: string;
}

export function PincodeInfoIcon({
  className = 'h-[17px] w-[17px] shrink-0',
}: PincodeInfoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.7915 4.95866H9.20817V6.37533H7.7915V4.95866ZM7.7915 7.79199H9.20817V12.042H7.7915V7.79199ZM8.49984 1.41699C4.58984 1.41699 1.4165 4.59033 1.4165 8.50033C1.4165 12.4103 4.58984 15.5837 8.49984 15.5837C12.4098 15.5837 15.5832 12.4103 15.5832 8.50033C15.5832 4.59033 12.4098 1.41699 8.49984 1.41699ZM8.49984 14.167C5.37609 14.167 2.83317 11.6241 2.83317 8.50033C2.83317 5.37658 5.37609 2.83366 8.49984 2.83366C11.6236 2.83366 14.1665 5.37658 14.1665 8.50033C14.1665 11.6241 11.6236 14.167 8.49984 14.167Z"
        fill="#502C3A"
      />
    </svg>
  );
}
