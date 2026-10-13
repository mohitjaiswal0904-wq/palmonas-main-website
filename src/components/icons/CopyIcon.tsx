interface CopyIconProps {
  className?: string;
}

export function CopyIcon({ className = 'h-3.5 w-3.5 text-[#34a853]' }: CopyIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.0269 0.789551H3.55267C2.6842 0.789551 1.97363 1.50012 1.97363 2.36859V13.4219H3.55267V2.36859H13.0269V0.789551ZM15.3955 3.94763H6.71076C5.84228 3.94763 5.13172 4.6582 5.13172 5.52667V16.58C5.13172 17.4484 5.84228 18.159 6.71076 18.159H15.3955C16.264 18.159 16.9745 17.4484 16.9745 16.58V5.52667C16.9745 4.6582 16.264 3.94763 15.3955 3.94763ZM15.3955 16.58H6.71076V5.52667H15.3955V16.58Z"
        fill="#151515"
      />
    </svg>
  );
}
